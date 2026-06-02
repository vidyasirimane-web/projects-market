const API_KEY = "YOUR_API_KEY_HERE";

async function test() {
  const payload = {
    contents: [{ parts: [{ text: "Hello, respond with 'Success' if you can read this." }] }]
  };
  
  try {
    console.log("Testing v1 endpoint...");
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    console.log("v1 Response:", JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("v1 Error:", e.message);
  }
}

test();
