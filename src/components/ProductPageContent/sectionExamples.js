// Worked examples + copyable ChatGPT prompts, one per Page Content section.
//
// The grey helper line under each section only ever *showed* an example — the
// admin still typed everything by hand. These power the "Example" button next
// to Paste / Add: a sample of what good looks like, plus a prompt the admin can
// copy, run against their own product, and paste back with the Paste button.
//
// Every prompt states the output format explicitly (one item per line, no
// numbering, no extra prose) so the answer drops straight into the matching
// Paste modal, which parses exactly that shape. It also states the row cap and
// the per-row character limit, because both are enforced on save and a longer
// answer just gets clipped.
//
// `name` is the product being edited, so the prompt is about THIS product
// rather than a generic one.

const p = (name) => name?.trim() || "this product";

const SHOP = "a Bangladeshi dried-fruit and healthy-snack store";

export const shortFeaturesExample = (name) => ({
  sample: ["No Added Sugar", "No Preservative", "Rich in Fibre", "Kids Friendly"],
  note: "Max 4 · up to 30 characters each — these sit in the icon row under the product name, so keep them to 2–3 words.",
  prompt: `Write 4 short hero features for "${p(name)}", a product sold by ${SHOP}.

Rules:
- Each feature is 2-3 words, maximum 30 characters.
- They render as a small icon row under the product name, so they must be punchy, not sentences.
- Cover what it is made of, what it does NOT contain, and who it suits.
- Output ONLY the 4 features, one per line. No numbering, no bullets, no explanation.`,
});

export const processStepsExample = (name) => ({
  sample: [
    "Hand-picked ripe fruit",
    "Slow sun-drying, no chemicals",
    "Nutrients kept intact",
    "Lab-tested and packed",
  ],
  note: "Max 4 · up to 60 characters each. Note: this section only appears on the PDP if a video is also set — steps alone render nothing.",
  prompt: `Write 4 "how it's made" process steps for "${p(name)}", a product sold by ${SHOP}.

Rules:
- Each step is a short phrase, maximum 60 characters.
- They run in order, from raw fruit to finished, packed product.
- Output ONLY the 4 steps, one per line. No numbering, no bullets, no explanation.`,
});

export const benefitsExample = (name) => ({
  sample: [
    "100% natural — no sugar, colour or preservative",
    "Sun-dried slowly so the vitamins survive",
    "High in fibre — keeps you full for longer",
    "A clean energy snack for work, school or the gym",
  ],
  note: "Max 6 · up to 90 characters each. One benefit per line — keep the detail for the Description section.",
  prompt: `Write 5 customer benefits for "${p(name)}", a product sold by ${SHOP}.

Rules:
- Each benefit is ONE line, maximum 90 characters.
- Say what the customer GETS (health, energy, convenience), not just what the product has.
- Concrete and specific — avoid vague marketing words like "best quality" or "world class".
- Do not invent health claims you cannot justify.
- Output ONLY the 5 benefits, one per line. No numbering, no bullets, no explanation.`,
});

export const useCasesExample = (name) => ({
  sample: [
    "Office snacking",
    "School tiffin",
    "Post-workout energy",
    "Travel companion",
  ],
  note: "Max 6 · up to 70 characters each — these answer “when would I eat this?”",
  prompt: `Write 4 use cases for "${p(name)}", a product sold by ${SHOP}.

Rules:
- Each one is a short phrase, maximum 70 characters — an occasion or setting, not a sentence.
- They answer the customer's question "when would I actually eat this?".
- Output ONLY the 4 use cases, one per line. No numbering, no bullets, no explanation.`,
});

export const customSpecExample = (name) => ({
  sample: [
    "Origin | Rajshahi, Bangladesh",
    "Ingredients | 100% fruit, nothing added",
    "Shelf life | 6 months",
    "Storage | Cool, dry place",
    "Packaging | Resealable pouch",
  ],
  note: "Each row is a label and a value. Paste them with the Paste table button — one row per line, separated by | or a tab.",
  prompt: `Write a product spec table for "${p(name)}", a product sold by ${SHOP}.

Rules:
- 5 to 8 rows. Each row is: Label | Value
- Use the separator "|" exactly, one row per line.
- Only facts a buyer cares about: origin, ingredients, shelf life, storage, packaging, weight.
- Do not invent certifications or numbers you cannot justify.
- Output ONLY the rows. No header row, no numbering, no explanation.`,
});

export const sizeGuideExample = (name) => ({
  sample: [
    "Pack | Weight | Serves",
    "Small | 250g | 8-10",
    "Medium | 500g | 16-20",
    "Family | 1kg | 32-40",
  ],
  note: "First line = the column headers, then one line per row. Max 8 columns / 30 rows.",
  prompt: `Write a pack-size guide for "${p(name)}", a product sold by ${SHOP}.

Rules:
- First line is the column headers, separated by "|".
- Then one line per pack size, using the same "|" separator and the same number of columns.
- Useful columns: Pack | Weight | Serves (roughly how many servings).
- Use realistic Bangladeshi retail pack sizes.
- Output ONLY the table. No markdown dividers (no |---|), no numbering, no explanation.`,
});

// Product Details tab — the LEFT card's table on the PDP.
export const specRowsExample = (name) => ({
  sample: [
    "Calories | 310 kcal",
    "Protein | 3.5 g",
    "Fibre | 7 g",
    "Sugar | 65 g (natural)",
    "Fat | 0.5 g",
  ],
  note: "One row per line: Label | Value. These render as the nutrition table on the PDP.",
  prompt: `Write a nutrition table for "${p(name)}", a product sold by ${SHOP}.

Rules:
- 5 to 7 rows. Each row is: Label | Value
- Use the separator "|" exactly, one row per line.
- Per 100g. Cover calories, protein, fibre, sugar, fat.
- Do not invent numbers — if unsure, say so rather than guessing.
- Output ONLY the rows. No header row, no numbering, no explanation.`,
});

// Product Details tab — the small icon tiles beside the table.
export const infoTilesExample = (name) => ({
  sample: [
    "Ingredients | 100% natural",
    "Shelf life | 6 months",
    "Origin | Made in BD",
  ],
  note: "Max 6 · these are the small icon tiles beside the table. Keep values to a few words — pick an icon per tile after pasting.",
  prompt: `Write 3 short "at a glance" info tiles for "${p(name)}", a product sold by ${SHOP}.

Rules:
- Each row is: Label | Value, using the separator "|" exactly, one per line.
- The value must be VERY short — a few words at most (e.g. "6 months", "100% natural").
- Pick the things a buyer checks fast: ingredients, shelf life, origin, storage.
- Output ONLY the 3 rows. No header row, no numbering, no explanation.`,
});
