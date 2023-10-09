import { Pinecone, Vector } from '@pinecone-database/pinecone'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'

export const insertText = async function (documentName: string, text: string) {
  // Setup Pinecone client
  const pinecone = new Pinecone()
  const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME ?? '')

  // Setup text splitter
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000
  })

  // Split text
  const chunks = await textSplitter.createDocuments([text])

  // Remove line breaks from chunks
  const documents = chunks.map(chunk => chunk.pageContent.replace(/\n/g, ' '))

  // Setup AI embeddings
  const openAI = new OpenAIEmbeddings()
  const embeddings = await openAI.embedDocuments(documents)

  // Setup vector types
  interface EmbeddingVector extends Vector {
    metadata: {
      loc: string;
      pageContent: string;
      documentName: string
    }
  }

  // Create vectors
  const vectors: EmbeddingVector[] = chunks.map((chunk, index) => ({
    id: `${documentName}_${index}`,
    values: embeddings[index],
    metadata: {
      ...chunk.metadata,
      loc: JSON.stringify(chunk.metadata.loc),
      pageContent: chunk.pageContent,
      documentName
    }
  }))

  // Prepare for batch upload
  const batchSize = 100
  const batches: (typeof vectors)[] = _chunk(vectors, batchSize)

  // Upload chunks
  batches.forEach(async (vectors) => {
    await pineconeIndex.upsert(vectors)
  })
}
