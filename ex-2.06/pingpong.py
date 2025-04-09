from flask import Flask, jsonify

app = Flask(__name__)

# Initialize a counter in memory
request_counter = 0


@app.route("/ping", methods=["GET"])
def ping():
    global request_counter
    request_counter += 1
    return f"pong {request_counter}"


@app.route("/pongs", methods=["GET"])
def get_pongs():
    global request_counter
    return jsonify({"pongs": request_counter})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
