import http from 'http';
import fs from 'fs'; // Import fs once
import path from 'path';
import fetch from 'node-fetch';

// Get the port from the environment variable or default to 3000
const PORT = process.env.PORT || 3000;

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
  const arrayBuffer = await response.arrayBuffer(); // Use arrayBuffer() instead of buffer()
  const buffer = Buffer.from(arrayBuffer); // Convert ArrayBuffer to Buffer
  fs.writeFileSync(IMAGE_PATH, buffer);
  return buffer;
}

// Function to get the cached image or fetch a new one if it's too old
async function getImage() {
  try {
    const stats = fs.statSync(IMAGE_PATH);
    const now = new Date();
    const lastModified = new Date(stats.mtime);

    // If the image is older than 60 minutes, fetch a new one
    if (now - lastModified > 60 * 60 * 1000) {
      console.log('Image is older than 60 minutes, fetching a new one...');
      return await fetchAndCacheImage();
    }

    // Otherwise, return the cached image
    console.log('Serving cached image...');
    return fs.readFileSync(IMAGE_PATH);
  } catch (err) {
    // If the image doesn't exist, fetch and cache a new one
    console.log('No cached image found, fetching a new one...');
    return await fetchAndCacheImage();
  }
}

// Create the HTTP server
const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    // Get the image (either cached or fresh)
    const image = await getImage();

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    res.end(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Hello World</title>
      </head>
      <body>
        <h1>Hello, World!</h1>
        <p>This is a simple HTML page served by a Node.js server.</p>
        <img src="data:image/jpeg;base64,${image.toString('base64')}" alt="Random Image" />
      </body>
      </html>
    `);
  } else {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    res.end('404 Not Found\n');
  }
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

// Handle SIGTERM signal for graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...');

  // Close the server to stop accepting new connections
  server.close((err) => {
    if (err) {
      console.error('Error closing server:', err);
      process.exit(1); // Exit with error code if the server fails to close
    }

    console.log('Server closed, exiting process.');
    process.exit(0); // Exit successfully
  });
});