import { z } from "zod";
import { Annotation, StateGraph } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";

process.env.OPENAI_API_KEY = "";
const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
});

const StateAnnotation = Annotation.Root({
  joke: Annotation<string>,
  topic: Annotation<string>,
  feedback: Annotation<string>,
  funnyOrNot: Annotation<string>,
});

const feedbackSchema = z.object({
  grade: z
    .enum(["funny", "not funny"])
    .describe("Decide if the joke is funny or not."),
  feedback: z
    .string()
    .describe(
      "If the joke is not funny, provide feedback on how to improve it."
    ),
});

const evaluator = llm.withStructuredOutput(feedbackSchema);

async function llmCallGenerator(state: typeof StateAnnotation.State) {
  let msg;
  if (state.feedback) {
    msg = await llm.invoke(
      `Write a joke about ${state.topic} but take into account the feedback: ${state.feedback}`
    );
  } else {
    msg = await llm.invoke(`Write a joke about ${state.topic}`);
  }
  return { joke: msg.content };
}

async function llmCallEvaluator(state: typeof StateAnnotation.State) {
  // LLM evaluates the joke
  const grade = await evaluator.invoke(`Grade the joke ${state.joke}`);
  return { funnyOrNot: grade.grade, feedback: grade.feedback };
}

// Conditional edge function to route back to joke generator or end based upon feedback from the evaluator
function routeJoke(state: typeof StateAnnotation.State) {
  // Route back to joke generator or end based upon feedback from the evaluator
  if (state.funnyOrNot === "funny") {
    return "Accepted";
  } else if (state.funnyOrNot === "not funny") {
    return "Rejected + Feedback";
  }
}

// Build workflow
const optimizerWorkflow = new StateGraph(StateAnnotation)
  .addNode("llmCallGenerator", llmCallGenerator)
  .addNode("llmCallEvaluator", llmCallEvaluator)
  .addEdge("__start__", "llmCallGenerator")
  .addEdge("llmCallGenerator", "llmCallEvaluator")
  .addConditionalEdges("llmCallEvaluator", routeJoke, {
    // Name returned by routeJoke : Name of next node to visit
    Accepted: "__end__",
    "Rejected + Feedback": "llmCallGenerator",
  })
  .compile();

// Invoke
const state = await optimizerWorkflow.invoke({ topic: "Cats" });
console.log(state.joke);
