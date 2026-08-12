#!/usr/bin/env bash
# Shared genre creatives for the three Boadman design directions.
# Cinematic original game-key-art register. Every prompt carries the same hard
# negative list: nothing may resemble an existing franchise, and no text.
set -u
OUT=../genre
mkdir -p "$OUT"

NEG="Absolutely must not resemble or reference any existing video game, franchise, character, studio or brand. No logos, wordmarks, letters, numbers, UI, HUD, watermarks or text of any kind anywhere in the frame. No gore, no blood, no real-world firearm brand detail. Original concept art only."

gen () { # id ratio prompt
  echo "--- $1 ---"
  node gen-image.mjs "$3 $NEG" "$OUT/$1.jpg" --ar "$2" 2>&1 | tail -1
}

gen genre-fps 21:9 \
"Cinematic wide key art for a competitive first-person-shooter tournament. Two original armoured competitors in sleek near-future tactical gear face off across a rain-slicked concrete arena at night, shot from a low dramatic angle, motion in their stance. Volumetric haze, hard rim light in burnt orange from behind, cool teal practical lights along the arena edge, shallow depth of field, embers and fine spray in the air. Rich saturated colour, high contrast, premium game key art rendering, painterly realism."

gen genre-chess 16:9 \
"Cinematic key art for a high stakes chess tournament. An oversized matte black and bone white chess set on a polished dark table, one knight lit like a hero object in a single warm shaft of light, the opposing king toppling in soft focus behind. Dramatic chiaroscuro, deep amber and cool blue colour contrast, dust motes in the beam, reflective tabletop, extreme depth of field. Luxurious, tense, cinematic, premium editorial still."

gen genre-racing 16:9 \
"Cinematic key art for a competitive racing tournament. An original low-slung futuristic race car carving through a neon-wet city corner at speed, seen three-quarter front, heavy motion blur on the background and wheels, spray kicking off the tarmac. Electric magenta and cyan reflections on wet asphalt, warm sodium streetlights, strong headlight flare. Saturated, kinetic, high energy, premium automotive game key art."

gen genre-fighting 16:9 \
"Cinematic key art for a one versus one fighting tournament. Two original stylised martial competitors mid-clash in a circular sunken arena, silhouetted against a blaze of stage light, dust and cloth caught in violent motion. Strong backlight, deep shadow, saturated crimson and gold palette, sparks and grit suspended in the air, low camera angle looking up. Operatic, powerful, premium fighting game key art."

gen genre-strategy 16:9 \
"Cinematic key art for a competitive strategy tournament. A vast illuminated tactical map table seen from a low three-quarter angle, glowing terrain and abstract unit markers rising from its surface like a hologram, an original commander figure in silhouette studying it from the edge. Cool indigo and teal glow against a warm amber key light, atmospheric haze, fine particulate in the beams. Intelligent, tense, cinematic, premium strategy game key art."

gen roster-competitors 21:9 \
"Cinematic wide group key art of five original esports competitors standing in a confident staggered line, chest up, varied ethnicities and builds, modern tactical-athletic team wear in matte charcoal with a single burnt orange stripe, slim headsets. Shot like a title-screen roster: strong orange rim light from behind, cool teal fill from the front, deep near-black background with a soft radial glow and fine atmospheric haze. Crisp stylised realism, vibrant, high contrast, premium game key art."

echo
echo "=== written ==="
ls -la "$OUT"
