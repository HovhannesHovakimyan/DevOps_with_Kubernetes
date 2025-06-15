import uuid
import time
import requests
import os
from datetime import datetime, timezone
from flask import Flask, jsonify

app = Flask(__name__)

# Initialize the random string and timestamp
random_string = str(uuid.uuid4())
last_timestamp = datetime.now(timezone.utc).isoformat()

# URL of the "Ping-pong" application
PING_PONG_URL = "http://ping-pong-service.devops.svc.cluster.local:5001/pongs"

# Path to the mounted config file
CONFIG_FILE_PATH = "/etc/config/information.txt"


def generate_random_string():
    return str(uuid.uuid4())


def read_config_file():
    try:
        with open(CONFIG_FILE_PATH, "r") as file:
            return file.read().strip()
    except Exception as e:
        return f"Error reading config file: {str(e)}"


@app.route("/status", methods=["GET"])
def get_status():
    global random_string, last_timestamp

    try:
        # Fetch the number of pongs from the "Ping-pong" application
        response = requests.get(PING_PONG_URL)
        pongs = response.json().get("pongs", 0)
    except requests.exceptions.RequestException as e:
        # Handle connection errors
        pongs = 0

    # Read the config file content
    config_content = read_config_file()

    return jsonify(
        {
            "timestamp": last_timestamp,
            "random_string": random_string,
            "ping_pongs": pongs,
            "config_file_content": config_content,
            "environment_variable": os.getenv("MESSAGE", "MESSAGE not set"),
        }
    )


def main():
    global random_string, last_timestamp
    while True:
        last_timestamp = datetime.now(timezone.utc).isoformat()
        config_content = read_config_file()
        message = os.getenv("MESSAGE", "MESSAGE not set")
        print(f"{last_timestamp}: {random_string}", flush=True)
        print(f"Config file content: {config_content}", flush=True)
        print(f"Environment variable: {message}", flush=True)
        time.sleep(5)


if __name__ == "__main__":
    # Start the background task
    import threading

    threading.Thread(target=main, daemon=True).start()

    # Start the Flask app
    app.run(host="0.0.0.0", port=5000)
