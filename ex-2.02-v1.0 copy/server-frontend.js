const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;
const BACKEND_URL = process.env.BACKEND_URL || 'localhost:3001';

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', async (req, res) => {
  try {
    // Fetch from internal Kubernetes DNS when in cluster
    const response = await axios.get(`http://${BACKEND_URL}/todos`);
    const todos = response.data;

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>TODO App</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          #todos { list-style: none; padding: 0; }
          .todo-item { padding: 8px; margin: 5px 0; border: 1px solid #eee; }
          form { margin: 20px 0; }
          input { padding: 8px; width: 300px; }
          button { padding: 8px 15px; }
        </style>
      </head>
      <body>
        <h1>TODO App</h1>

        <h2>My TODOs</h2>
        <ul id="todos">
          ${todos.map(todo => `
            <li class="todo-item">
              <input type="checkbox" ${todo.completed ? 'checked' : ''}>
              ${todo.title}
            </li>
          `).join('')}
        </ul>

        <form id="add-todo">
          <input type="text" placeholder="New TODO" required>
          <button type="submit">Add</button>
        </form>

        <script>
          document.getElementById('add-todo').addEventListener('submit', async (e) => {
            e.preventDefault();
            const input = e.target.querySelector('input');
            const title = input.value.trim();

            if (title) {
              try {
                const response = await fetch('/api/todos', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ title })
                });

                if (response.ok) {
                  const newTodo = await response.json();
                  const li = document.createElement('li');
                  li.className = 'todo-item';
                  li.innerHTML = \`
                    <input type="checkbox">
                    \${newTodo.title}
                  \`;
                  document.getElementById('todos').appendChild(li);
                  input.value = '';
                }
              } catch (error) {
                console.error('Error adding TODO:', error);
              }
            }
          });
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Backend fetch failed:', error);
    res.status(500).send(`
      <h1>Connection Error</h1>
      <p>Failed to connect to backend service. Please try again later.</p>
      <p>${error.message}</p>
    `);
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend running on port ${PORT}`);
});