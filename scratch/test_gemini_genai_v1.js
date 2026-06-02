import { GoogleGenAI } from '@google/genai';

const API_KEY = "YOUR_API_KEY_HERE";
const ai = new GoogleGenAI({
  apiKey: API_KEY,
  httpOptions: { apiVersion: 'v1' }
});

async function test() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: "Hello, respond with 'Success' if you can read this."
    });
    console.log("SDK Success:", response.text);
  } catch (e) {
    console.error("SDK Error:", e.message);
  }
}

test();
