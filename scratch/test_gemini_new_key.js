const API_KEY = "YOUR_API_KEY_HERE";

async function testV1() {
  const payload = {
    contents: [{ parts: [{ text: "Hello, respond with 'Success' if you can read this." }] }]
  };
  
  try {
    console.log("Testing new API Key via direct Fetch v1 (gemini-1.5-flash)...");
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    console.log("v1 Response:", JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Fetch Error:", e.message);
  }
}

async function listModels() {
  try {
    console.log("Listing models via v1beta...");
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
    const data = await response.json();
    console.log("Models list v1beta:", JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("List Error:", e.message);
  }
}

async function run() {
  await testV1();
  await listModels();
}

run();
