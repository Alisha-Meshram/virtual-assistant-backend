import axios from "axios";

export const geminiResponse = async (command, assistantName, userName) => {
  try {
    const API_KEY = process.env.GEMINI_API_KEY;

    
    console.log("API KEY:", process.env.GEMINI_API_KEY);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

    const prompt = `
You are a virtual assistant named ${assistantName}, created by ${userName}.
You are not Google. You behave like a helpful voice-enabled AI assistant.

Respond ONLY in JSON format:

{
  "type": "general | google-search | youtube-search | youtube-play | get-time | get-day | get-date | get-month | calculator-open | instagram-open | facebook-open | weather-show",
  "userInput": "<original user input>",
  "response": "<short voice-friendly reply>"
}

User input: ${command}
`;

    const result = await axios.post(url, {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    });

    return result.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.log("❌ Gemini Error:", error.response?.data || error.message);
    return null;
  }
};