import { queryText } from '~/utils/ai'

export default defineEventHandler<{ body: { question: string; documentName: string }}>(async (event) => {
  const { question, documentName } = await readBody(event)

  const response = await queryText({ question, documentName })

  return response
})
