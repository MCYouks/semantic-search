import { uploadText } from '~/utils/ai'

export default defineEventHandler<{ body: { name: string; text: string; }}>(async (event) => {
  console.log({ event })
  const { name, text } = await readBody(event)

  console.log({ name, text })

  await uploadText(name, text)
})
