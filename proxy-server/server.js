require('dotenv').config();
const { inject } = require('@vercel/analytics');

inject();

const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Text analysis
app.post('/api/analyze', async (req, res) => {
  try {
    const { text, context } = req.body;
    console.log(text);
    console.log(context);

    if (!text || !context) {
      return res.status(400).json({
        success: false,
        error: 'Text and context are required',
      });
    }

    const prompt = `
      Respond in exactly this format:
      brief analysis of ${context} under 50 words
      - Use easy words
      - Analysis should be concise, clear, and easy to understand.
      - Analysis must be based on facts, no hallucinations.
    `;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    res.status(200).json({
      success: true,
      result: response,
    });
  } catch (error) {
    console.error('AI analysis error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Definition
app.post('/api/definition', async (req, res) => {
  try {
    const { text, context } = req.body;

    if (!text || !context) {
      return res.status(400).json({
        success: false,
        error: 'Text and context are required',
      });
    }

    const prompt = `
      Get the definition of ${text} based on the context: ${context}.
      Respond in exactly this format:
      [parts of speech]: [definition]

      - If there are multiple definitions, seperate them by -.
      - Be concise and clear.
      - Parts of speech surrounded by [].
    `;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    res.status(200).json({
      success: true,
      result: response,
    });
  } catch (error) {
    console.error('AI definition error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`SERVER LISTENING ON PORT: ${PORT}`);
});
