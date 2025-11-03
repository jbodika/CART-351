from flask import Flask, render_template, request

app = Flask(__name__)


# a route
@app.route('/')
def index():
    return render_template("index.html")


# for the get from p5
@app.route('/getDataFromP5')
def getDataFromP5():
    # give back request.args
    app.logger.info(request.args["id"])
    app.logger.info(request.args["score"])
    return ({"inFile": "false"})


app.run(debug=True)
