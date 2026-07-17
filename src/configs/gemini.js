import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "AIzaSyDNazDOC9IShu4aFCl8h-z79kQAM97cev4";

export async function runStream({
  prompt,
  history = [],
  modelName = "gemini-2.0-flash",
  temperature = 1.0,
  maxOutputTokens = 8192,
  systemInstruction = "",
  userApiKey = "",
  onChunk = () => {},
  fileData = null, // { mimeType: string, data: base64_string }
}) {
  const activeKey = userApiKey.trim() || apiKey;
  const genAI = new GoogleGenerativeAI(activeKey);

  const modelOptions = {
    model: modelName,
  };

  if (systemInstruction && systemInstruction.trim()) {
    modelOptions.systemInstruction = systemInstruction;
  }

  const model = genAI.getGenerativeModel(modelOptions);

  const generationConfig = {
    temperature: parseFloat(temperature),
    topP: 0.95,
    topK: 40,
    maxOutputTokens: parseInt(maxOutputTokens) || 8192,
  };

  // Convert history from custom format to Gemini expected format: { role: 'user' | 'model', parts: [{ text: string }] }
  const formattedHistory = history.map((msg) => ({
    role: msg.role === "user" ? "user" : "model",
    parts: [{ text: msg.content }],
  }));

  const chatSession = model.startChat({
    generationConfig,
    history: formattedHistory,
  });

  const messageParts = [];
  if (fileData) {
    messageParts.push({
      inlineData: {
        data: fileData.data,
        mimeType: fileData.mimeType,
      },
    });
  }
  messageParts.push({ text: prompt });

  const result = await chatSession.sendMessageStream(messageParts);

  let fullText = "";
  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    fullText += chunkText;
    onChunk(chunkText, fullText);
  }

  return fullText;
}

export default runStream;
