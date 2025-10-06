// agent.mts

// IMPORTANT - Add your API keys here. Be careful not to publish them.
process.env.OPENAI_API_KEY = "";
process.env.TAVILY_API_KEY = "";

import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";

// tool node
const tools = [new TavilySearchResults({ maxResults: 3 })];
const toolNode = new ToolNode(tools);

const model = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
}).bindTools(tools);

function shouldContinue({ messages }: typeof MessagesAnnotation.State) {
  const lastMessage = messages[messages.length - 1] as AIMessage;

  if (lastMessage.tool_calls?.length) {
    console.log("Let's move on tool node");
    return "tools";
  }
  console.log("Let's move on temp node");
  return "tempAgent";
}

async function callModel(state: typeof MessagesAnnotation.State) {
  const response = await model.invoke(state.messages);

  return { messages: [response] };
}

async function tempNode(state: typeof MessagesAnnotation.State) {
  console.log("I am temp node");
}

const workflow = new StateGraph(MessagesAnnotation)
  .addNode("agent", callModel)
  .addEdge("__start__", "agent")
  .addNode("tools", toolNode)
  .addEdge("tools", "agent")
  .addNode("tempAgent", tempNode)
  .addEdge("agent", "tempAgent")
  .addConditionalEdges("agent", shouldContinue)
  .addEdge("tempAgent", "__end__");

const app = workflow.compile();

const finalState = await app.invoke({
  messages: [new HumanMessage("what is the weather in sf")],
});

console.log(finalState.messages[finalState.messages.length - 1].content);

const nextState = await app.invoke({
  messages: [...finalState.messages, new HumanMessage("what about ny")],
});

console.log(nextState.messages[nextState.messages.length - 1].content);
