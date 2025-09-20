import { ChatPromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

import "dotenv/config";

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  temperature: 0,
});

const taggingPrompt2 = ChatPromptTemplate.fromTemplate(
  `Extract the desired information from the following passage.
  
  Only extract the properties mentioned in the 'Classification' function.
  
  Passage:
  {input}
  `
);

const classificationSchema2 = z.object({
  sentiment: z
    .enum(["happy", "neutral", "sad"])
    .describe("The sentiment of the text"),
  aggressiveness: z
    .number()
    .int()
    .describe(
      "describes how aggressive the statement is on a scale from 1 to 5. The higher the number the more aggressive"
    ),
  language: z
    .enum(["spanish", "english", "french", "german", "italian"])
    .describe("The language the text is written in"),
});

// Name is optional, but gives the models more clues as to what your schema represents
const llmWithStructuredOutput2 = llm.withStructuredOutput(
  classificationSchema2,
  { name: "extractor" }
);

const prompt3 = await taggingPrompt2.invoke({
  input: "Estoy muy enojado con vos! Te voy a dar tu merecido!",
});
const response = await llmWithStructuredOutput2.invoke(prompt3);

console.log(JSON.stringify(response, null, 2));
