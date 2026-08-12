# brand-spec.md · Boadman

Gate file for the huashu-design §1.a asset protocol. Written before any direction
work. Records what brand assets exist, where they are, and what may not be used.

## The product

Boadman is a competition platform for video-game players, 18+. Players buy **coins**
(1 coin = 10p), stake them in 1v1 challenges and tournaments, and cash winnings out to
a bank account in their own legal name. Full product facts, including the money path
and the legal position, live in `FACTS.md` and are authoritative.

No external fact-verification was required: this is the user's own product, and
`FACTS.md` is first-party and current as of 2026-08-12.

## Assets held

| Asset | Path | Status |
|---|---|---|
| Logo (helmet + wordmark) | `boadman-web/public/boadman-logo.svg` | ✅ Official, 164:55, the only fixed visual element |
| Logo, raster | `boadman-web/public/boadman-logo-image.png` | ✅ 328×110 |
| Mark only (helmet, no wordmark) | `boadman-web/src/app/icon.png` | ✅ 63×110, used as the favicon |
| Production tokens | `boadman-web/src/app/globals.css` | ✅ Current values, **not** a constraint |
| Genre creatives | `design-alternatives/genre/*.jpg` | ✅ Generated for this project, ours outright |

**Logo handling:** inline the SVG or base64-embed it. Never redraw, never distort the
164:55 ratio, never substitute an abstract mark. It is the one immutable element.

## Colour and type

Current production values, offered as a **starting point the directions may argue
past**, not a specification:

- Page `#0B0C10` · panel `#14151D` · elevated `#1C1E28`
- Accent flame `#FF5733`, with `#FFA700` / `#E63E1B` / `#A30300`
- Semantic: success `#22D279` · danger `#FF3F4E` · warning `#FFAA22` · info `#4D87FF`
- Compliance theme (admin surfaces, second theme any palette must also serve):
  slate `#0F1015` with purple `#9B6BFF`
- Type: Space Grotesk (display/money) · Inter (body) · Barlow Condensed 800 (stamps)
  · JetBrains Mono (meta). **Open to change.**

**The one binding typographic rule:** money renders with tabular figures, an explicit
unit, and prizes are never abbreviated (`12,400 coins`, not `12.4k`). Whichever face a
direction picks must therefore have tabular figures. Public platform counters are the
one compacted exception.

## 🔴 Forbidden assets

**We hold rights to no game.** No key art, screenshots, characters, weapons, maps, HUD
elements or logos from any commercial title, at any opacity, in any direction.

The following files are in this repository and are **unlicensed**. They are being
removed and must never be used, reproduced, or matched:

| File | What it actually is |
|---|---|
| `boadman-web/public/games/HeroBackground.png` | **Destiny 2** key art (Bungie) |
| `boadman-web/public/games/CyberPunk.png` | **Cyberpunk 2077: Ultimate Edition** cover (CD Projekt Red) |
| `boadman-web/public/games/CallOfDutyFull.png` | **Call of Duty: Modern Warfare III** cover (Activision) |
| `boadman-designs/_assets/svgs/*.svg` (nine game marks) | Third-party game logos |

⚠️ `HeroBackground.png` was cited as a visual reference for the genre creatives. It is
usable **only as a register** — cinematic, atmospheric, character-in-scene, rich
colour. Nothing generated may resemble it, its characters, or its franchise.

Also forbidden: named commercial game titles in designed content. Genre words (FPS,
strategy, racing, fighting, sports, puzzle) and genuinely unbranded games such as
**Chess** are fine.

## Third-party logos required by huashu §1.a

**None.** No third-party product or brand is named or displayed anywhere in this
design. The only mark on the page is Boadman's own, so the named-product logo
sub-gate does not apply.

The one external body that appears is **GamCare** (the responsible-play referral,
0808 8020 133, gamcare.org.uk). It is a required text referral, rendered as plain
text and a link. Do not reproduce its logo.

## Content that must never be fabricated

No testimonials, quotes, press mentions, partner or publisher logos, case studies, or
campaign results. No named individuals presented as real players or hosts — a previous
round shipped invented hosts and that is a defect, not a pattern to follow.

Sample competition data **is** permitted for this round, at the user's direction, and
must be visibly marked as sample.
