const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware (No CORS needed)
app.use(express.json());

// Predefined TODOs
let todos = [
    { id: 1, title: 'Learn Kubernetes', completed: false },
    { id: 2, title: 'Deploy to k3d', completed: false },
    { id: 3, title: 'Configure Ingress', completed: true }
];

// API Routes
app.get('/todos', (req, res) => {
    res.json(todos);
});

app.post('/todos', (req, res) => {
    const newTodo = {
        id: todos.length + 1,
        title: req.body.title,
        completed: false
    };
    todos.push(newTodo);
    res.status(201).json(newTodo);
});

// Health check for Kubernetes
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});