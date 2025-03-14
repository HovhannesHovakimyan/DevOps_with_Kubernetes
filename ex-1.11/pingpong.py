from flask import Flask
import os

app = Flask(__name__)

# Path to the shared volume
COUNTER_FILE_PATH = "/shared_data/request_counter.txt"

# Ensure the shared directory exists
os.makedirs(os.path.dirname(COUNTER_FILE_PATH), exist_ok=True)

# Initialize the counter file if it doesn't exist
if not os.path.exists(COUNTER_FILE_PATH):
    with open(COUNTER_FILE_PATH, "w") as f:
        f.write("0")


@app.route("/ping", methods=["GET"])
def ping():
    # Read the current counter value
    with open(COUNTER_FILE_PATH, "r") as f:
        request_counter = int(f.read().strip())

    # Increment the counter
    request_counter += 1

    # Write the updated counter back to the file
    with open(COUNTER_FILE_PATH, "w") as f:
        f.write(str(request_counter))

    return f"pong {request_counter}"


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
