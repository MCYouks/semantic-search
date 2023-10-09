import { insertText } from '~/utils/ai'

export default defineEventHandler<{ body: { name: string; text: string; }}>(async (event) => {
  const { name, text } = await readBody(event)

  try {
    await insertText(name, text)
  } catch (error) {
    return { error }
  }
})
