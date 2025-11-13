import json

from flask import Flask, render_template, request, jsonify

import os

app = Flask(__name__)
UPLOAD_FOLDER = 'static/uploads.json'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB limit


@app.route("/")
def main():
    return render_template("index.html")


# returns the data collection of coordinates
@app.route("/data_page")
def data_page():
    users = []
    if os.path.exists(UPLOAD_FOLDER):
        with open(UPLOAD_FOLDER) as f:
            users = json.load(f)

    return render_template("data_page.html", users=users)


# request to submit the data and write it to a json file
@app.route("/submit_data", methods=["POST"])
def submit_data():
    # get data
    new_data = request.get_json()

    # create a file if it doesn't exist
    if not os.path.exists(UPLOAD_FOLDER):
        with open(UPLOAD_FOLDER, "w") as f:
            json.dump([], f)

    # read and append to the file
    with open(UPLOAD_FOLDER, "r+") as f:
        data = json.load(f)
        data.append(new_data)
        f.seek(0)
        json.dump(data, f, indent=4)
    # return successful message
    return jsonify({"status": "success"})


@app.route("/get_all_user_coordinates")
def get_all_user_coords():
    if not os.path.exists(UPLOAD_FOLDER):
        return jsonify([])

    with open(UPLOAD_FOLDER) as f:
        data = json.load(f)

    coordinates = [
        {
            "name": entry.get("name", "Unknown"),  # default to unknown if the name is missing
            "x": entry["coordinates"]["x"],
            "y": entry["coordinates"]["y"]
        }
        for entry in data
        if "coordinates" in entry and "name" in entry
    ]

    return jsonify(coordinates)


if __name__ == "__main__":
    app.run(debug=True)


# *************************************************
# run
app.run(debug=True)
