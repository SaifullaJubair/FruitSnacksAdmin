// Section metadata for the Page Content editor sidebar.
// Each entry: { id, label (BN), hint (one-line where it shows on PDP),
// isComplete(formContext) → boolean }.
//
// `formContext` is { form, shortFeatures, processSteps, useCases, faqs,
//   nutritionRows, nutritionTiles, product } — passed in from the editor so
// these helpers stay framework-agnostic.

const has = (v) => typeof v === "string" && v.trim().length > 0;

export const PAGE_CONTENT_SECTIONS = [
  {
    id: "theme",
    label: "Theme",
    hint: "পুরো PDP-র রং/ফন্ট",
    isComplete: ({ form }) => !!form?.theme_id,
  },
  {
    id: "hero",
    label: "Hero",
    hint: "ছবির পাশের badge, tagline, icon row",
    isComplete: ({ form, shortFeatures }) =>
      has(form?.short_description) ||
      has(form?.badge_text) ||
      has(form?.hero_corner_badge) ||
      (shortFeatures?.length || 0) > 0,
  },
  {
    id: "video",
    label: "Video",
    hint: "Video heading + process steps",
    isComplete: ({ form, processSteps, product }) =>
      has(form?.video_title) ||
      (processSteps?.length || 0) > 0 ||
      has(product?.main_video),
  },
  {
    id: "benefits",
    label: "Benefits",
    hint: "উপকারিতা checklist",
    isComplete: ({ form }) =>
      (form?.benefits || "").split("\n").some((s) => s.trim().length > 0),
  },
  {
    id: "use_cases",
    label: "Use Cases",
    hint: "কোথায় ব্যবহার করবেন",
    isComplete: ({ useCases }) => (useCases?.length || 0) > 0,
  },
  {
    id: "nutrition",
    label: "Nutrition",
    hint: "পুষ্টি table + info tiles",
    isComplete: ({ nutritionRows, nutritionTiles }) =>
      (nutritionRows?.length || 0) > 0 || (nutritionTiles?.length || 0) > 0,
  },
  {
    id: "faqs",
    label: "FAQs",
    hint: "প্রশ্নোত্তর",
    isComplete: ({ faqs }) => (faqs?.length || 0) > 0,
  },
  {
    id: "floating",
    label: "Floating Images",
    hint: "page জুড়ে ভাসমান fruit ছবি",
    isComplete: ({ floatingImages }) => (floatingImages?.length || 0) > 0,
  },
  {
    id: "variations",
    label: "Variations",
    hint: "প্রতি variation-এর weight + badge",
    isComplete: () => false, // managed via its own modal/endpoint; badge stays neutral
  },
  {
    id: "og",
    label: "Social / OG",
    hint: "share preview (title, image)",
    isComplete: ({ form }) =>
      has(form?.og_title) || has(form?.og_description) || has(form?.og_image),
  },
];
