from flask import Flask,render_template,request
import os
app = Flask(__name__)
UPLOAD_FOLDER = 'static/uploads' # Or os.path.join(app.instance_path, 'uploads')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024 # 16 MB limit

# the default route
@app.route("/")
def index():
      return render_template("index.html")

#*************************************************
#Task: CAPTURE & POST & FETCH & SAVE
# @app.route("/t2")
# def t2():
#     return render_template("t2.html")

# app.route("/postDataFetch",methods = ['POST'])
# def postDataFetch():
#     app.logger.info(request.form)
#     return ({"data_received":"yes"})

#*************************************************
#run
app.run(debug=True)