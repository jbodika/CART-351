# main.py
from flask import Flask, render_template, request
from flask_pymongo import PyMongo
from flask_socketio import SocketIO, emit
from bson.objectid import ObjectId
from dotenv import load_dotenv
from datetime import datetime, timezone
import os
import time

# Environment variables
load_dotenv()
DB_USER = os.getenv("MONGODB_USER")
DB_PASS = os.getenv("DATABASE_PASSWORD")
DB_NAME = os.getenv("DATABASE_NAME")
DB_CLUSTER = os.getenv("MONGO_CLUSTER")
SECRET_KEY = os.getenv("SECRET_KEY")
MONGO_URI = f"mongodb+srv://{DB_USER}:{DB_PASS}@{DB_CLUSTER}/{DB_NAME}?retryWrites=true&w=majority"

#  Initialize app
app = Flask(__name__)
app.config["MONGO_URI"] = MONGO_URI
app.config["SECRET_KEY"] = SECRET_KEY
mongo = PyMongo(app)
socketio = SocketIO(app)

# globals
users_by_sid = set()
_user_map = {}  # maps sid to username


def compute_stage_and_water(plant_doc):
    # Calculates the growth stage and water percentage of a plant.
    now = datetime.now(timezone.utc)
    planted_at = datetime.fromisoformat(plant_doc["planted_at"])
    age = (now - planted_at).total_seconds()

    last_watered = plant_doc.get("last_watered_at")
    last_w = datetime.fromisoformat(last_watered) if last_watered else planted_at

    decay_steps = int((now - last_w).total_seconds() // 15)
    water_pct = max(0, plant_doc.get("water_pct", 100) - decay_steps * 10)

    if water_pct == 0:
        stage = 4  # dry/dead
    elif plant_doc.get("harvested_at"):
        stage = 3  # harvested
    else:
        # normal growth stages
        stage = 0 if age <= 10 else 1 if age <= 30 else 2

    return stage, water_pct, int(age)


def plant_to_client(pdoc):
    # Convert Mongo to readable format
    stage, water, age = compute_stage_and_water(pdoc)
    return {
        "_id": str(pdoc["_id"]),
        "x": pdoc["x"],
        "y": pdoc["y"],
        "type": pdoc.get("type", "random"),
        "planted_at": pdoc["planted_at"],
        "last_watered_at": pdoc.get("last_watered_at"),
        "water_pct": water,
        "stage": stage,
        "isDry": pdoc.get("isDry", stage == 4),
        "gardener": pdoc.get("gardener", "unknown"),
        "age_seconds": age,
        "harvested_at": pdoc.get("harvested_at")
    }


def get_conditions():
    # Fetch/initialize garden stats
    cond = mongo.db.conditions.find_one({}, {"_id": 0})
    if not cond:
        cond = {"sunlight": 50, "plant_count": mongo.db.plants.count_documents({})}
        mongo.db.conditions.insert_one(cond)
    else:
        cond["plant_count"] = mongo.db.plants.count_documents({})
        mongo.db.conditions.update_one({}, {"$set": {"plant_count": cond["plant_count"]}})
    return cond


# sends updates to the client
def broadcast_conditions():
    cond = get_conditions()
    socketio.emit("conditionsUpdated", cond)


# --------------------- routes

@app.route("/")
def name_prompt():
    return render_template("name.html")


@app.route("/garden", methods=["POST"])
def garden():
    user = request.form.get("user")
    return render_template("garden.html", user=user)


# --------------------------- socket.io events
@socketio.on("connect")
def on_connect():
    print("Client connected:", request.sid)


@socketio.on("disconnect")
def on_disconnect():
    sid = request.sid
    users_by_sid.discard(sid)
    _user_map.pop(sid, None)
    broadcast_conditions()
    print("Client disconnected:", sid)


@socketio.on("registerUser")
def on_register(username):
    sid = request.sid
    _user_map[sid] = username
    users_by_sid.add(sid)  # keeps track of active users

    # Update sunlight based on active users
    cond = get_conditions()
    cond["sunlight"] = min(100, 30 + len(users_by_sid) * 10)
    mongo.db.conditions.update_one({}, {"$set": cond}, upsert=True)

    # Send initial garden
    raw_plants = list(mongo.db.plants.find({}))
    plants = [plant_to_client(p) for p in raw_plants]

    emit("initialGarden", {"plants": plants, "conditions": cond}, room=sid)
    socketio.emit("conditionsUpdated", cond)


# --- Plant Events ---

@socketio.on("newPlant")
def on_newPlant(data):
    if mongo.db.plants.count_documents({}) >= 50:
        emit("plantLimitReached", {"error": "🌱 Maximum of 50 plants reached. 🌱"}, room=request.sid)
        return

    sid = request.sid
    gardener = _user_map.get(sid) or data.get("gardener") or "unknown"
    now = datetime.now(timezone.utc).isoformat()

    plant_doc = {
        "x": float(data.get("x", 0)),
        "y": float(data.get("y", 0)),
        "type": data.get("type", "random"),
        "planted_at": data.get("planted_at", now),
        "last_watered_at": now,
        "water_pct": 100,
        "gardener": gardener
    }

    # Prevent overlapping plants
    close = mongo.db.plants.find_one({
        "x": {"$gt": plant_doc["x"] - 30, "$lt": plant_doc["x"] + 30},
        "y": {"$gt": plant_doc["y"] - 30, "$lt": plant_doc["y"] + 30}
    })
    if close:
        plant_doc["x"] += 18
        plant_doc["y"] += 10

    res = mongo.db.plants.insert_one(plant_doc)
    plant_doc["_id"] = res.inserted_id

    mongo.db.conditions.update_one({}, {"$inc": {"plant_count": 1}}, upsert=True)
    socketio.emit("plantAdded", plant_to_client(plant_doc))
    broadcast_conditions()


# function to add the water to the plant ot the db
@socketio.on("waterPlant")
def on_waterPlant(data):
    pid = data.get("plant_id")
    if not pid:
        return
    try:
        oid = ObjectId(pid)
    except Exception:
        return

    now = datetime.now(timezone.utc).isoformat()
    res = mongo.db.plants.update_one(
        {"_id": oid},
        {"$set": {"last_watered_at": now, "water_pct": 100}}
    )
    if res.matched_count:
        p = mongo.db.plants.find_one({"_id": oid})
        socketio.emit("plantUpdated", plant_to_client(p))


# show harvested plant in db
@socketio.on("harvestPlant")
def on_harvestPlant(data):
    pid = data.get("plant_id")
    if not pid:
        return  # get plant data

    try:
        oid = ObjectId(pid)
    except:
        return

    p = mongo.db.plants.find_one({"_id": oid})
    if not p:
        return

    stage, _, _ = compute_stage_and_water(p)  # checks if the plant stage is less than 2
    if stage < 2:
        socketio.emit("plantNotReady", {"plant_id": pid, "msg": "Plant is not ready to harvest yet!"})
        return
    # if the plant is valid it will be harvested
    now = datetime.now(timezone.utc).isoformat()
    mongo.db.plants.update_one({"_id": oid}, {"$set": {"harvested_at": now}})

    p = mongo.db.plants.find_one({"_id": oid})
    socketio.emit("plantUpdated", plant_to_client(p))

    # remove plant after delay in background
    def remove_later(plant_id):
        try:
            time.sleep(3)
            mongo.db.plants.delete_one({"_id": ObjectId(plant_id)})
        except Exception:
            pass
        broadcast_conditions()
        socketio.emit("plantRemoved", {"plant_id": plant_id})

    # calls
    socketio.start_background_task(remove_later, pid)


# function to delete a plant
@socketio.on("removePlant")
def on_removePlant(data):
    pid = data.get("plant_id")
    if not pid:
        return
    try:
        oid = ObjectId(pid)
    except:
        return

    mongo.db.plants.delete_one({"_id": oid})
    socketio.emit("plantRemoved", {"plant_id": pid})
    broadcast_conditions()  # sends data to client


# function that receives chat data
@socketio.on("sendMessage")
def on_message(msg):
    socketio.emit("chatMessage", msg)


socketio.run(app, debug=True, allow_unsafe_werkzeug=True)
