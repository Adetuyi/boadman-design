#!/usr/bin/env node
/**
 * gen-image.mjs - generate one image.
 *
 *   node gen-image.mjs "a prompt" out.png [--model <id>] [--ar 16:9] [--probe]
 *
 *   --probe   try each candidate model in turn and report which one works.
 *             Use this once to discover the right model id, then pin it.
 *
 * Exits non-zero and explains itself whenever no image comes back. A response
 * containing only text is a FAILURE here, not an empty success.
 */
import { GoogleGenAI } from "@google/genai";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, extname } from "node:path";
import { resolveApiKey, MODEL_CANDIDATES, extractImages, extFor } from "./lib.mjs";

const argv = process.argv.slice(2);
const flag = (name, fallback = null) => {
  const i = argv.indexOf(`--${name}`);
  if (i === -1) return fallback;
  const v = argv[i + 1];
  argv.splice(i, v && !v.startsWith("--") ? 2 : 1);
  return v && !v.startsWith("--") ? v : true;
};

const probe = Boolean(flag("probe", false));
const modelFlag = flag("model", process.env.NB_MODEL ?? null);
const aspect = flag("ar", null);

const [prompt, outArg = "out.png"] = argv;
if (!prompt) {
  console.error('usage: node gen-image.mjs "prompt" [out.png] [--model id] [--ar 16:9] [--probe]');
  process.exit(2);
}

const { key, source } = resolveApiKey();
console.error(`[gen-image] key from ${source}`);
const ai = new GoogleGenAI({ apiKey: key });

const models = modelFlag && modelFlag !== true ? [modelFlag] : MODEL_CANDIDATES;

async function attempt(model) {
  const config = {};
  if (aspect && aspect !== true) config.imageConfig = { aspectRatio: aspect };
  const res = await ai.models.generateContent({
    model,
    contents: prompt,
    ...(Object.keys(config).length ? { config } : {}),
  });
  return extractImages(res);
}

let lastErr = null;
for (const model of models) {
  try {
    process.stderr.write(`[gen-image] trying ${model} ... `);
    const { images, text } = await attempt(model);
    if (!images.length) {
      console.error(`no image returned. model said: ${text || "(nothing)"}`);
      lastErr = new Error(`${model}: no image in response`);
      if (probe) continue;
      process.exit(1);
    }
    const base = outArg.replace(/\.(png|jpe?g|webp)$/i, "");
    mkdirSync(dirname(outArg) || ".", { recursive: true });
    images.forEach((img, i) => {
      const ext = extname(outArg) || extFor(img.mimeType);
      const path = images.length === 1 ? `${base}${ext}` : `${base}-${i + 1}${ext}`;
      writeFileSync(path, img.buffer);
      console.error(`ok`);
      console.log(`${path}  (${model}, ${(img.buffer.length / 1024).toFixed(0)} KB)`);
    });
    process.exit(0);
  } catch (e) {
    console.error(`failed: ${e?.message?.split("\n")[0] ?? e}`);
    lastErr = e;
  }
}

console.error("\n[gen-image] every model candidate failed.");
if (probe) {
  try {
    console.error("[gen-image] models the key can see:");
    const pager = await ai.models.list();
    const seen = [];
    for await (const m of pager) seen.push(m.name ?? m.model ?? String(m));
    const imagey = seen.filter((n) => /image|imagen|banana/i.test(n));
    console.error((imagey.length ? imagey : seen).map((n) => `  ${n}`).join("\n"));
  } catch (e) {
    console.error(`  (could not list models: ${e?.message?.split("\n")[0]})`);
  }
}
console.error(`\nlast error: ${lastErr?.message ?? lastErr}`);
process.exit(1);
