from flask import Flask, render_template, request

app = Flask(__name__)


# the default route
@app.route("/")
def index():
    return render_template("index.html")


# *************************************************

# Task: Variables and JinJa Templates
@app.route("/t1")
def t1():
    the_topic = "donuts"
    number_of_donuts = 28
    donut_data = {
        "flavours": ["Regular", "Chocolate", "Blueberry", "Devil's Food"],
        "toppings": ["None", "Glazed", "Sugar", "Powdered Sugar",
                     "Chocolate with Sprinkles", "Chocolate", "Maple"]
    }

    icecream_flavors = ["Vanilla", "Raspberry", "Cherry", "Lemon"]
    return render_template("t1.html", the_topic=the_topic, num_donuts=number_of_donuts, donut_data=donut_data,
                           icecream_flavors=icecream_flavors)


# *************************************************

# Task: HTML Form get & Data
@app.route("/t2")
def t2():
    return render_template("t2.html")


@app.route("/thank_you_t2", methods=['POST', 'GET'])
def thank_you_t2():
    output_string = []
    if request.method == 'POST':
        vowels = ['A', 'E', 'I', 'O', 'U', 'Y']
        first_input = request.form["f_name"]  # gather form data
        second_input = request.form["l_name"]
        textarea = request.form["comments"]

        full_string = first_input + second_input + textarea

        for char in full_string:
            if char.upper() not in vowels:
                output_string.append(char)
            else:
                output_string.append("*")

        result_string = "".join(output_string)

        return render_template("thankyou_t2.html", output_string=result_string)

        # *************************************************
        # run


if __name__ == '__main__':
    app.run(debug=True)
