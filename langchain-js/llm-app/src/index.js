import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { model } from "./configs/llmModel.js";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const systemTemplate = "Translate the following from English into {language}";

const promptTemplate = ChatPromptTemplate.fromMessages([
  ["system", systemTemplate],
  ["user", "{text}"],
]);

const promptValue = await promptTemplate.invoke({
  language: "korean",
  text: "hi!",
});

const response = await model.invoke(promptValue);
console.log(`${response.content}`);

