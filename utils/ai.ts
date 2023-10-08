import {Pinecone} from '@pinecone-database/pinecone';
import {Document} from 'langchain/document';

export const insertDocument = async function(doc: Document) {
  // Setup Pinecone client
  const client = new Pinecone();
  const index = client.Index(process.env.PINECONE_INDEX_NAME ?? '');

}