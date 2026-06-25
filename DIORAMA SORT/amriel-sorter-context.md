# Amriel Image Sorter — Context & Build Spec

## Project Overview

A local web app that sorts thousands of fashion/design reference images from iMessage into a structured folder taxonomy for the Amriel brand archive. This is the MVP for a future brand-architecture tool (moodboards, manufacturer comms, file directory, task tracker, AI sorting — all in one for small fashion brand teams).

## Existing pipeline (already working)

1. iMessage caches preview images locally as `.ktx` files in `~/Library/Messages/Caches/Previews/Attachments/`
2. A bash script (`pull-imessages.command` already in Downloads) extracts them using `sips` to convert KTX→PNG, filtering by chat ID + date
3. Output PNGs land in `~/Downloads/SORT CLAUDE/`
4. **This sorter app is step 4**: read each PNG, classify with LLM, user confirms/overrides, move to correct folder

## Target tech stack

- **Single self-contained HTML file** (open in Chrome, no install)
- **File System Access API** for reading/writing folders
- **Gemini 2.5 Flash API** for vision (generous free tier, vision-capable, cheap)
- **Vanilla JS** (or inline React if you want)
- **LocalStorage** for preferences, in-session learning, recent corrections
- No backend required

## Folder structure on disk

```
~/Downloads/
├── SORT CLAUDE/                  # incoming images
│   ├── PNG image_vXXX.png        # to be sorted
│   ├── _DONE/                    # sorted originals
│   │   ├── batch_01/
│   │   └── batch_02/
│   └── _TRASH/                   # duplicates / non-Amriel content
└── CLAUDE SORTED/                # destination
    ├── TSHIRT/
    ├── GRAPHICS/
    ├── AMRIEL GALLERY/
    └── ... (47 folders, listed below)
```

When sorted: file gets **copied** to one or more target folders in `CLAUDE SORTED/`, and the original gets **moved** to `SORT CLAUDE/_DONE/batch_N/`. Originals never get deleted, only moved.

---

## Folder Taxonomy (47 folders)

### Garments
| Folder | What goes here |
|---|---|
| **TSHIRT** | T-shirts, long-sleeve tees, any cotton tee. Even if it has a jersey-style graphic, if it's a cotton longsleeve it's still TSHIRT. |
| **BUTTON DOWN** | Garments with a **full vertical button opening top to bottom**. Cardigans count. Henleys (partial placket) don't. |
| **SWEATSHIRT** | Hoodies, sweatshirts, knit sweaters |
| **TANKTOP** | Tank tops, sleeveless tops |
| **POLO** | Polo shirts |
| **JACKETS** | Jackets, blazers, coats, tactical jackets. Even unique-looking ones. |
| **PANTS** | All bottoms: pants, shorts, regular skirts. Only TRULY bizarre skirts/dresses go to SPECIALTY GARMENT. |
| **UNDERWEAR** | Underwear, lingerie. Also tag here if a shorts/pants shot has underwear waistband as the focus. |
| **SOCKS** | Socks |
| **HAT** | Hats, caps, beanies |
| **GLOVES** | Gloves |
| **SCARVES** | Scarves |
| **BELT** | Belts |
| **SUNGLASSES** | Sunglasses |
| **MENS SHOES** | Men's shoes, unisex sneakers, athletic shoes, default for unisex |
| **WOMENS SHOES** | Heels (always), women's shoes |
| **MASK** | All masks: face, theatrical, ritual |
| **JERSEY** | **Actual sports jerseys ONLY** (not cotton longsleeves with jersey-style graphics) |
| **SPECIALTY GARMENT** | Only TRULY unusual / uncategorizable pieces. Wearable art dresses, extreme designs. Regular tactical jackets are still JACKETS. |

### Composition / Styling
| Folder | What goes here |
|---|---|
| **OUTFIT** | Photo showing an outfit being worn / styled. Don't auto-add individual garment tags unless clearly emphasized. |
| **GARMENT DETAILS** | Close-ups of techniques: ruffle, embroidery, distressing, applique, metal cross on hat, etc. Only when the detail is the visible feature. |
| **FABRICS** | Close-up of fabric texture/weave, fabric swatch, or genuinely unusual fabric. NOT for embellishments (those are GARMENT DETAILS). |

### Visual / Design
| Folder | What goes here |
|---|---|
| **GRAPHICS** | Isolated graphics, posters, illustrations. Close-ups of a graphic on a garment where the graphic dominates. Typography-as-design (when emphasis is on visual form, not the meaning of the words). |
| **PHRASES** | Standalone text/phrases where the **meaning** matters. NOT for text on garments (text on tee = TSHIRT only). |
| **ARTWORKS** | Distinctive standalone artworks (paintings, art objects, optical illusions like Freud's illustration). |

### Brand-specific
| Folder | What goes here |
|---|---|
| **AMRIEL GALLERY** | Anything Amriel brand: explicit "amriel" branding/logo, OR recognizable Amriel-style designs/sketches (cross/tree/garden motifs etc.). **When tagging AMRIEL GALLERY, ALSO tag the garment folder** (Amriel tee → TSHIRT + AMRIEL GALLERY). |
| **SHAME** | Biblical guilt imagery: snakes, fig leaves, Adam & Eve, apples, Mark of Cain. **STACKS with other relevant folders** (e.g. perfume ad with cartoon Adam-Eve couple → SHAME + CAMPAIGN + GRAPHICS). |

### Objects & Items
| Folder | What goes here |
|---|---|
| **BAG** | Bags, backpacks, purses |
| **ACCESORIES** | Jewelry, toys, collectibles, accessory objects. Novelty products (e.g. branded vibrators) |
| **HARDWARE** | Zippers, buckles, snaps, metal trims. Close-up/emphasized only. NOT jewelry. |
| **LABELS** | Sewn-in interior garment labels (close-ups) |
| **HANGTAGS** | Store hangtags with prices, often cut off from garments |
| **GRILL** | Teeth grills only |
| **DOLLS** | Toy dolls, figurines, mannequins |
| **FOOD** | Food |
| **HOME GOODS** | Furniture, decor, interior objects |

### Print / Communications
| Folder | What goes here |
|---|---|
| **PACKAGING** | Branded boxes, perfume bottles, branded packaging design |
| **INVITATIONS** | Show invitation prototypes or experimental concepts (laser-cut leaves, feather printing tests) |
| **PAMPHLET** | **VERY STRICT** — only stuff that matches the specific aesthetic of the pamphlet being made. Most design books/magazines DON'T qualify. |
| **PAPER PRODUCTS** | Paper art objects (cardboard cutouts, sculpted paper) |
| **WEBSITE** | Website inspo, UI/UX, landing pages |
| **VIDEOS** | Video files |
| **CAMPAIGN** | **Actual brand campaign ads ONLY**. NOT every runway shot. Vintage perfume/fashion ads count. |

### Spaces & Reference
| Folder | What goes here |
|---|---|
| **SPACES** | Store interiors, installations, designed/staged interiors. Cinematic stills of staged rooms also count. |
| **ARTISTS** | **Highly restrictive** — almost never default here. Only for known artist works/portraits that are unmistakable references. |
| **COUTURE** | High fashion runway, wearable art. Can stand alone for extreme pieces. Add OUTFIT/JACKETS only if the look is practical/wearable too. |
| **MISC** | **Last resort.** Truly unidentifiable content. NOT for "kinda weird IG content" — that goes to GRAPHICS if there's clear visual interest. |

---

## Hard Rules (learned through 6 batches of corrections)

### 1. GRAPHICS rule
- Whole garment in frame with graphic visible → **garment folder ONLY** (no GRAPHICS)
- Close-up where graphic dominates AND garment is still visible → **garment + GRAPHICS**
- Tight close-up where garment is barely visible → **GRAPHICS only**
- Isolated graphics/posters/illustrations → **GRAPHICS only**

### 2. PHRASES vs GRAPHICS for text
- Standalone text where **meaning matters** (like "I think about you everyday") → **PHRASES**
- Standalone text where **typography/visual design matters** (like big bold "LOVE me HATE me") → **GRAPHICS**
- Text on a garment → **garment folder only** (don't double-tag PHRASES)

### 3. CAMPAIGN
- Brand ads (vintage perfume ads, fashion campaign shoots) → **CAMPAIGN**
- Runway shots → **NOT automatically CAMPAIGN**. Use only relevant garment / OUTFIT / COUTURE folders.

### 4. SHAME priority + stacking
- Any image with snake / fig leaf / Adam-Eve / apple / Mark-of-Cain → **add SHAME**
- SHAME **stacks** with other relevant tags (perfume ad with biblical theme → SHAME + CAMPAIGN + GRAPHICS)

### 5. AMRIEL GALLERY
- Explicit "amriel" branding → auto-tag
- Recognizable Amriel-style designs (cross/tree/garden motifs) → auto-tag (LLM may miss this — UI should have a "+AMRIEL" override button)
- When tagging AMRIEL GALLERY, **always also tag the garment folder**

### 6. Conservative tagging
- Default to **FEWER** folders, not more
- Only tag a folder if the thing it represents is genuinely emphasized/visible
- OUTFIT alone is fine when individual pieces aren't standout features

### 7. MISC = truly unidentifiable
- Don't default to MISC for "kinda weird"
- Random IG with clear visual interest → GRAPHICS
- Random photos that genuinely don't fit any pattern → MISC

### 8. Bottoms hierarchy
- Regular pants, shorts, regular skirts → **PANTS**
- Tights → NOT PANTS, usually part of OUTFIT
- Truly weird skirts/dresses → **SPECIALTY GARMENT**

### 9. Shoes
- Sneakers (any) → MENS SHOES
- Heels → WOMENS SHOES (always)
- Boots → context-dependent, default MENS

### 10. SPECIALTY GARMENT
- Reserve for **truly unusual** pieces
- Dresses (no dress folder exists) often go here + OUTFIT
- Cardigans, ruffled jackets, etc. that are merely unique → BUTTON DOWN or JACKETS

### 11. Duplicates
- Same image rendered at different sizes/contexts → **trash one, keep one** (move to `_TRASH`)
- `_v2`/`_v3` filename suffix does NOT auto-mean duplicate — different photos can share basename

### 12. JERSEY trap
- A cotton longsleeve with jersey-style graphic = **TSHIRT**, not JERSEY
- JERSEY = actual sports jersey material/cut

---

## Real Examples from Our Sorting (few-shot for the prompt)

### Whole garment visible
- White tee laid flat with "SUCK 'EM UP" graphic → **TSHIRT** (not TSHIRT+GRAPHICS, whole garment visible)
- Pink Floyd Dark Side tee on a person → **TSHIRT** only
- Person wearing yellow IDAHO selfie tee → **MISC** (shirt barely visible, just a face selfie)

### Close-ups
- Close-up of bear/cross print on white shirt fabric → **GRAPHICS + GARMENT DETAILS** (very close to fabric)
- Hoodie back with poem text + "POSITIVE" sleeve → **SWEATSHIRT + PHRASES** (text meaning matters, garment visible)
- Tight zoom on grey hoodie zipper showing red "Death" logo → **GRAPHICS only** (garment barely visible)

### Text
- "I think about you everyday" simple typography → **PHRASES** (meaning is the point)
- Big bold typographic "LOVE me HATE me SEE me FEEL me" → **GRAPHICS** (design treatment)
- "Nacht und Träume von Samuel Beckett" film title card → **GRAPHICS** (title screen, not standalone meaningful phrase)

### Outfits
- Mirror selfie with decorated jacket + backpack + applique boots → **OUTFIT + TSHIRT** (you can see a T underneath, jacket is part of outfit not the focus)
- Person in kitchen, patterned coat + white pants + snake shoes + brown bag → **OUTFIT + JACKETS + BAG** (jacket clearly emphasized + bag visible)
- Runway photo of beige suit + graphic tee under → **OUTFIT** only (NOT CAMPAIGN)

### COUTURE
- White avant-garde coat with massive red rose on runway → **COUTURE only** (wearable art, impractical)
- Head-to-toe red plaid jumpsuit on runway → **COUTURE only**
- Practical fashion runway look → **OUTFIT** (not COUTURE)

### SHAME stacking
- Schiaparelli perfume ad with cartoon Adam/Eve couple → **CAMPAIGN + GRAPHICS + SHAME**
- B&W photo book of woman with white gloves holding small object (has a snake in it) → **SHAME only** (no other strong category)
- Surrealist painting with apples, snakes, Eve, monkey, devils → **SHAME + ARTWORKS**

### Branded / Brand-Adjacent
- Christian Dior Couture employee ID card → **GRAPHICS + MISC**
- Schiaparelli perfume bottle in candle-shaped box → **PACKAGING**
- "Cross Channel" branded vibrator IG ad → **ACCESORIES**

### Tricky
- Red tights + chunky silver chained shoes from above → **WOMENS SHOES + OUTFIT** (heels = WOMENS, tights are NOT pants)
- Cinematic film still of figure in empty room w/ curtains → **SPACES** (designed interior dominates)
- Magazine spread with aura diagram + woman in floral outfit → **OUTFIT** only (PAMPHLET is too strict for typical magazine spreads)
- Paper cutout hands art object → **PAPER PRODUCTS** (not MISC, not PAMPHLET)
- "Mark of Cain" red symbol from Google → **SHAME** (biblical guilt iconography)

### Easy duplicates
- Multiple `PNG image_vN.png` files showing the same photo at different resolutions → keep one, trash the rest

---

## UI / UX Spec

### Main loop
1. App opens, prompts to select `SORT CLAUDE` folder + `CLAUDE SORTED` folder
2. Reads first PNG, displays it large in center
3. Calls Gemini Flash with image + prompt + recent corrections as few-shots
4. Shows Gemini's proposed folder(s) as **confirmable chips**
5. User options:
   - **Confirm** (Enter key): accepts proposal, copies file, advances
   - **Add folder** (search field): tag additional folder
   - **Remove folder**: untag a proposed folder
   - **Quick buttons**: "+AMRIEL", "+SHAME" — common patterns
   - **Trash** (T key): move to `_TRASH` (non-Amriel or duplicate)
   - **MISC** (M key): override to MISC only
   - **Undo** (Cmd-Z): revert last decision
6. File ops happen, next image loads

### Power features
- **Keyboard shortcuts** for everything
- **Confidence display**: show Gemini's confidence; if low, surface 2-3 alternatives
- **Reference panel** (toggleable): show 3 recent images sorted to the same folder, so user can verify it fits the pattern
- **Recent decisions strip**: tiny thumbnails of last 5 images sorted with their folders (catches drift)
- **Batch controls**: process 10 at a time, then a checkpoint screen showing "you sorted 10 — confirm all?"

### Stats panel
- Files sorted today / total
- Distribution across folders
- Estimated time remaining at current pace
- Accuracy estimate (corrections / total)

---

## Process Improvements to Build In

### 1. Visual duplicate detection
Use a **perceptual hash** library (like `image-hash` or `blockhash`) to detect duplicates BEFORE sending to LLM. Skip API call + auto-trash duplicates. Saves cost and time.

### 2. Learning loop (in-session)
Every time user overrides Gemini's proposal, save the (image, correct folder) pair to LocalStorage. Inject the **last N corrections as few-shot examples** in subsequent prompts. The model gets smarter as you go.

### 3. Confidence thresholds
- Gemini returns confidence score
- Above 0.85 → auto-sort without showing user (configurable)
- Below 0.5 → flag with all alternatives, surface 3 options
- In between → standard flow

### 4. Pattern detection (non-Amriel)
Detect clusters of consecutive images that all came from the same Messages UUID directory. Likely from same non-Amriel chat. Offer "trash all 5 from this cluster" button.

### 5. Side-by-side verification
When user hovers a proposed folder chip, show 2 thumbnails from that folder so they can verify the image fits.

### 6. Image preprocessing
Resize images to ~512px before sending to Gemini. Saves tokens, faster, no accuracy loss for classification tasks.

### 7. Bulk confirm
When 3+ similar images in a row get the same folder proposal with high confidence, offer "confirm all" button.

### 8. Hard cases queue
If user can't decide, "Save for later" button puts image in a queue at the end. Sometimes context from sorting other images helps.

### 9. Prompt export
"Export current prompt + corrections" button — saves the full system prompt + accumulated few-shot examples to a `.md` file. Useful for transferring to the bigger brand-architecture tool later.

### 10. Multi-model fallback
For very low confidence cases, optionally re-query a different model (Claude Haiku or gpt-4o-mini). If they agree, auto-confirm. If they disagree, surface both proposals.

---

## Gemini API call structure (rough)

```javascript
const prompt = `
You are an image classifier for the Amriel fashion brand's reference archive.
Classify the image into ONE OR MORE of these folders: [...full list]

Rules:
[...full rules from above]

Examples:
[...injected few-shot examples — start with 8-10 baseline + add last 5 user corrections]

Return strict JSON:
{
  "folders": ["TSHIRT", "GRAPHICS"],
  "confidence": 0.92,
  "reasoning": "Close-up of graphic on visible tee, both emphasized"
}
`;

const response = await fetch(GEMINI_API, {
  method: 'POST',
  body: JSON.stringify({
    contents: [{
      parts: [
        { text: prompt },
        { inline_data: { mime_type: 'image/png', data: base64Image } }
      ]
    }],
    generationConfig: { temperature: 0.2, responseSchema: {...} }
  })
});
```

Use `responseSchema` to force JSON output. Use `temperature: 0.2` for consistency.

---

## File operations expectations

Using File System Access API:
- `showDirectoryPicker()` for SORT CLAUDE and CLAUDE SORTED (save handles to IndexedDB to persist across sessions)
- For each sort: `getFileHandle()` → copy to destination via `createWritable()`, then move source to `_DONE/batch_N/` via the same API
- For trash: move to `_TRASH/` (never permanent delete from this app)
- Never destructive; user can always recover from `_TRASH/` or `_DONE/`

---

## Future expansion (brand architecture tool)

This sorter is the wedge into the bigger product:
- Moodboards (organized by the same folder taxonomy this builds)
- Manufacturer comms (linked to product/material files)
- File directory (the CLAUDE SORTED structure scales here)
- Print files / hardware / repeating elements (folder system already supports)
- Task tracker (annotations on sorted items become tasks)
- Multi-user team workflow

When you build the bigger app, this sorter's prompt + folder taxonomy + few-shot library is portable as the AI sorting module.

---

## Suggested build order

1. **Hour 1**: Get File System Access folder picker + read one PNG + display it
2. **Hour 2**: Wire up Gemini Flash API call with the prompt + display result
3. **Hour 3**: Add chip UI for proposed folders + confirm/override
4. **Hour 4**: File operations — copy to target folders, move original to `_DONE`
5. **Hour 5**: Polish — keyboard shortcuts, undo, stats
6. **Day 2**: Add learning loop, confidence thresholds, perceptual hashing for dupes

---

## What we've sorted so far (handover state)

- 6 batches × 30 files ≈ ~180 images already sorted
- They're in `~/Downloads/CLAUDE SORTED/` distributed across folders
- Originals at `~/Downloads/SORT CLAUDE/_DONE/batch_01/` through `batch_06/`
- ~500 still pending in `~/Downloads/SORT CLAUDE/` (top level)
- `~/Downloads/SORT CLAUDE/_TRASH/` has 30+ trashed duplicates

The sort_order.txt at `~/Downloads/sort_order.txt` has all 829 original files ordered by message date (oldest first). New sorter can use this for ordering, or just process whatever's in SORT CLAUDE top level.
