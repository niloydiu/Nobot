// const apiKey = "AIzaSyDNazDOC9IShu4aFCl8h-z79kQAM97cev4";

import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "AIzaSyDNazDOC9IShu4aFCl8h-z79kQAM97cev4";
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

async function run(prompt) {
  const chatSession = model.startChat({
    generationConfig,
    history: [],
  });

  const result = await chatSession.sendMessage(prompt);
  console.log(result.response.text());
  return result.response.text();
}

export default run;
