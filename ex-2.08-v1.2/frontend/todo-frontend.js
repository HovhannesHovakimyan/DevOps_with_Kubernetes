const express = require('express');
const axios = require('axios');
const path = require('path');
const fs = require('fs').promises;
const app = express();

const CACHE_DIR = process.env.CACHE_DIR || path.join(__dirname, 'cache');
const IMAGE_PATH = path.join(CACHE_DIR, 'cached-image.jpg');
const IMAGE_URL = 'https://picsum.photos/1200';
const BACKEND_PATH = process.env.BACKEND_PATH || 'todos';
const BACKEND_URL = `/${BACKEND_PATH}`;

async function getCachedImage() {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    let shouldDownload = false;

    try {
      const stats = await fs.stat(IMAGE_PATH);
      const ageInMinutes = (Date.now() - stats.mtimeMs) / (1000 * 60);
      if (ageInMinutes >= 60) {
        console.log(`Cached image is ${ageInMinutes.toFixed(2)} minutes old, exceeds 60 minutes. Downloading new image.`);
        shouldDownload = true;
      } else {
        console.log(`Cached image is ${ageInMinutes.toFixed(2)} minutes old, using cached version.`);
      }
    } catch (error) {
      console.log('No cached image found or error accessing it. Downloading new image.');
      shouldDownload = true;
    }

    if (shouldDownload) {
      const response = await axios.get(IMAGE_URL, { responseType: 'arraybuffer' });
      await fs.writeFile(IMAGE_PATH, Buffer.from(response.data));
      console.log('New image downloaded and cached.');
      return Buffer.from(response.data);
    }

    return await fs.readFile(IMAGE_PATH);
  } catch (error) {
    console.error('Error handling image:', error);
    throw error;
  }
}

app.get('/image', async (req, res) => {
  try {
    const imageBuffer = await getCachedImage();
    res.set('Content-Type', 'image/jpeg');
    res.send(imageBuffer);
  } catch (error) {
    res.status(500).send('Error loading image');
  }
});

app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/config', (req, res) => {
  res.json({ backendUrl: BACKEND_URL });
});

app.listen(3000, () => {
  console.log(`Frontend running on port 3000, using backend path at ${BACKEND_URL}`);
  console.log(`Cache directory set to: ${CACHE_DIR}`);
});