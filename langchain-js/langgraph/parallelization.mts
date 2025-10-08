import { StateGraph, Annotation } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";

process.env.OPENAI_API_KEY = "";
const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
});

const StateAnnotation = Annotation.Root({
  topic: Annotation<string>,
  joke: Annotation<string>,
  story: Annotation<string>,
  poem: Annotation<string>,
  combinedOutput: Annotation<string>,
});

async function callLlm1(state: typeof StateAnnotation.State) {
  const msg = await llm.invoke(`write a joke ${state.topic}`);
  return { joke: msg.content };
}

async function callLlm2(state: typeof StateAnnotation.State) {
  const msg = await llm.invoke(`write a story about ${state.topic}`);
  return { story: msg.content };
}

async function callLlm3(state: typeof StateAnnotation.State) {
  const msg = await llm.invoke(`Write a poem about ${state.topic}`);
  return { poem: msg.content };
}

async function aggregator(state: typeof StateAnnotation.State) {
  const combined =
    `Here's a story, joke, and poem about ${state.topic}!\n\n` +
    `STORY:\n${state.story}\n\n` +
    `JOKE:\n${state.joke}\n\n` +
    `POEM:\n${state.poem}`;
  return { combinedOutput: combined };
}

const parallelWorkflow = new StateGraph(StateAnnotation)
  .addNode("callLlm1", callLlm1)
  .addNode("callLlm2", callLlm2)
  .addNode("callLlm3", callLlm3)
  .addNode("aggregator", aggregator)
  .addEdge("__start__", "callLlm1")
  .addEdge("__start__", "callLlm2")
  .addEdge("__start__", "callLlm3")
  .addEdge("callLlm1", "aggregator")
  .addEdge("callLlm2", "aggregator")
  .addEdge("callLlm3", "aggregator")
  .addEdge("aggregator", "__end__")
  .compile();

const result = await parallelWorkflow.invoke({ topic: "cats" });
console.log(result.combinedOutput);
