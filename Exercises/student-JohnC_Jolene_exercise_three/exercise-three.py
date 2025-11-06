import json

from flask import Flask, render_template, request
import os

app = Flask(__name__)
UPLOAD_FOLDER = 'static/uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB limit


# the default route
@app.route("/")
def index():
    return render_template("index.html")


# *************************************************
# Task: CAPTURE & POST & FETCH & SAVE
@app.route("/t2")
def t2():
    return render_template("t2.html")


@app.route("/postDataFetch", methods=['POST'])
def post_data_fetch():
    # check if the request is json
    if not request.is_json:
        return {"status": "error", "message": "Request was not JSON"}, 415
    # get data
    data = request.get_json()
    comments = data.get("comments", "")
    feeling_val = data.get("feeling", "")

    # check if files exists
    os.makedirs("files", exist_ok=True)
    full_str = f"{feeling_val} - {comments}"
    with open("files/data.txt", "a", encoding="utf-8") as f:
        f.write(json.dumps(full_str) + "\n")  # append to file

    return {
        "status": "success",
        "message": f"You feel like "
                   f" {feeling_val}/5, because: {comments}"
    }


# *************************************************
# run
app.run(debug=True)
