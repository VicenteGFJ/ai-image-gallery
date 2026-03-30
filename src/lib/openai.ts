import OpenAI from 'openai'

export function createOpenAIClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })
}

export const ANALYSIS_PROMPT = `You are an image analysis assistant. Analyze the provided image and respond ONLY with a valid JSON object with two keys: "tags" (array of 5-10 short, lowercase, human-readable descriptive strings) and "description" (one complete sentence describing the image in plain English). No markdown, no explanation — raw JSON only.`
