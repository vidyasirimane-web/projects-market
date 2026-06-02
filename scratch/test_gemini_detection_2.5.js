import fs from 'fs/promises';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = "YOUR_API_KEY_HERE";
const genAI = new GoogleGenerativeAI(API_KEY);

async function testDetection() {
  try {
    const imagePath = path.resolve('public/fresh_apple.png');
    const imageBuffer = await fs.readFile(imagePath);
    const base64Data = imageBuffer.toString('base64');
    const mimeType = 'image/png';

    console.log("Initializing Gemini 2.5 Flash with structured JSON output...");

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            name: {
              type: "STRING",
              description: "Name of the agricultural crop detected, e.g. Tomato, Potato, Onion, Mango, Apple."
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

    console.log("Sending fresh_apple.png to Gemini...");

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType
      }
    };

    const result = await model.generateContent([
      "Analyze this crop image and identify details. Provide the crop name, quality grade, health condition, and estimate a realistic retail price in Indian Rupees (INR) per kg based on typical Indian market rates.",
      imagePart
    ]);

    console.log("\n--- GEMINI SUCCESS RESPONSE ---");
    console.log(result.response.text());
    console.log("-------------------------------\n");

  } catch (e) {
    console.error("\n--- GEMINI DETECT ERROR ---");
    console.error(e.message);
    console.error("---------------------------\n");
  }
}

testDetection();
