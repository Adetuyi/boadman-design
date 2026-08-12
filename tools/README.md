# Image generation tools

Standalone scripts, no MCP required. Built because the `nanobanana-mcp` server
was not reachable from a running session and hand-edits to `~/.claude.json` get
overwritten by the app that owns it.

## Status as of 2026-08-12

| Check | Result |
|---|---|
| Credential authenticates | **yes** (the `AQ.` token works; the earlier one returned `401 ACCESS_TOKEN_TYPE_UNSUPPORTED`) |
| Model names known | **yes**, verified against `ListModels`, not guessed |
| Image generation works | **no** - every image model returns `429` with `limit: 0` |

`limit: 0` is the blocker and it is not exhausted quota. There is **no free-tier
allowance for image models** on the project behind this key. It needs billing
enabled on that Google Cloud project. Nothing in these scripts can work around
that.

Everything else is ready: the moment billing is on, `gen-slots.mjs` fills every
slot in one command.

## Usage

```bash
# one image
node gen-image.mjs "a prompt" out.png --ar 16:9

# discover which models respond, and list what the key can see on failure
node gen-image.mjs "a prompt" out.png --probe

# batch: fill every IMAGE-SLOT in the design directions and wire the <img> tags in
node gen-slots.mjs ../taste/*.html --out ../generated --dry   # preview first
node gen-slots.mjs ../taste/*.html --out ../generated
```

## Slot format

The design directions emit these; `gen-slots.mjs` reads them, generates each
one, and inserts an `<img>` immediately after the comment.

```html
<!-- IMAGE-SLOT id="hero-primary" ratio="16:9" px="2400x1350" prompt="..." -->
```

Reruns skip slots whose output already exists, so it is safe to run repeatedly.
`--force` regenerates. A failed slot is reported and counted, never silently
skipped, and the process exits non-zero.

## The credential

Resolved in this order, so nobody has to retype or paste a key:

1. `GOOGLE_AI_API_KEY` / `GEMINI_API_KEY` / `GOOGLE_API_KEY` from the environment
2. the `nanobanana-mcp` entry in `~/.claude.json`, including `.bak-*` copies
   beside it

**The key is currently passed as a CLI argument in the MCP config** (`-e
GOOGLE_AI_API_KEY=...`), which exposes it in the process list to any local
process, while the `env` block sits empty. Worth moving into `env` and rotating,
but test after moving: the package ships its own `-e` flag, so it may not read
`process.env`.

## Why not just use the sketch

The obvious version loops over response parts looking for `inlineData` and
writes whatever it finds. When the API returns text instead of an image - a
safety refusal, a wrong model id, a quota rejection - that loop finds nothing,
writes nothing, and **exits 0 reporting success**. Every failure above would
have looked like a silent no-op. These scripts treat an imageless response as a
failure and say which of the three it was.
