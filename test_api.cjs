const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = "AIzaSyCn99mYWNuSt8G07cSoKXhnysjKtLBRYW8";
const genAI = new GoogleGenerativeAI(API_KEY);

async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hello");
    console.log(result.response.text());
  } catch (e) {
    console.log("Error with gemini-1.5-flash, trying gemini-pro...");
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Hello");
        console.log("gemini-pro works!");
    } catch (e2) {
        console.log("gemini-pro also failed:", e2.message);
    }
  }
}

test();
