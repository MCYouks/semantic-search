import { Document } from 'langchain/document'
import { insertDocument } from '~/utils/ai'

export default defineEventHandler<{ body: { name: string; text: string; }}>(async (event) => {
  const body = await readBody(event)
  const { name, text } = body

  const document = new Document({ pageContent: text, metadata: { name } })

  try {
    const data = await insertDocument(document)
    return { data }
  } catch (error) {
    return { error }
  }
})
