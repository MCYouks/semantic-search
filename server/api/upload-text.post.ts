import { uploadText } from "~/utils/ai";

export default defineEventHandler<{ body: { documentName: string; text: string } }>(async (event) => {
  const { documentName, text } = await readBody(event);

  await uploadText({ text, documentName });
});
