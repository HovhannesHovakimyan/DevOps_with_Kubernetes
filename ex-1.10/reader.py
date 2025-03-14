import hashlib
from flask import Flask, jsonify

app = Flask(__name__)

# Shared file path
SHARED_FILE_PATH = "/shared-data/timestamp.txt"


def generate_hash(content):
    return hashlib.sha256(content.encode()).hexdigest()


@app.route("/status", methods=["GET"])
def get_status():
    try:
        # Read the shared file
        with open(SHARED_FILE_PATH, "r") as file:
            content = file.read()

        # Generate a hash of the content
        content_hash = generate_hash(content)

        return jsonify({"content": content, "hash": content_hash})
    except FileNotFoundError:
        return jsonify({"error": "File not found"}), 404


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
