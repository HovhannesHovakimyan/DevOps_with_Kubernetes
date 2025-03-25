const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Image caching setup
const CACHE_DIR = path.join(__dirname, 'cache');
const IMAGE_PATH = path.join(CACHE_DIR, 'image.jpg');

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR);
}

// Image handling functions
async function fetchAndCacheImage() {
  const response = await fetch('https://picsum.photos/1200');
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  fs.writeFileSync(IMAGE_PATH, buffer);
  return buffer;
}

async function getImage() {
  try {
    const stats = fs.statSync(IMAGE_PATH);
    const now = new Date();
    const lastModified = new Date(stats.mtime);

    // Refresh image if older than 60 minutes
    if (now - lastModified > 60 * 60 * 1000) {
      console.log('Refreshing cached image...');
      return await fetchAndCacheImage();
    }

    console.log('Using cached image...');
    return fs.readFileSync(IMAGE_PATH);
  } catch (err) {
    console.log('No cached image found, fetching new one...');
    return await fetchAndCacheImage();
  }
}

// Combined HTML template with image and TODOs
app.get('/', async (req, res) => {
  try {
    const image = await getImage();
    const todosResponse = await axios.get('http://localhost:3001/todos');
    const todos = todosResponse.data;

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>TODO App with Image</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          #todos-list { list-style: none; padding: 0; }
          .todo-item { padding: 10px; border: 1px solid #ddd; margin-bottom: 5px; border-radius: 4px; }
          .completed { text-decoration: line-through; color: #888; }
          form { margin-top: 20px; }
          input, button { padding: 8px; margin-right: 10px; }
          img { max-width: 100%; margin: 20px 0; border: 1px solid #ddd; }
        </style>
      </head>
      <body>
        <h1>TODO List with Random Image</h1>
        <img src="data:image/jpeg;base64,${image.toString('base64')}" alt="Random Image" />

        <h2>TODO List</h2>
        <ul id="todos-list">
          ${todos.map(todo => `<li class="todo-item ${todo.completed ? 'completed' : ''}">${todo.title}</li>`).join('')}
        </ul>

        <form id="todo-form">
          <input type="text" id="new-todo" placeholder="Add a new TODO" required>
          <button type="submit">Add</button>
        </form>

        <script>
          // Current list of TODOs (backend + frontend-added)
          let currentTodos = ${JSON.stringify(todos)};

          // Display TODOs in the list
          function displayTodos() {
            const todosList = document.getElementById('todos-list');
            todosList.innerHTML = '';

            currentTodos.forEach(todo => {
              const li = document.createElement('li');
              li.className = 'todo-item';
              if (todo.completed) li.classList.add('completed');
              li.textContent = todo.title;
              todosList.appendChild(li);
            });
          }

          // Add a new TODO (frontend only)
          document.getElementById('todo-form').addEventListener('submit', function(e) {
            e.preventDefault();
            const input = document.getElementById('new-todo');
            const title = input.value.trim();

            if (title) {
              // Add to our frontend list (not persisted to backend)
              currentTodos.unshift({
                id: Date.now(), // temporary ID
                title: title,
                completed: false
              });
              displayTodos();
              input.value = '';
            }
          });

          // Initial display
          displayTodos();
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Proxy endpoint to fetch TODOs from backend
app.get('/api/todos', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:3001/todos');
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch TODOs' });
  }
});

app.listen(3000, () => {
  console.log('Frontend server running on http://localhost:3000');
});