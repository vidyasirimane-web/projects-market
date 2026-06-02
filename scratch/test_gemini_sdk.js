import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = "YOUR_API_KEY_HERE";
const genAI = new GoogleGenerativeAI(API_KEY);

async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hello, respond with 'Success' if you can read this.");
    console.log("SDK Success:", result.response.text());
  } catch (e) {
    console.error("SDK Error:", e.message);
  }
}

test();
