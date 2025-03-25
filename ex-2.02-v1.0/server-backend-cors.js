const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

// Use PORT from environment or default to 3001
const port = process.env.PORT || 3001;

// Predefined list of TODOs
const todos = [
    { id: 1, title: 'Learn Node.js', completed: false },
    { id: 2, title: 'Build a REST API', completed: true },
    { id: 3, title: 'Create a frontend', completed: false }
];

// Endpoint to get all TODOs
app.get('/todos', (req, res) => {
    res.json(todos);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});