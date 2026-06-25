/**
 * Amriel image-sorter taxonomy.
 *
 * This module is intentionally self-contained and framework-agnostic so it can
 * be lifted directly into the larger brand-architecture app later. It holds:
 *   - the 47 destination folders (grouped for the UI),
 *   - the classification rules,
 *   - the baseline few-shot examples,
 *   - the prompt builder + JSON response schema for the vision model.
 */

export type FolderGroup =
  | "Garments"
  | "Composition"
  | "Visual"
  | "Brand"
  | "Objects"
  | "Print & Comms"
  | "Spaces & Reference";

export interface Folder {
  /** Canonical folder name, used verbatim as the on-disk folder and the tag. */
  name: string;
  group: FolderGroup;
  /** One-line guidance shown in the UI search list. */
  hint: string;
}

export const FOLDERS: Folder[] = [
  // ── Garments ─────────────────────────────────────────────
  { name: "TSHIRT", group: "Garments", hint: "T-shirts, long-sleeve tees, any cotton tee (even with a jersey-style graphic)." },
  { name: "BUTTON DOWN", group: "Garments", hint: "Full vertical button opening top to bottom. Cardigans count; henleys don't." },
  { name: "SWEATSHIRT", group: "Garments", hint: "Hoodies, sweatshirts, knit sweaters." },
  { name: "TANKTOP", group: "Garments", hint: "Tank tops, sleeveless tops." },
  { name: "POLO", group: "Garments", hint: "Polo shirts." },
  { name: "JACKETS", group: "Garments", hint: "Jackets, blazers, coats, tactical jackets — even unique ones." },
  { name: "PANTS", group: "Garments", hint: "All bottoms: pants, shorts, regular skirts." },
  { name: "UNDERWEAR", group: "Garments", hint: "Underwear, lingerie, or shots where the waistband is the focus." },
  { name: "SOCKS", group: "Garments", hint: "Socks." },
  { name: "HAT", group: "Garments", hint: "Hats, caps, beanies." },
  { name: "GLOVES", group: "Garments", hint: "Gloves." },
  { name: "SCARVES", group: "Garments", hint: "Scarves." },
  { name: "BELT", group: "Garments", hint: "Belts." },
  { name: "SUNGLASSES", group: "Garments", hint: "Sunglasses." },
  { name: "MENS SHOES", group: "Garments", hint: "Men's shoes, unisex sneakers, athletic shoes; default for unisex/boots." },
  { name: "WOMENS SHOES", group: "Garments", hint: "Heels (always), women's shoes." },
  { name: "MASK", group: "Garments", hint: "All masks: face, theatrical, ritual." },
  { name: "JERSEY", group: "Garments", hint: "Actual sports jerseys ONLY (not cotton tees with jersey graphics)." },
  { name: "SPECIALTY GARMENT", group: "Garments", hint: "Truly unusual / uncategorizable wearable pieces, wearable art." },

  // ── Composition / Styling ────────────────────────────────
  { name: "OUTFIT", group: "Composition", hint: "A styled outfit being worn. Don't over-tag individual garments." },
  { name: "GARMENT DETAILS", group: "Composition", hint: "Close-ups of techniques: ruffle, embroidery, distressing, applique." },
  { name: "FABRICS", group: "Composition", hint: "Close-up of fabric texture/weave or a swatch (not embellishments)." },

  // ── Visual / Design ──────────────────────────────────────
  { name: "GRAPHICS", group: "Visual", hint: "Isolated graphics, posters, illustrations, typography-as-design." },
  { name: "PHRASES", group: "Visual", hint: "Standalone text where the MEANING matters (not text on a garment)." },
  { name: "ARTWORKS", group: "Visual", hint: "Distinctive standalone artworks: paintings, art objects, illusions." },

  // ── Brand-specific ───────────────────────────────────────
  { name: "AMRIEL GALLERY", group: "Brand", hint: "Amriel branding/logo or Amriel-style motifs. Also tag the garment folder." },
  { name: "SHAME", group: "Brand", hint: "Biblical guilt: snakes, fig leaves, Adam & Eve, apples, Mark of Cain. Stacks." },

  // ── Objects & Items ──────────────────────────────────────
  { name: "BAG", group: "Objects", hint: "Bags, backpacks, purses." },
  { name: "ACCESORIES", group: "Objects", hint: "Jewelry, toys, collectibles, novelty products." },
  { name: "HARDWARE", group: "Objects", hint: "Zippers, buckles, snaps, metal trims (close-up). Not jewelry." },
  { name: "LABELS", group: "Objects", hint: "Sewn-in interior garment labels (close-ups)." },
  { name: "HANGTAGS", group: "Objects", hint: "Store hangtags with prices, often cut from garments." },
  { name: "GRILL", group: "Objects", hint: "Teeth grills only." },
  { name: "DOLLS", group: "Objects", hint: "Toy dolls, figurines, mannequins." },
  { name: "FOOD", group: "Objects", hint: "Food." },
  { name: "HOME GOODS", group: "Objects", hint: "Furniture, decor, interior objects." },

  // ── Print / Communications ───────────────────────────────
  { name: "PACKAGING", group: "Print & Comms", hint: "Branded boxes, perfume bottles, packaging design." },
  { name: "INVITATIONS", group: "Print & Comms", hint: "Show invitation prototypes / experimental concepts." },
  { name: "PAMPHLET", group: "Print & Comms", hint: "VERY STRICT — only the specific pamphlet aesthetic. Most magazines don't qualify." },
  { name: "PAPER PRODUCTS", group: "Print & Comms", hint: "Paper art objects: cardboard cutouts, sculpted paper." },
  { name: "WEBSITE", group: "Print & Comms", hint: "Website inspo, UI/UX, landing pages." },
  { name: "VIDEOS", group: "Print & Comms", hint: "Video files." },
  { name: "CAMPAIGN", group: "Print & Comms", hint: "Actual brand campaign ads ONLY (vintage perfume/fashion ads). Not runway." },

  // ── Spaces & Reference ───────────────────────────────────
  { name: "SPACES", group: "Spaces & Reference", hint: "Store interiors, installations, staged/cinematic interiors." },
  { name: "ARTISTS", group: "Spaces & Reference", hint: "Highly restrictive — only unmistakable known-artist references." },
  { name: "COUTURE", group: "Spaces & Reference", hint: "High-fashion runway, wearable art, extreme/impractical pieces." },
  { name: "MISC", group: "Spaces & Reference", hint: "Last resort. Truly unidentifiable content only." },
];

export const FOLDER_NAMES: string[] = FOLDERS.map((f) => f.name);
const FOLDER_NAME_SET = new Set(FOLDER_NAMES);

/** Defensive: keep only valid folder names, de-duplicated, order preserved. */
export function sanitizeFolders(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of input) {
    if (typeof raw !== "string") continue;
    const name = raw.trim().toUpperCase();
    if (FOLDER_NAME_SET.has(name) && !seen.has(name)) {
      seen.add(name);
      out.push(name);
    }
  }
  return out;
}

export const FOLDERS_BY_GROUP: Record<FolderGroup, Folder[]> = FOLDERS.reduce(
  (acc, folder) => {
    (acc[folder.group] ||= []).push(folder);
    return acc;
  },
  {} as Record<FolderGroup, Folder[]>,
);

export const GROUP_ORDER: FolderGroup[] = [
  "Garments",
  "Composition",
  "Visual",
  "Brand",
  "Objects",
  "Print & Comms",
  "Spaces & Reference",
];

// ── The rules (verbatim intent from 6 batches of corrections) ──────────────
const RULES = `RULES (learned from real sorting — follow strictly):

1. GRAPHICS rule:
   - Whole garment in frame with a graphic visible -> garment folder ONLY (no GRAPHICS).
   - Close-up where the graphic dominates AND the garment is still visible -> garment + GRAPHICS.
   - Tight close-up where the garment is barely visible -> GRAPHICS only.
   - Isolated graphics/posters/illustrations -> GRAPHICS only.

2. PHRASES vs GRAPHICS for text:
   - Standalone text where the MEANING matters -> PHRASES.
   - Standalone text where the typography/visual design matters -> GRAPHICS.
   - Text on a garment -> garment folder only (do NOT also tag PHRASES).

3. CAMPAIGN:
   - Brand ads (vintage perfume ads, fashion campaign shoots) -> CAMPAIGN.
   - Runway shots are NOT automatically CAMPAIGN — use garment / OUTFIT / COUTURE.

4. SHAME priority + stacking:
   - Any snake / fig leaf / Adam-Eve / apple / Mark-of-Cain -> add SHAME.
   - SHAME STACKS with other relevant tags (biblical perfume ad -> SHAME + CAMPAIGN + GRAPHICS).

5. AMRIEL GALLERY:
   - Explicit "amriel" branding -> tag it.
   - Recognizable Amriel-style motifs (cross / tree / garden) -> tag it.
   - When tagging AMRIEL GALLERY, ALSO tag the garment folder.

6. Be conservative: default to FEWER folders, not more. Only tag a folder if the thing
   it represents is genuinely emphasized/visible. OUTFIT alone is fine.

7. MISC = truly unidentifiable. "Kinda weird IG content" with clear visual interest -> GRAPHICS.

8. Bottoms: regular pants/shorts/skirts -> PANTS. Tights are NOT pants (usually OUTFIT).
   Truly weird skirts/dresses -> SPECIALTY GARMENT.

9. Shoes: sneakers -> MENS SHOES; heels -> WOMENS SHOES (always); boots default MENS.

10. SPECIALTY GARMENT only for truly unusual pieces. Dresses usually go here + OUTFIT.
    Merely-unique cardigans/jackets -> BUTTON DOWN or JACKETS.

11. JERSEY trap: a cotton longsleeve with a jersey-style graphic is TSHIRT, not JERSEY.
    JERSEY = actual sports-jersey material/cut.

12. If the image looks like a near-duplicate of a generic crop/resolution variant, still
    classify it normally — duplicate handling happens elsewhere.`;

// ── Baseline few-shot examples (real decisions) ────────────────────────────
export interface FewShot {
  description: string;
  folders: string[];
  reasoning: string;
}

export const BASELINE_EXAMPLES: FewShot[] = [
  { description: "White tee laid flat with a 'SUCK 'EM UP' graphic, whole garment visible", folders: ["TSHIRT"], reasoning: "Whole garment in frame, so garment folder only — no GRAPHICS." },
  { description: "Person wearing a yellow IDAHO selfie tee, shirt barely visible, mostly a face selfie", folders: ["MISC"], reasoning: "Garment barely visible; not a usable garment reference." },
  { description: "Close-up of a bear/cross print on white shirt fabric, very close to the weave", folders: ["GRAPHICS", "GARMENT DETAILS"], reasoning: "Graphic dominates and we're tight on the fabric detail." },
  { description: "Hoodie back with a poem in text plus 'POSITIVE' on the sleeve, garment visible", folders: ["SWEATSHIRT", "PHRASES"], reasoning: "Text meaning matters and the garment is clearly visible." },
  { description: "Tight zoom on a grey hoodie zipper showing a red 'Death' logo, garment barely visible", folders: ["GRAPHICS"], reasoning: "Garment barely visible; the graphic is the whole image." },
  { description: "'I think about you everyday' in plain typography", folders: ["PHRASES"], reasoning: "Meaning is the point, not the type treatment." },
  { description: "Big bold typographic 'LOVE me HATE me SEE me FEEL me'", folders: ["GRAPHICS"], reasoning: "The design/type treatment is the point, not the literal meaning." },
  { description: "Mirror selfie: decorated jacket + backpack + applique boots, a tee visible underneath", folders: ["OUTFIT", "TSHIRT"], reasoning: "Styled outfit; tee is visible. Jacket is part of the look, not the focus." },
  { description: "Person in a kitchen: patterned coat + white pants + snake shoes + brown bag", folders: ["OUTFIT", "JACKETS", "BAG"], reasoning: "Outfit, with the coat clearly emphasized and the bag visible." },
  { description: "Runway photo: beige suit with a graphic tee underneath", folders: ["OUTFIT"], reasoning: "Runway is not automatically CAMPAIGN; practical look so OUTFIT only." },
  { description: "White avant-garde coat with a massive red rose, on a runway", folders: ["COUTURE"], reasoning: "Wearable art, impractical — COUTURE only." },
  { description: "Schiaparelli perfume ad with a cartoon Adam & Eve couple", folders: ["CAMPAIGN", "GRAPHICS", "SHAME"], reasoning: "Brand ad + graphic treatment + biblical Adam/Eve -> SHAME stacks." },
  { description: "Surrealist painting with apples, snakes, Eve, monkey, devils", folders: ["SHAME", "ARTWORKS"], reasoning: "Biblical guilt iconography on a standalone artwork." },
  { description: "Schiaparelli perfume bottle in a candle-shaped box", folders: ["PACKAGING"], reasoning: "Branded packaging design." },
  { description: "Red tights with chunky silver-chained heels, shot from above", folders: ["WOMENS SHOES", "OUTFIT"], reasoning: "Heels -> WOMENS SHOES; tights are not pants." },
  { description: "Cinematic film still of a figure in an empty room with curtains", folders: ["SPACES"], reasoning: "The designed/staged interior dominates." },
  { description: "Paper cutout hands as an art object", folders: ["PAPER PRODUCTS"], reasoning: "Paper art object — not MISC, not PAMPHLET." },
  { description: "Christian Dior Couture employee ID card", folders: ["GRAPHICS", "MISC"], reasoning: "Graphic artifact with no clean fashion category." },
];

/** A single correction the user made in-session, used as a fresh few-shot. */
export interface Correction {
  description: string;
  folders: string[];
}

function renderExamples(examples: FewShot[]): string {
  return examples
    .map(
      (ex) =>
        `- ${ex.description}\n  -> ${JSON.stringify(ex.folders)}${ex.reasoning ? `  (${ex.reasoning})` : ""}`,
    )
    .join("\n");
}

/**
 * Build the full text prompt. Recent user corrections are appended as the
 * freshest few-shot examples so the model adapts within a session.
 */
export function buildClassificationPrompt(recentCorrections: Correction[] = []): string {
  const folderList = FOLDERS.map((f) => `- ${f.name}: ${f.hint}`).join("\n");

  let prompt = `You are the image classifier for the Amriel fashion brand's reference archive.
Classify the image into ONE OR MORE of the folders below. Choose the smallest set of
folders that is genuinely correct — when in doubt, tag fewer.

FOLDERS:
${folderList}

${RULES}

EXAMPLES (image description -> correct folders):
${renderExamples(BASELINE_EXAMPLES)}`;

  if (recentCorrections.length > 0) {
    const corrections = recentCorrections
      .map((c) => `- ${c.description || "(recent image)"} -> ${JSON.stringify(c.folders)}`)
      .join("\n");
    prompt += `\n\nMOST RECENT HUMAN CORRECTIONS (highest priority — match this judgement):\n${corrections}`;
  }

  prompt += `\n\nReturn ONLY strict JSON matching this shape:
{ "folders": ["TSHIRT", "GRAPHICS"], "confidence": 0.0-1.0, "reasoning": "one short sentence" }
- "folders" must be one or more names from the list above, spelled EXACTLY.
- "confidence" is your overall confidence in the folder set.
- Provide 2-3 alternatives only inside reasoning if you are unsure.`;

  return prompt;
}

/** JSON schema handed to Gemini's responseSchema to force structured output. */
export const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    folders: { type: "array", items: { type: "string" } },
    confidence: { type: "number" },
    reasoning: { type: "string" },
  },
  required: ["folders", "confidence", "reasoning"],
} as const;
