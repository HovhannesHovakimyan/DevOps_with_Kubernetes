import uuid
import time
from datetime import datetime, timezone
from flask import Flask, jsonify
import os

app = Flask(__name__)

# Path to the shared volume
COUNTER_FILE_PATH = "/shared_data/request_counter.txt"

# Initialize the random string and timestamp
random_string = str(uuid.uuid4())
last_timestamp = datetime.now(timezone.utc).isoformat()


def generate_random_string():
    return str(uuid.uuid4())


@app.route("/status", methods=["GET"])
def get_status():
    global random_string, last_timestamp

    # Read the request counter from the shared file
    if os.path.exists(COUNTER_FILE_PATH):
        with open(COUNTER_FILE_PATH, "r") as f:
            request_counter = f.read().strip()
    else:
        request_counter = "0"

    return jsonify(
        {
            "timestamp": last_timestamp,
            "random_string": random_string,
            "ping_pongs": request_counter,
        }
    )


def main():
    global random_string, last_timestamp
    while True:
        last_timestamp = datetime.now(timezone.utc).isoformat()
        print(f"{last_timestamp}: {random_string}", flush=True)
        time.sleep(5)


if __name__ == "__main__":
    # Start the background task
    import threading

    threading.Thread(target=main, daemon=True).start()

    # Start the Flask app
    app.run(host="0.0.0.0", port=5000)
