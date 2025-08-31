import { VertexAIEmbeddings } from "@langchain/google-vertexai";
import 'dotenv/config';

export const embeddings = new VertexAIEmbeddings({
  model: "text-embedding-004"
});