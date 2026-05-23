import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";

function resolveApiKey(): string {
  const fromEnv = process.env.ANTHROPIC_API_KEY;
  if (fromEnv) return fromEnv;

  try {
    const envPath = path.join(process.cwd(), ".env.local");
    const lines = fs.readFileSync(envPath, "utf8").split("\n");
    for (const line of lines) {
      if (line.startsWith("ANTHROPIC_API_KEY=")) {
        const val = line.slice("ANTHROPIC_API_KEY=".length).trim();
        if (val) return val;
      }
    }
  } catch {}

  throw new Error("ANTHROPIC_API_KEY לא מוגדר ב-.env.local");
}

export function getAnthropicClient() {
  return new Anthropic({ apiKey: resolveApiKey() });
}
