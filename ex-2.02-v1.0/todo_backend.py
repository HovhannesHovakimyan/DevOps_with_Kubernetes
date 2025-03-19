from flask import Flask, jsonify, request

app = Flask(__name__)

# In-memory storage for todos
todos = []


@app.route("/todos", methods=["GET"])
def get_todos():
    return jsonify(todos)


@app.route("/todos", methods=["POST"])
def create_todo():
    todo = request.json
    if not todo or "title" not in todo:
        return jsonify({"error": "Title is required"}), 400
    todos.append(todo)
    return jsonify(todo), 201


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
