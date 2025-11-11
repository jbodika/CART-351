import json

from flask import Flask, render_template, request
import os

app = Flask(__name__)
UPLOAD_FOLDER = 'static/uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB limit


@app.route("/")
def main():
    return render_template("index.html")


# See PyCharm help at https://www.jetbrains.com/help/pycharm/

# *************************************************
# run
app.run(debug=True)
