import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env.js";

let client: GoogleGenAI | null = null;

export function getGemini(): GoogleGenAI | null {
  if (!env.GEMINI_API_KEY) return null;
  if (!client) {
    client = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  }
  return client;
}

function cleanGeminiSchema(schema: unknown): unknown {
  if (!schema || typeof schema !== "object") return schema;
  if (Array.isArray(schema)) return schema.map(cleanGeminiSchema);
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(schema)) {
    if (k === "additionalProperties") continue;
    out[k] = cleanGeminiSchema(v);
  }
  return out;
}

export async function generateStructured(opts: {
  systemInstruction: string;
  userContent: string;
  jsonSchema: Record<string, unknown>;
  timeoutMs?: number;
}): Promise<unknown> {
  const ai = getGemini();
  if (!ai) {
    const err = new Error("AI_UNAVAILABLE");
    (err as any).code = "AI_UNAVAILABLE";
    throw err;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 25000);

  try {
    const sanitizedSchema = cleanGeminiSchema(opts.jsonSchema);
    const response = await ai.models.generateContent({
      model: env.GEMINI_MODEL,
      contents: opts.userContent,
      config: {
        systemInstruction: opts.systemInstruction,
        responseMimeType: "application/json",
        responseSchema: sanitizedSchema,
        temperature: 0.2,
        maxOutputTokens: 2048,
        abortSignal: controller.signal,
      } as any,
    });

    const text = response.text ?? "";
    return JSON.parse(text);
  } catch (err: any) {
    if (err.name === "AbortError" || controller.signal.aborted) {
      const timeoutErr = new Error("AI_TIMEOUT");
      (timeoutErr as any).code = "AI_TIMEOUT";
      throw timeoutErr;
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
