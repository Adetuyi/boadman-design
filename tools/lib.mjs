import { readFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

/**
 * Resolve the Google AI API key without ever printing it or asking anyone to
 * retype it.
 *
 * Order:
 *   1. GOOGLE_AI_API_KEY / GEMINI_API_KEY / GOOGLE_API_KEY from the environment
 *   2. The key already sitting in the nanobanana-mcp entry of ~/.claude.json
 *
 * (2) exists deliberately. The key is already on this machine in that file, so
 * reading it there beats echoing it into a shell command, a script literal, or
 * a chat transcript. It is never logged by anything here.
 */
export function resolveApiKey() {
  for (const name of ["GOOGLE_AI_API_KEY", "GEMINI_API_KEY", "GOOGLE_API_KEY"]) {
    const v = process.env[name];
    if (v && v.trim()) return { key: v.trim(), source: `env:${name}` };
  }

  // Claude Code owns ~/.claude.json while it is running and rewrites it on its
  // own schedule, which silently discards hand-edits. So also read any backups
  // sitting beside it - the key survives there even when the live file has been
  // rewritten out from under us.
  const candidates = [
    join(homedir(), ".claude.json"),
    join(homedir(), ".claude.json.bak-preNB"),
    join(homedir(), ".claude.json.backup"),
  ];

  for (const cfgPath of candidates) {
    if (!existsSync(cfgPath)) continue;
    try {
      const cfg = JSON.parse(readFileSync(cfgPath, "utf8"));
      const scopes = [cfg, ...Object.values(cfg.projects ?? {})];
      for (const scope of scopes) {
        for (const server of Object.values(scope?.mcpServers ?? {})) {
          const fromEnv = server?.env?.GOOGLE_AI_API_KEY ?? server?.env?.GEMINI_API_KEY;
          if (fromEnv) return { key: fromEnv, source: `${cfgPath} (env block)` };
          for (const arg of server?.args ?? []) {
            const m = /^(?:GOOGLE_AI_API_KEY|GEMINI_API_KEY|GOOGLE_API_KEY)=(.+)$/.exec(String(arg));
            if (m) return { key: m[1], source: `${cfgPath} (mcp args)` };
          }
        }
      }
    } catch {
      /* try the next candidate */
    }
  }

  throw new Error(
    "No API key found. Set GOOGLE_AI_API_KEY in the environment, or add the " +
      "nanobanana-mcp server via `claude mcp add` so the key lands in ~/.claude.json.",
  );
}

/**
 * Image models this key can actually see, verified against ModelService.ListModels
 * on 2026-08-12 (not guessed). Cheapest-first, so a batch does not burn Pro
 * credits on a texture. Override with --model / NB_MODEL.
 *
 * Verified real: gemini-3.1-flash-lite-image, gemini-3.1-flash-image,
 * gemini-3.1-flash-image-preview, gemini-2.5-flash-image, gemini-3-pro-image,
 * gemini-3-pro-image-preview. The imagen-4.0-* models exist too but expose
 * `predict`, not `generateContent`, so they need a different call shape.
 *
 * NOTE: as of the last check every one of these returned 429 with `limit: 0`
 * on the free tier. That is not exhausted quota, it is no allowance at all -
 * image generation on this API needs billing enabled on the Google Cloud
 * project behind the key.
 */
export const MODEL_CANDIDATES = [
  "gemini-3.1-flash-lite-image",
  "gemini-3.1-flash-image",
  "gemini-2.5-flash-image",
  "gemini-3-pro-image",
];

/**
 * Pull image bytes out of a generateContent response.
 *
 * Returns {images: Buffer[], text: string}. The caller MUST treat an empty
 * images array as a failure. A response carrying only text is the normal shape
 * of a safety refusal, a bad model id, or a quota rejection - all of which look
 * identical to success if you only loop looking for inlineData.
 */
export function extractImages(res) {
  const images = [];
  const texts = [];
  const candidates = res?.candidates ?? [];
  for (const c of candidates) {
    for (const part of c?.content?.parts ?? []) {
      if (part?.inlineData?.data) {
        images.push({
          buffer: Buffer.from(part.inlineData.data, "base64"),
          mimeType: part.inlineData.mimeType ?? "image/png",
        });
      } else if (part?.text) {
        texts.push(part.text);
      }
    }
    if (c?.finishReason && c.finishReason !== "STOP") {
      texts.push(`finishReason=${c.finishReason}`);
    }
  }
  if (res?.promptFeedback?.blockReason) {
    texts.push(`blockReason=${res.promptFeedback.blockReason}`);
  }
  return { images, text: texts.join(" | ").trim() };
}

export function extFor(mimeType) {
  if (mimeType.includes("jpeg") || mimeType.includes("jpg")) return ".jpg";
  if (mimeType.includes("webp")) return ".webp";
  return ".png";
}
