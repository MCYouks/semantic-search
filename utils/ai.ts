import { Pinecone, Vector } from "@pinecone-database/pinecone";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";
import { loadQAStuffChain } from "langchain/chains";
import { Document } from "langchain/document";
import { chunk } from "lodash-es";

// Setup env config
const config = useRuntimeConfig();

type UploadTextInput = {
  text: string;
  documentName: string;
};

export const uploadText = async function (input: UploadTextInput) {
  // Extract data from input
  const { documentName, text } = input;

  // Setup Pinecone client
  const pinecone = new Pinecone({ apiKey: config.PINECONE_API_KEY, environment: config.PINECONE_ENVIRONMENT });
  const pineconeIndex = pinecone.Index(config.PINECONE_INDEX_NAME ?? "");

  // Setup text splitter
  const chunkSize = 1000;
  const chunkOverlap = 200;
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap,
  });

  // Split text
  const chunks = await textSplitter.createDocuments([text]);

  // Remove line breaks from chunks
  const documents = chunks.map((chunk) => chunk.pageContent.replace(/\n/g, " "));

  // Setup AI embeddings
  const openAI = new OpenAIEmbeddings({ openAIApiKey: config.OPENAI_API_KEY });
  const embeddings = await openAI.embedDocuments(documents);

  // Setup vector types
  interface EmbeddingVector extends Vector {
    metadata: {
      loc: string;
      pageContent: string;
      documentName: string;
    };
  }

  // Create vectors
  const vectors: EmbeddingVector[] = chunks.map((chunk, index) => ({
    id: `${documentName}_${index}`,
    values: embeddings[index],
    metadata: {
      ...chunk.metadata,
      loc: JSON.stringify(chunk.metadata.loc),
      pageContent: chunk.pageContent,
      documentName,
    },
  }));

  // Prepare for batch upload
  const batchSize = 100;
  const batches: EmbeddingVector[][] = chunk(vectors, batchSize);

  // Upload chunks
  batches.forEach(async (vectors) => {
    await pineconeIndex.upsert(vectors);
  });
};

type QueryTextInput = {
  question: string;
  documentName: string;
};

export const queryText = async function (input: QueryTextInput) {
  // Extract data from input
  const { question, documentName } = input;

  // Setup AI embeddings
  const openAI = new OpenAIEmbeddings({ openAIApiKey: config.OPENAI_API_KEY });
  const embedding = await openAI.embedQuery(question);

  // Setup Pinecone client
  const pinecone = new Pinecone({ apiKey: config.PINECONE_API_KEY, environment: config.PINECONE_ENVIRONMENT });
  const pineconeIndex = pinecone.Index(config.PINECONE_INDEX_NAME ?? "");

  // Query response
  const queryResponse = await pineconeIndex.query({
    topK: 10,
    vector: embedding,
    includeMetadata: true,
    includeValues: true,
    filter: { documentName: { $eq: documentName } },
  });

  // Merge response into one string
  const concatenatedPageContent = queryResponse.matches?.map((match) => match.metadata?.pageContent).join(" / ") ?? "";

  // Setup LLM
  const llm = new OpenAI({ openAIApiKey: config.OPENAI_API_KEY, temperature: 0.3 });

  // Setup chain
  const chain = loadQAStuffChain(llm);

  // Get response
  const response = await chain.call({
    input_documents: [new Document({ pageContent: concatenatedPageContent })],
    question,
  });

  // Setup response sources
  const sources = queryResponse.matches?.map((x) => ({
    pageContent: x.metadata?.pageContent,
    score: x.score,
  }));

  return {
    result: response.text,
    sources,
  };
};
