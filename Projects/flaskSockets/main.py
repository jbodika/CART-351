from flask_socketio import SocketIO, send, emit, join_room, leave_room
from flask import Flask, render_template, request

app = Flask(__name__)
# needed for sockets
app.config['SECRET_KEY'] = 'your_secret_key'
socketio = SocketIO(app)

users = {}  # for maintaining the users


# handle new connection
@socketio.on('connect')
def connectFunction():
    app.logger.info(request.sid)


# Handle new user joining
@socketio.on('join')
def handle_join(username):
    users[request.sid] = username  # Store username by session ID
    app.logger.info("in join function")
    app.logger.info(users[request.sid])
    app.logger.info(request.sid)
    # send back message
    emit("join-complete", f"{username} joined the chat")


@socketio.on('textData')
def handle_text(data):
    app.logger.info(request.sid)
    app.logger.info(data)
    # send to everyone but me
    dataToSend = {}
    dataToSend["user"] = users[request.sid]
    dataToSend["data"] = data["data"]
    emit("dataFromServer", dataToSend, broadcast=True, skip_sid=request.sid)


@app.route('/')
def index():
    # return render_template('socketTest.html')
    return render_template('socket_p5Test.html')


@socketio.on('newFlower')
def handle_flower(flower):
    app.logger.info(request.sid)
    app.logger.info(flower)
    emit("flowerFromServer", flower, broadcast=True, skip_sid=request.sid)


# try to remove the allow_unsafe_werkzeug
socketio.run(app, debug=True, allow_unsafe_werkzeug=True)
# app.run(debug=True)
