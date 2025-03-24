require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const portfinder = require("portfinder");
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

const app = express();

// Middleware to enable CORS and JSON body parsing
app.use(cors());
app.use(express.json());

// Serve static frontend files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Initialize Gemini AI using the API key from the environment
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemma-3-27b-it" });

const generationConfig = {
  temperature: 0.5,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

// API endpoint for analyzing legal scenarios
app.post("/analyze", async (req, res) => {
  const { scenario } = req.body;
  if (!scenario) {
    return res.status(400).json({ error: "Scenario is required." });
  }
  
  try {
    // Start a new chat session with the initial instructions and user scenario
    const chatSession = model.startChat({
      generationConfig,
      history: [
        {
          role: "user",
          parts: [
            {
              text: `"You are an advanced legal assistant specializing in Indian law, particularly the Indian Penal Code (IPC). Your primary task is to analyze a given input and determine whether it describes a real-world scenario involving illegal activity under Indian law. You must generate a response only if the input is a **scenario-based description of an event** and involves an act that is legally punishable. If the input is not a scenario or does not describe illegal activity, respond with: 'I am able to answer only law-based scenario questions. Sorry for this reply.' When generating responses, ensure accuracy by matching the correct IPC sections and punishments. Your response must be structured as follows: **Scenario:** [User's Input], followed by **Applicable IPC Sections,** listing each section number with a brief description and its corresponding punishment, if applicable."`
            },
          ],
        },
        {
          role: "model",
          parts: [{ text: "Understood. I am ready for your scenario." }],
        },
        // Add the user scenario into the conversation history
        {
          role: "user",
          parts: [{ text: scenario }],
        },
      ],
    });

    // Send the user's scenario message to the AI model
    const result = await chatSession.sendMessage(scenario);
    const responseText = result.response.text();

    return res.json({ response: responseText });
  } catch (error) {
    console.error("Error during analysis:", error);
    return res.status(500).json({ error: "Something went wrong." });
  }
});

// Serve the index.html for the base route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Use portfinder to automatically find an available port starting at 3000
portfinder.basePort = 3000;
portfinder.getPort((err, port) => {
  if (err) {
    console.error("Error finding an available port:", err);
    process.exit(1);
  }
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
});
