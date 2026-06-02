const API_KEY = "YOUR_API_KEY_HERE";

async function listSupportedModels() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
    const data = await response.json();
    if (!data.models) {
      console.log("No models returned:", data);
      return;
    }
    
    const geminiModels = data.models
      .map(m => m.name)
      .filter(name => name.includes("gemini"));
      
    console.log("Gemini Models:", JSON.stringify(geminiModels, null, 2));
  } catch (e) {
    console.error("Error listing:", e.message);
  }
}

listSupportedModels();
