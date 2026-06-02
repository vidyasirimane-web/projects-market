import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = "YOUR_API_KEY_HERE";

async function testWith2_5() {
  try {
    console.log("Testing with gemini-2.5-flash...");
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent("Hello, respond with 'Success' if you can read this.");
    console.log("SDK Success:", result.response.text());
  } catch (e) {
    console.error("SDK Error:", e.message);
  }
}

async function testWithFlashLatest() {
  try {
    console.log("Testing with gemini-flash-latest...");
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const result = await model.generateContent("Hello, respond with 'Success' if you can read this.");
    console.log("SDK Success:", result.response.text());
  } catch (e) {
    console.error("SDK Error:", e.message);
  }
}

async function run() {
  await testWith2_5();
  await testWithFlashLatest();
}

run();
