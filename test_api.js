import fetch from 'node-fetch';

const API_KEY = "AIzaSyCn99mYWNuSt8G07cSoKXhnysjKtLBRYW8";

async function test() {
  const payload = {
    contents: [{ parts: [{ text: "Hello" }] }]
  };
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (data.error) {
      console.log("v1beta failed:", data.error.message);
      const response2 = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data2 = await response2.json();
      if (data2.error) {
        console.log("v1 also failed:", data2.error.message);
      } else {
        console.log("v1 SUCCESS:", data2.candidates[0].content.parts[0].text);
      }
    } else {
      console.log("v1beta SUCCESS:", data.candidates[0].content.parts[0].text);
    }
  } catch (e) {
    console.error("FETCH ERROR:", e.message);
  }
}

test();
