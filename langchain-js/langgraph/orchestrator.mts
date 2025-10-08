import { Annotation, StateGraph, Send } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";

process.env.OPENAI_API_KEY = "";
const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
});

const sectionSchema = z.object({
  name: z.string().describe("Name for this section of the report."),
  description: z
    .string()
    .describe(
      "Brief overview of the main topics and concepts to be covered in this section."
    ),
});

const sectionsSchema = z.object({
  sections: z.array(sectionSchema).describe("Sections of the report."),
});

const planner = llm.withStructuredOutput(sectionsSchema);

const StateAnnotation = Annotation.Root({
  topic: Annotation<string>,
  sections: Annotation<Array<z.infer<typeof sectionSchema>>>,
  completedSections: Annotation<string[]>({
    default: () => [],
    reducer: (a, b) => a.concat(b),
  }),
  finalReport: Annotation<string>,
});

const WorkerStateAnnotation = Annotation.Root({
  section: Annotation<z.infer<typeof sectionSchema>>,
  completedSections: Annotation<string[]>({
    default: () => [],
    reducer: (a, b) => a.concat(b),
  }),
});

async function orchestrator(state: typeof StateAnnotation.State) {
  const reportSections = await planner.invoke([
    { role: "system", content: "Generate a plan for the report." },
    { role: "user", content: `Here is the report topic: ${state.topic}` },
  ]);

  return { sections: reportSections.sections };
}

async function llmCall(state: typeof WorkerStateAnnotation.State) {
  const section = await llm.invoke([
    {
      role: "system",
      content:
        "Write a report section following the provided name and description. Include no preamble for each section. Use markdown formatting.",
    },
    {
      role: "user",
      content: `Here is the section name: ${state.section.name} and description: ${state.section.description}`,
    },
  ]);

  return { completedSections: [section.content] };
}

async function synthesizer(state: typeof StateAnnotation.State) {
  const completedSections = state.completedSections;

  const completedReportSections = completedSections.join("\n\n---\n\n");

  return { finalReport: completedReportSections };
}

function assignWorkers(state: typeof StateAnnotation.State) {
  return state.sections.map((section) => new Send("llmCall", { section }));
}

const orchestratorWorker = new StateGraph(StateAnnotation)
  .addNode("orchestrator", orchestrator)
  .addNode("llmCall", llmCall)
  .addNode("synthesizer", synthesizer)
  .addEdge("__start__", "orchestrator")
  .addConditionalEdges("orchestrator", assignWorkers, ["llmCall"])
  .addEdge("llmCall", "synthesizer")
  .addEdge("synthesizer", "__end__")
  .compile();

const state = await orchestratorWorker.invoke({
  topic: "Create a report on LLM scaling laws",
});
console.log(state.finalReport);
