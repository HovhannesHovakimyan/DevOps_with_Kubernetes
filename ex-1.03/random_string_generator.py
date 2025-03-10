from flask import Flask, jsonify
import uuid
from datetime import datetime

app = Flask(__name__)

# Generate random string and timestamp at startup
random_string = str(uuid.uuid4())
timestamp = datetime.utcnow().isoformat() + "Z"


@app.route("/status", methods=["GET"])
def get_status():
    return jsonify({"timestamp": timestamp, "random_string": random_string})


@app.route("/healthz", methods=["GET"])
def healthz():
    return jsonify({"status": "ok"}), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
