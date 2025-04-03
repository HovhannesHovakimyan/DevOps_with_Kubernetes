const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

let todos = [
  { id: 1, text: 'Learn Node.js', completed: false },
  { id: 2, text: 'Build a TODO app', completed: false },
  { id: 3, text: 'Deploy to Kubernetes', completed: false }
];

app.get('/todos', (req, res) => {
  res.json(todos);
});

app.post('/todos', (req, res) => {
  const newTodo = {
    id: todos.length + 1,
    text: req.body.text,
    completed: false
  };
  todos.push(newTodo);
  res.status(201).json(newTodo);
});

app.listen(3001, () => {
  console.log('Backend running on port 3001');
});