const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const app = express();

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`, {
    body: req.body,
    params: req.params,
    query: req.query
  });
  next();
});

// Database connection configuration
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  // Add retry logic for connection
  retryDelay: 5000, // 5 seconds between retries
  retryLimit: 5, // 5 retries before giving up
});

// Test database connection
async function testConnection() {
  try {
    await pool.query('SELECT 1');
    console.log('Connected to PostgreSQL database');
    return true;
  } catch (err) {
    console.error('Database connection error:', err);
    return false;
  }
}

// Initialize database
async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        text TEXT NOT NULL,
        completed BOOLEAN DEFAULT FALSE
      )
    `);

    // Check if we need to seed initial data
    const result = await pool.query('SELECT COUNT(*) FROM todos');
    if (parseInt(result.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO todos (text, completed) VALUES
        ('Learn Node.js', false),
        ('Build a TODO app', false),
        ('Deploy to Kubernetes', false)
      `);
    }
  } catch (err) {
    console.error('Database initialization error:', err);
  }
}

// Health check endpoint
app.get('/health', async (req, res) => {
  const dbConnected = await testConnection();
  if (dbConnected) {
    res.status(200).json({ status: 'OK', database: 'connected' });
  } else {
    res.status(503).json({ status: 'Unavailable', database: 'disconnected' });
  }
});

// Get all todos
app.get('/todos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM todos ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching todos:', err);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

// Create new todo
app.post('/todos', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      console.log('Todo creation rejected: Text is required');
      return res.status(400).json({ error: 'Text is required' });
    }

    if (text.length > 140) {
      console.log(`Todo creation rejected: Text exceeds 140 characters (length: ${text.length})`);
      return res.status(400).json({
        error: 'Todo text must be 140 characters or less',
        length: text.length
      });
    }

    const result = await pool.query(
      'INSERT INTO todos (text) VALUES ($1) RETURNING *',
      [text]
    );

    console.log(`Todo created successfully: ID ${result.rows[0].id}`);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating todo:', err);
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

// Start server only if database connection is successful
async function startServer() {
  let retries = 5;
  while (retries > 0) {
    if (await testConnection()) {
      await initializeDatabase();
      app.listen(3001, () => {
        console.log('Backend running on port 3001');
      });
      return;
    }
    retries--;
    console.log(`Waiting for database... ${retries} retries left`);
    await new Promise(res => setTimeout(res, 5000));
  }
  console.error('Failed to connect to database after multiple retries');
}

startServer();