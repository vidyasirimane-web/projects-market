import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = "YOUR_API_KEY_HERE";
const genAI = new GoogleGenerativeAI(API_KEY);

async function test() {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            name: {
              type: "STRING",
              description: "Name of the agricultural crop detected, e.g. Tomato, Potato, Onion, Mango."
            },
            quality: {
              type: "STRING",
              description: "Quality grade based on visual appearance. Must be one of: A+, A, B, C."
            },
            health: {
              type: "STRING",
              description: "Health status of the crop. Must be one of: Good, Fair, Poor, Diseased."
            },
            suggested_price: {
              type: "NUMBER",
              description: "Suggested retail price in Indian Rupees (INR) per kg based on typical Indian market rates for the detected crop and its quality grade."
            }
          },
          required: ["name", "quality", "health", "suggested_price"]
        }
      }
    });

    console.log("Model initialized with JSON Schema configuration.");
  } catch (e) {
    console.error("Error:", e.message);
  }
}

test();
