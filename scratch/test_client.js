import fs from 'fs/promises';
import path from 'path';

async function testClient() {
  try {
    const imagePath = path.resolve('public/fresh_apple.png');
    const imageBuffer = await fs.readFile(imagePath);
    const base64Data = 'data:image/png;base64,' + imageBuffer.toString('base64');

    console.log("Sending POST request to http://localhost:5000/api/detect-crop...");

    const response = await fetch('http://localhost:5000/api/detect-crop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Data })
    });

    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));

  } catch (e) {
    console.error('Error:', e.message);
  }
}

testClient();
