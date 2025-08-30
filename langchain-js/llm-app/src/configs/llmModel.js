import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import 'dotenv/config';

export const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  temperature: 0,
});

