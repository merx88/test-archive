import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { embeddings } from "../configs/embeddingModel.js";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

const loader = new PDFLoader("./data/nke-10k-2023.pdf");
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

const docs = await loader.load();
console.log(docs[0].pageContent.slice(0, 200));
console.log(docs[0].metadata);

const allSplits = await textSplitter.splitDocuments(docs);

const vector1 = await embeddings.embedQuery(allSplits[0].pageContent);
const vector2 = await embeddings.embedQuery(allSplits[1].pageContent);

console.log(allSplits.length);

console.assert(vector1.length === vector2.length);
console.log(`Generated vectors of length ${vector1.length}\n`);
console.log(vector1.slice(0, 10));

const vectorStore = new MemoryVectorStore(embeddings);

await vectorStore.addDocuments(allSplits);

const results1 = await vectorStore.similaritySearch(
  "When was Nike incorporated?"
);

console.log(results1[0]);

const retriever = vectorStore.asRetriever({
  searchType: "mmr",
  searchKwargs: {
    fetchK: 1,
  },
});

await retriever.batch([
  "When was Nike incorporated?",
  "What was Nike's revenue in 2023?",
]);
