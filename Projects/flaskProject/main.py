from flask import Flask, render_template, request

app = Flask(__name__)


@app.route('/')
def default():  # put application's code here
    return render_template("base.html")


@app.route("/index")
def index():
    passed_dictionary = {
        "fav_color": "fuscia",
        "fav_veg": "cauliflower",
        "fav_fruit": "kiwi",
        "fav_animal": "toucan"
    }
    return render_template("index.html", user={"username": "sabine"}, passed_dictionary=passed_dictionary

                           # imgPath="../static/images/pineapple_2.jpg"

                           )


@app.route('/pineappleParent')
def pineappleP():  # put application's code here
    return render_template("pineappleParent.html")


@app.route("/pineappleA")
def pineappleA():
    return render_template("pineappleChild.html",
                           dataPassedA="child A!")


@app.route("/pineappleB")
def pineappleB():
    return render_template("pineappleChild_B.html",
                           passedImg="../static/images/pineapple_2.png")


@app.route("/postRegFormFetch", methods=['POST'])
def postRegFormFetch():
    app.logger.info(request.form)
    return ({"data_received": "success", "f_name": request.form["f_name"]})


@app.route("/register")
def register():
    return render_template("register.html")


@app.route("/inputPlant")
def addPlantData():
    return render_template("addPlantData.html")


if __name__ == '__main__':
    app.run(debug=True)
