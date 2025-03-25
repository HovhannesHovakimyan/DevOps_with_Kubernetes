import express from 'express';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = 3000;

// Directory to store cached images
const CACHE_DIR = path.join(process.cwd(), 'cache');
const IMAGE_PATH = path.join(CACHE_DIR, 'image.jpg');

// Ensure the cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR);
}

// Function to fetch and cache a new image
async function fetchAndCacheImage() {
  const response = await fetch('https://picsum.photos/1200');
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  fs.writeFileSync(IMAGE_PATH, buffer);
  return buffer;
}

// Function to get the cached image or fetch a new one if it's too old
async function getImage() {
  try {
    const stats = fs.statSync(IMAGE_PATH);
    const now = new Date();
    const lastModified = new Date(stats.mtime);

    if (now - lastModified > 60 * 60 * 1000) {
      console.log('Image is older than 60 minutes, fetching a new one...');
      return await fetchAndCacheImage();
    }

    console.log('Serving cached image...');
    return fs.readFileSync(IMAGE_PATH);
  } catch (err) {
    console.log('No cached image found, fetching a new one...');
    return await fetchAndCacheImage();
  }
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', async (req, res) => {
  const image = await getImage();

  res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>TODO List</title>
            <style>
                .todo-list { margin: 20px 0; }
                .todo-item { margin: 5px 0; }
                img { max-width: 100%; height: auto; }
            </style>
        </head>
        <body>
            <h1>TODO List</h1>

            <form id="todoForm" action="/todos" method="POST">
                <input type="text" name="task" placeholder="Enter new TODO" required>
                <button type="submit">Add TODO</button>
            </form>

            <div class="todo-list" id="todoList"></div>

            <h2>Random Image</h2>
            <img src="data:image/jpeg;base64,${image.toString('base64')}" alt="Random Image" />

            <script>
                async function loadTodos() {
                    const response = await fetch('/todos');
                    const todos = await response.json();
                    const todoList = document.getElementById('todoList');
                    todoList.innerHTML = todos.map(todo =>
                        \`<div class="todo-item">\${todo.task}</div>\`
                    ).join('');
                }

                document.getElementById('todoForm').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    await fetch('/todos', {
                        method: 'POST',
                        body: formData
                    });
                    e.target.reset();
                    loadTodos();
                });

                loadTodos();
            </script>
        </body>
        </html>
    `);
});

app.get('/todos', async (req, res) => {
  try {
    const response = await fetch('http://todo-backend:3001/todos');
    const todos = await response.json();
    res.json(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

app.post('/todos', async (req, res) => {
  try {
    const response = await fetch('http://todo-backend:3001/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task: req.body.task })
    });
    const result = await response.json();
    res.json(result);
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

const server = app.listen(PORT, () => {
  console.log(`Frontend server running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed, exiting process.');
    process.exit(0);
  });
});