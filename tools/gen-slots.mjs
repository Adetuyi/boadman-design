#!/usr/bin/env node
/**
 * gen-slots.mjs - batch-generate every IMAGE-SLOT declared in one or more HTML
 * files, then rewrite the files to point at the generated assets.
 *
 *   node gen-slots.mjs ../taste/*.html --out ../generated [--model id] [--dry] [--force]
 *
 * Slot format emitted by the design directions:
 *   <!-- IMAGE-SLOT id="hero-primary" ratio="16:9" px="2400x1350" prompt="..." -->
 *
 * Behaviour:
 *   --dry     list what would be generated, call nothing.
 *   --force   regenerate even if the output file already exists.
 *   By default an existing asset is skipped, so reruns are cheap and safe.
 *
 * A slot that fails is reported and counted; it does NOT abort the batch and it
 * does NOT get quietly marked done. Exit code is non-zero if anything failed.
 */
import { GoogleGenAI } from "@google/genai";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { resolveApiKey, MODEL_CANDIDATES, extractImages, extFor } from "./lib.mjs";

const argv = process.argv.slice(2);
const takeFlag = (name) => {
  const i = argv.indexOf(`--${name}`);
  if (i === -1) return null;
  const v = argv[i + 1];
  const hasVal = v && !v.startsWith("--");
  argv.splice(i, hasVal ? 2 : 1);
  return hasVal ? v : true;
};

const dry = Boolean(takeFlag("dry"));
const force = Boolean(takeFlag("force"));
const modelFlag = takeFlag("model") ?? process.env.NB_MODEL ?? null;
const outDir = resolve(takeFlag("out") ?? "./generated");
const files = argv.filter((a) => !a.startsWith("--"));

if (!files.length) {
  console.error("usage: node gen-slots.mjs <file.html...> --out <dir> [--model id] [--dry] [--force]");
  process.exit(2);
}

const SLOT_RE =
  /<!--\s*IMAGE-SLOT\s+id="([^"]+)"\s+ratio="([^"]+)"\s+px="([^"]+)"\s+prompt="([\s\S]*?)"\s*-->/g;

const slots = [];
for (const f of files) {
  const html = readFileSync(f, "utf8");
  // Namespace the output by source file. Slot ids are only unique WITHIN a page,
  // and two pages independently picked `coins-unit` - which, with a bare
  // `{id}.png` output path, made the second generation silently overwrite the
  // first and left one page rendering art written for the other page's prompt,
  // while the run still reported success. Never key an artifact on a name the
  // author did not promise to keep globally unique.
  const ns = basename(f).replace(/\.html?$/i, "");
  for (const m of html.matchAll(SLOT_RE)) {
    slots.push({
      file: f,
      id: m[1],
      key: `${ns}--${m[1]}`,
      ratio: m[2],
      px: m[3],
      prompt: m[4].trim(),
    });
  }
}

// Belt and braces: if two slots would still collide, refuse rather than clobber.
const byKey = new Map();
for (const s of slots) {
  if (byKey.has(s.key)) {
    console.error(`Duplicate slot id "${s.id}" within ${s.file}. Ids must be unique per page.`);
    process.exit(1);
  }
  byKey.set(s.key, s);
}

if (!slots.length) {
  console.error("No IMAGE-SLOT comments found in:", files.join(", "));
  process.exit(1);
}

console.log(`${slots.length} slot(s) across ${files.length} file(s), out -> ${outDir}\n`);
for (const s of slots) {
  console.log(`  [${basename(s.file)}] ${s.id}  ${s.ratio}  ${s.px}`);
  console.log(`      ${s.prompt.slice(0, 110)}${s.prompt.length > 110 ? "..." : ""}`);
}
if (dry) {
  console.log("\n--dry: nothing generated.");
  process.exit(0);
}

const { key, source } = resolveApiKey();
console.error(`\n[gen-slots] key from ${source}`);
const ai = new GoogleGenAI({ apiKey: key });
const models = modelFlag ? [modelFlag] : MODEL_CANDIDATES;

mkdirSync(outDir, { recursive: true });

let pinned = null;
const done = [];
const failed = [];

for (const slot of slots) {
  // Keyed on `slot.key` (page + id), never on `slot.id` alone. See the note at
  // the slot-collection step: ids are unique per page, not globally.
  const target = join(outDir, `${slot.key}.png`);
  // The model may return JPEG or WebP, so the file on disk will not always be
  // the .png we asked for. Check every extension, or the skip test never fires
  // and every rerun silently regenerates the whole batch.
  const existing = [".png", ".jpg", ".webp"]
    .map((e) => target.replace(/\.png$/, e))
    .find((p) => existsSync(p));
  if (!force && existing) {
    console.log(`skip   ${slot.key} (exists)`);
    done.push({ slot, path: existing });
    continue;
  }

  let ok = false;
  for (const model of pinned ? [pinned] : models) {
    try {
      process.stdout.write(`gen    ${slot.key} via ${model} ... `);
      const res = await ai.models.generateContent({
        model,
        contents: slot.prompt,
        config: { imageConfig: { aspectRatio: slot.ratio } },
      });
      const { images, text } = extractImages(res);
      if (!images.length) {
        console.log(`no image (${text || "empty response"})`);
        continue;
      }
      const img = images[0];
      const path = target.replace(/\.png$/, extFor(img.mimeType));
      writeFileSync(path, img.buffer);
      console.log(`ok  ${(img.buffer.length / 1024).toFixed(0)} KB`);
      pinned = model; // first model that works is used for the rest
      done.push({ slot, path });
      ok = true;
      break;
    } catch (e) {
      console.log(`failed (${e?.message?.split("\n")[0]?.slice(0, 90)})`);
    }
  }
  if (!ok) failed.push(slot);
}

// Rewrite each HTML so the slot comment is followed by a real <img>, replacing
// any placeholder element that a previous run inserted.
const GEN_MARK = /\n\s*<img data-gen-slot="[^"]+"[^>]*>/g;
for (const f of files) {
  let html = readFileSync(f, "utf8").replace(GEN_MARK, "");
  let touched = false;
  for (const { slot, path } of done) {
    if (slot.file !== f) continue;
    const rel = `./${basename(outDir)}/${basename(path)}`;
    const tag = `\n<img data-gen-slot="${slot.id}" src="${rel}" alt="" width="${slot.px.split("x")[0]}" height="${slot.px.split("x")[1]}" loading="lazy" decoding="async">`;
    const re = new RegExp(`(<!--\\s*IMAGE-SLOT\\s+id="${slot.id}"[\\s\\S]*?-->)`);
    if (re.test(html)) {
      html = html.replace(re, `$1${tag}`);
      touched = true;
    }
  }
  if (touched) {
    writeFileSync(f, html);
    console.log(`wired  ${basename(f)}`);
  }
}

console.log(`\ndone: ${done.length}   failed: ${failed.length}`);
if (failed.length) {
  console.log("failed slots:");
  for (const s of failed) console.log(`  ${s.key}`);
  process.exit(1);
}
