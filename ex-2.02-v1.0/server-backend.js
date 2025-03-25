// todo-backend.js
import http from 'http';

// In-memory storage for todos
let todos = [
    'Finish the project',
    'Buy groceries',
    'Call the plumber',
    'Read a book',
];

// Create the HTTP server
const server = http.createServer(async (req, res) => {
    if (req.method === 'GET' && req.url === '/todos') {
        // Handle GET /todos request
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(todos));
    } else if (req.method === 'POST' && req.url === '/todos') {
        // Handle POST /todos request
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const todo = JSON.parse(body);
            if (!todo || !todo.title) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Title is required' }));
                return;
            }
            todos.push(todo.title);
            res.statusCode = 201;
            res.end(JSON.stringify(todo));
        });
    } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain');
        res.end('404 Not Found\n');
    }
});

// Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Todo backend server started on port ${PORT}`);
});