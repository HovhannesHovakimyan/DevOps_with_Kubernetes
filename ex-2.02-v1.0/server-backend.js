import express from 'express';

const app = express();
const PORT = 3001;

// In-memory storage for TODOs
let todos = [
    { id: 1, task: 'Learn Kubernetes' },
    { id: 2, task: 'Set up k3d cluster' },
    { id: 3, task: 'Build TODO app' }
];

app.use(express.json());

// GET endpoint for todo list
app.get('/todos', (req, res) => {
    res.json(todos);
});

// POST endpoint to create new todo
app.post('/todos', (req, res) => {
    const newTodo = {
        id: todos.length + 1,
        task: req.body.task
    };
    todos.push(newTodo);
    res.status(201).json(newTodo);
});

app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});