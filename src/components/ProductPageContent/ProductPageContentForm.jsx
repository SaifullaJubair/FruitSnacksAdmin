import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FaPlus, FaTrash, FaListUl } from "react-icons/fa";
import IconPicker from "../common/IconPicker/IconPicker";
import { BASE_URL } from "../../utils/baseURL";
import { useGetThemes } from "../../hooks/useGetTheme";
import IconTextRepeater from "./IconTextRepeater";
import FaqPickerModal from "./FaqPickerModal";
import { buildProductPlaceholderContext } from "./faqPlaceholders";
import VariationWeightEditor from "./VariationWeightEditor";
import PageContentLayout from "./PageContentLayout";
import ProductFloatingTab from "./ProductFloatingTab";
import { PAGE_CONTENT_SECTIONS } from "./pageContentMeta";

const EMPTY_OVERRIDES = { hidden_ids: [], replacements: [], extras: [] };

const ProductPageContentForm = ({ product, refetch }) => {
  const [submitting, setSubmitting] = useState(false);
  const [faqPickerOpen, setFaqPickerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(PAGE_CONTENT_SECTIONS[0].id);

  // Theme list for picker dropdown
  const { data: themesData } = useGetThemes({
    page: 1,
    limit: 100,
    status: "active",
  });
  const activeThemes = themesData?.data || [];

  const defaults = useMemo(
    () => ({
      theme_id: product?.theme_id?._id || product?.theme_id || "",
      short_description: product?.short_description || "",
      badge_text: product?.badge_text || "",
      hero_corner_badge: product?.hero_corner_badge || "",
      video_title: product?.video_title || "",
      benefits: (product?.benefits || []).join("\n"),
      og_title: product?.og_title || "",
      og_description: product?.og_description || "",
      og_image: product?.og_image || "",
      og_image_key: product?.og_image_key || "",
      benefits_side_image: product?.benefits_side_image || "",
      benefits_side_image_key: product?.benefits_side_image_key || "",
      use_cases_side_image: product?.use_cases_side_image || "",
      use_cases_side_image_key: product?.use_cases_side_image_key || "",
      faq_side_image: product?.faq_side_image || "",
      faq_side_image_key: product?.faq_side_image_key || "",
      nutrition_per_serving: product?.nutrition?.per_serving || "",
    }),
    [product],
  );

  const { register, handleSubmit, watch, setValue, reset } = useForm({
    defaultValues: defaults,
  });

  useEffect(() => {
    reset(defaults);
  }, [defaults, reset]);

  const [shortFeatures, setShortFeatures] = useState(product?.short_features || []);
  const [processSteps, setProcessSteps] = useState(product?.process_steps || []);
  const [useCases, setUseCases] = useState(product?.use_cases || []);
  const [faqs, setFaqs] = useState(product?.faqs || []);

  // Free-form nutrition: a nutrient table (rows) + info tiles (with optional icon).
  const [nutritionRows, setNutritionRows] = useState(product?.nutrition?.rows || []);
  const [nutritionTiles, setNutritionTiles] = useState(
    product?.nutrition?.info_tiles || [],
  );
  const [floatingImages, setFloatingImages] = useState(product?.floating_images || []);
  // Section-anchored override layer over the assigned theme's floating assets.
  const [floatingOverrides, setFloatingOverrides] = useState(
    product?.floating_overrides || EMPTY_OVERRIDES,
  );
  useEffect(() => {
    setNutritionRows(product?.nutrition?.rows || []);
    setNutritionTiles(product?.nutrition?.info_tiles || []);
    setFloatingImages(product?.floating_images || []);
    setFloatingOverrides(product?.floating_overrides || EMPTY_OVERRIDES);
  }, [product]);

  // Generic uploader — pushes file to S3 then writes the URL + key into the
  // two given RHF fields. Used by OG image and the per-section side images.
  const uploadToFields = async (file, urlField, keyField, label = "Image") => {
    if (!file) return;
    const fd = new FormData();
    fd.append("image", file);
    try {
      const res = await fetch(`${BASE_URL}/image_upload`, {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      const data = await res.json();
      if (data?.success && data?.data) {
        setValue(urlField, data.data.Location, { shouldDirty: true });
        setValue(keyField, data.data.Key, { shouldDirty: true });
        toast.success(`${label} uploaded`);
      } else {
        toast.error("Upload failed");
      }
    } catch {
      toast.error("Upload error");
    }
  };
  const handleOgUpload = (file) =>
    uploadToFields(file, "og_image", "og_image_key", "OG image");

  // Placeholder context for FAQ template fill — pulls from product + form state
  // Niche-neutral, DB-driven placeholder map: universal core fields + every
  // custom_field (spec) and nutrition row of THIS product, keyed by English
  // slug. shelf_life / origin come from the live nutrition-tab form values as
  // back-compat extras (so they still work even when not in custom_fields).
  const faqContext = buildProductPlaceholderContext(product, {
    shelf_life: watch("nutrition.shelf_life"),
    origin: watch("nutrition.origin"),
  });

  // This product's full category lineage (leaf + every ancestor) as id strings.
  // The FAQ picker uses this to surface templates scoped to any of these
  // categories — so a template tagged to a parent suggests for this product too.
  const productCategoryIds = [
    product?.category_id?._id || product?.category_id,
    ...(Array.isArray(product?.category_path) ? product.category_path : []),
  ]
    .filter(Boolean)
    .map((c) => (typeof c === "object" ? String(c._id) : String(c)));

  // Resolve the floating assets the product inherits from its CURRENTLY SELECTED
  // theme (live — follows the theme dropdown). Prefer the freshly-fetched active
  // theme list; fall back to the product's populated theme_id object.
  const selectedThemeId = watch("theme_id");
  const selectedTheme =
    activeThemes.find((t) => String(t._id) === String(selectedThemeId)) ||
    (product?.theme_id && typeof product.theme_id === "object" ? product.theme_id : null);
  const inheritedFloatingAssets = Array.isArray(selectedTheme?.floating_assets)
    ? selectedTheme.floating_assets
    : [];

  const addFaq = () => setFaqs((prev) => [...prev, { question: "", answer: "" }]);
  const updateFaq = (i, patch) =>
    setFaqs((prev) => prev.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));
  const removeFaq = (i) => setFaqs((prev) => prev.filter((_, idx) => idx !== i));

  const onSubmit = async (form) => {
    setSubmitting(true);
    try {
      const payload = {
        _id: product._id,
        theme_id: form.theme_id || null,
        short_description: form.short_description,
        badge_text: form.badge_text,
        hero_corner_badge: form.hero_corner_badge,
        video_title: form.video_title,
        benefits: (form.benefits || "")
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        short_features: shortFeatures,
        process_steps: processSteps,
        use_cases: useCases,
        faqs,
        floating_images: floatingImages.filter((f) => f.asset_url),
        // Section-anchored override layer. Drop empty extras (no image yet) so
        // we never persist half-filled rows.
        floating_overrides: {
          hidden_ids: floatingOverrides.hidden_ids || [],
          replacements: (floatingOverrides.replacements || []).filter(
            (r) => r.theme_asset_id && r.asset_url,
          ),
          extras: (floatingOverrides.extras || []).filter((e) => e.asset_url),
        },
        nutrition: {
          per_serving: form.nutrition_per_serving || "",
          rows: nutritionRows
            .map((r) => ({ label: (r.label || "").trim(), value: (r.value || "").trim() }))
            .filter((r) => r.label || r.value),
          info_tiles: nutritionTiles
            .map((t) => ({
              label: (t.label || "").trim(),
              value: (t.value || "").trim(),
              icon_key: t.icon_key || "",
            }))
            .filter((t) => t.label || t.value),
        },
        og_image: form.og_image,
        og_image_key: form.og_image_key,
        og_title: form.og_title,
        og_description: form.og_description,
        benefits_side_image: form.benefits_side_image,
        benefits_side_image_key: form.benefits_side_image_key,
        use_cases_side_image: form.use_cases_side_image,
        use_cases_side_image_key: form.use_cases_side_image_key,
        faq_side_image: form.faq_side_image,
        faq_side_image_key: form.faq_side_image_key,
      };

      const res = await fetch(`${BASE_URL}/product/page-content`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data?.success) {
        toast.success("Page content updated");
        refetch?.();
      } else {
        toast.error(data?.message || "Save failed");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  // Context object used by sidebar completeness badges. `watch()` triggers a
  // re-render on form changes so badges update live.
  const watched = watch();
  const completenessCtx = {
    form: watched,
    shortFeatures,
    processSteps,
    useCases,
    faqs,
    nutritionRows,
    nutritionTiles,
    floatingImages,
    floatingOverrides,
    product,
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <PageContentLayout
        sections={PAGE_CONTENT_SECTIONS}
        ctx={completenessCtx}
        active={activeTab}
        onChange={setActiveTab}
        livePath={product?.product_slug ? `/products/${product.product_slug}` : null}
        saving={submitting}
      >
        {/* All sections stay mounted (just hidden) so RHF input state and
            unsaved changes are preserved when switching tabs. */}

        <TabPane id="theme" active={activeTab}>
          <Card>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Theme
            </label>
            <select {...register("theme_id")} className="form-input">
              <option value="">— Select theme —</option>
              {activeThemes.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.theme_name} ({t.theme_for})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              Active theme গুলো দেখাচ্ছে। আলাদা color দরকার হলে{" "}
              <Link to="/theme/create" className="text-blueColor-600 hover:underline">
                নতুন theme তৈরি করো
              </Link>{" "}
              — তারপর এখানে assign করো।
            </p>
          </Card>
        </TabPane>

        <TabPane id="hero" active={activeTab}>
          <Card>
            <div className="grid md:grid-cols-3 gap-4">
              <FieldBlock
                label="Badge Text"
                hint="নাম/দামের পাশে ছোট badge"
              >
                <input
                  {...register("badge_text")}
                  className="form-input"
                  placeholder="প্রিমিয়াম কোয়ালিটি"
                />
              </FieldBlock>
              <FieldBlock
                label="Hero Corner Badge"
                hint="Hero ছবির কোণায় ভেসে থাকা badge"
              >
                <input
                  {...register("hero_corner_badge")}
                  className="form-input"
                  placeholder="নতুন / বেস্ট সেলার"
                />
              </FieldBlock>
              <FieldBlock
                label="Short Description / Tagline"
                hint="হিরো-র নিচে এক লাইনের পরিচিতি"
              >
                <input
                  {...register("short_description")}
                  className="form-input"
                  placeholder="স্বাস্থ্যকর স্ন্যাকস, প্রতিদিনের এনার্জি"
                  maxLength={200}
                />
              </FieldBlock>
            </div>

            <div className="mt-5">
              <IconTextRepeater
                value={shortFeatures}
                onChange={setShortFeatures}
                label="Short Features (hero icons row)"
                helper="No Sugar, No Preservative, Rich in Fiber, Kids Friendly"
                max={4}
              />
            </div>
          </Card>
        </TabPane>

        <TabPane id="video" active={activeTab}>
          <Card>
            <FieldBlock
              label="Video Section Title"
              hint="খালি রাখলে product নাম দিয়ে default heading দেখাবে"
            >
              <input
                {...register("video_title")}
                className="form-input"
                placeholder="দেখুন কিভাবে তৈরি হয়"
              />
            </FieldBlock>

            <div className="mt-5">
              <IconTextRepeater
                value={processSteps}
                onChange={setProcessSteps}
                label="Process Steps (how it's made)"
                helper="তাজা ফল থেকে তৈরি / পানি বিয়োজন প্রসেস / পুষ্টিগুণ অক্ষুন্ন থাকে / পরীক্ষিত ও প্রাকৃতিক"
                max={4}
              />
              <p className="text-xs text-amber-600 mt-2">
                ⓘ Video না থাকলে এই section frontend-এ দেখাবে না (heading + steps সবই lukano)।
              </p>
            </div>
          </Card>
        </TabPane>

        <TabPane id="benefits" active={activeTab}>
          <Card>
            <p className="text-xs text-gray-500 mb-2">প্রতি লাইনে একটি benefit লেখো।</p>
            <textarea
              {...register("benefits")}
              rows={8}
              className="form-input"
              placeholder={"রোগ প্রতিরোধ ক্ষমতা বাড়ায়\nহজমে সাহায্য করে\nআয়রনে ভরপুর"}
            />

            <SideImageField
              label="Side Image (ডান পাশে যে ছবি দেখাবে)"
              hint="খালি রাখলে product-এর main image ব্যবহার হবে।"
              url={watch("benefits_side_image")}
              onUpload={(file) =>
                uploadToFields(
                  file,
                  "benefits_side_image",
                  "benefits_side_image_key",
                  "Benefits image",
                )
              }
              onClear={() => {
                setValue("benefits_side_image", "", { shouldDirty: true });
                setValue("benefits_side_image_key", "", { shouldDirty: true });
              }}
            />
          </Card>
        </TabPane>

        <TabPane id="use_cases" active={activeTab}>
          <Card>
            <IconTextRepeater
              value={useCases}
              onChange={setUseCases}
              label="Use cases"
              helper="অফিস স্ন্যাকস / স্কুল টিফিন / জিম-পরবর্তী / ভ্রমণ"
              max={6}
            />

            <SideImageField
              label="Side Image (ডান পাশে যে ছবি দেখাবে)"
              hint="খালি রাখলে product-এর main image ব্যবহার হবে।"
              url={watch("use_cases_side_image")}
              onUpload={(file) =>
                uploadToFields(
                  file,
                  "use_cases_side_image",
                  "use_cases_side_image_key",
                  "Use cases image",
                )
              }
              onClear={() => {
                setValue("use_cases_side_image", "", { shouldDirty: true });
                setValue("use_cases_side_image_key", "", { shouldDirty: true });
              }}
            />
          </Card>
        </TabPane>

        <TabPane id="nutrition" active={activeTab}>
          <Card>
            <p className="text-xs text-gray-500 mb-3">
              পুষ্টি টেবিল + ইনফো টাইল — যা খুশি label/value যোগ করো। দুটোই খালি থাকলে
              section দেখাবে না।
            </p>
            <div className="mb-5 max-w-sm">
              <FieldBlock label="Per Serving" hint="heading-এর পাশে দেখাবে (e.g. প্রতি ১০০g)">
                <input
                  {...register("nutrition_per_serving")}
                  className="form-input"
                  placeholder="যেমন: প্রতি ১০০g"
                />
              </FieldBlock>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <LabelValueRepeater
                title="Nutrient Rows (টেবিল)"
                helper="ক্যালরি / প্রোটিন / ফাইবার ... (label + value)"
                value={nutritionRows}
                onChange={setNutritionRows}
              />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-700">
                    Info Tiles{" "}
                    <span className="text-xs font-normal text-gray-400">
                      (icon + label + value)
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setNutritionTiles((p) => [
                        ...p,
                        { icon_key: "", label: "", value: "" },
                      ])
                    }
                    className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-blueColor-50 text-blueColor-600 rounded hover:bg-blueColor-100"
                  >
                    <FaPlus /> Add
                  </button>
                </div>
                <p className="text-xs text-gray-400 -mt-1">
                  উপাদান / শেলফ লাইফ / দেশ — ডান পাশের tile।
                </p>
                {nutritionTiles.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">কিছু যোগ করা হয়নি।</p>
                ) : (
                  nutritionTiles.map((t, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-2 bg-white border rounded"
                    >
                      <IconPicker
                        value={t.icon_key || null}
                        onChange={(key) =>
                          setNutritionTiles((p) =>
                            p.map((row, idx) =>
                              idx === i ? { ...row, icon_key: key || "" } : row,
                            ),
                          )
                        }
                      />
                      <div className="flex-1 space-y-1">
                        <input
                          type="text"
                          value={t.label || ""}
                          onChange={(e) =>
                            setNutritionTiles((p) =>
                              p.map((row, idx) =>
                                idx === i ? { ...row, label: e.target.value } : row,
                              ),
                            )
                          }
                          placeholder="Label (যেমন: শেলফ লাইফ)"
                          className="form-input w-full"
                        />
                        <input
                          type="text"
                          value={t.value || ""}
                          onChange={(e) =>
                            setNutritionTiles((p) =>
                              p.map((row, idx) =>
                                idx === i ? { ...row, value: e.target.value } : row,
                              ),
                            )
                          }
                          placeholder="Value (যেমন: ৬ মাস)"
                          className="form-input w-full"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setNutritionTiles((p) => p.filter((_, idx) => idx !== i))
                        }
                        className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100 flex-shrink-0"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Card>
        </TabPane>

        <TabPane id="faqs" active={activeTab}>
          <Card>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-500">
                Product page এ যে প্রশ্নোত্তর দেখাবে।
              </p>
              <button
                type="button"
                onClick={() => setFaqPickerOpen(true)}
                className="inline-flex items-center gap-2 text-xs px-3 py-1.5 bg-purple-50 text-purple-700 rounded hover:bg-purple-100"
              >
                <FaListUl /> Pick from Templates
              </button>
            </div>
            <div className="space-y-2">
              {faqs.length === 0 && (
                <p className="text-xs text-gray-400 italic">কোনো FAQ যোগ করা হয়নি।</p>
              )}
              {faqs.map((f, i) => (
                <div key={i} className="p-2 bg-white border rounded space-y-2">
                  <input
                    value={f.question}
                    onChange={(e) => updateFaq(i, { question: e.target.value })}
                    placeholder="Question"
                    className="form-input"
                  />
                  <textarea
                    value={f.answer}
                    onChange={(e) => updateFaq(i, { answer: e.target.value })}
                    placeholder="Answer"
                    rows={2}
                    className="form-input"
                  />
                  <button
                    type="button"
                    onClick={() => removeFaq(i)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    <FaTrash className="inline mr-1" /> Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addFaq}
                className="inline-flex items-center gap-2 text-xs px-3 py-1.5 bg-blueColor-50 text-blueColor-600 rounded hover:bg-blueColor-100"
              >
                <FaPlus /> Add FAQ manually
              </button>
            </div>

            <SideImageField
              label="Side Image (FAQ-এর ডান পাশে যে ছবি দেখাবে)"
              hint="খালি রাখলে product-এর first other image / main image ব্যবহার হবে।"
              url={watch("faq_side_image")}
              onUpload={(file) =>
                uploadToFields(
                  file,
                  "faq_side_image",
                  "faq_side_image_key",
                  "FAQ image",
                )
              }
              onClear={() => {
                setValue("faq_side_image", "", { shouldDirty: true });
                setValue("faq_side_image_key", "", { shouldDirty: true });
              }}
            />
          </Card>
        </TabPane>

        <TabPane id="floating" active={activeTab}>
          <Card>
            <p className="text-xs text-gray-500 mb-3">
              Floating fruit ছবি এখন <strong>section অনুযায়ী</strong> বসে। theme থেকে
              আসা global floating গুলো এখানে hide / replace করা যায়, আর এই product-এর
              জন্য বাড়তি floating যোগ করা যায়।
            </p>
            <ProductFloatingTab
              themeAssets={inheritedFloatingAssets}
              value={floatingOverrides}
              onChange={setFloatingOverrides}
            />
          </Card>
        </TabPane>

        <TabPane id="variations" active={activeTab}>
          <Card>
            <p className="text-xs text-gray-500 mb-3">
              প্রতিটি variation এর জন্য weight (Pathao courier weight calc এ ব্যবহার হবে) + অপশনাল badge text।
            </p>
            <VariationWeightEditor productId={product?._id} />
          </Card>
        </TabPane>

        <TabPane id="og" active={activeTab}>
          <Card>
            <div className="grid md:grid-cols-2 gap-4">
              <FieldBlock label="OG Title" hint="খালি রাখলে meta_title ব্যবহার হবে">
                <input
                  {...register("og_title")}
                  className="form-input"
                  placeholder="(default: meta_title)"
                />
              </FieldBlock>
              <FieldBlock
                label="OG Description"
                hint="খালি রাখলে meta_description ব্যবহার হবে"
              >
                <input
                  {...register("og_description")}
                  className="form-input"
                  placeholder="(default: meta_description)"
                />
              </FieldBlock>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium mb-1">OG Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleOgUpload(e.target.files?.[0])}
                  className="form-input"
                />
                {watch("og_image") && (
                  <img
                    src={watch("og_image")}
                    alt="OG"
                    className="mt-2 w-32 h-32 object-cover rounded border"
                  />
                )}
              </div>
            </div>
          </Card>
        </TabPane>
      </PageContentLayout>

      <FaqPickerModal
        open={faqPickerOpen}
        onClose={() => setFaqPickerOpen(false)}
        productCtx={faqContext}
        productCategoryIds={productCategoryIds}
        onPick={(faq) => {
          setFaqs((prev) => [...prev, faq]);
          setFaqPickerOpen(false);
          toast.success("FAQ added — edit if needed before saving");
        }}
      />
    </form>
  );
};

// One tab body. Stays mounted (CSS-hidden when inactive) so RHF/local state
// survives tab switches.
const TabPane = ({ id, active, children }) => (
  <div className={id === active ? "" : "hidden"}>{children}</div>
);

// Plain content card — replaces the old Section wrapper now that PageContentLayout
// already provides the heading and grouping.
const Card = ({ children }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-5">{children}</div>
);

// Reusable label + helper-text + input wrapper for short form fields.
const FieldBlock = ({ label, hint, children }) => (
  <div>
    <label className="block text-xs font-medium mb-1">{label}</label>
    {children}
    {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
  </div>
);

// Side-accent image uploader (used in Benefits + Use Cases tabs). Shows the
// current image with a thumbnail, lets admin replace or clear it; on clear the
// storefront falls back to product.main_image.
const SideImageField = ({ label, hint, url, onUpload, onClear }) => (
  <div className="mt-5 pt-5 border-t border-gray-100">
    <label className="block text-xs font-medium mb-1">{label}</label>
    <div className="flex items-start gap-3">
      {url ? (
        <img
          src={url}
          alt=""
          className="w-20 h-20 object-cover rounded border bg-white"
        />
      ) : (
        <div className="w-20 h-20 rounded border bg-gray-50 flex items-center justify-center text-[10px] text-gray-400 text-center px-1">
          main_image
          <br />
          fallback
        </div>
      )}
      <div className="flex-1 space-y-2">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => onUpload(e.target.files?.[0])}
          className="form-input text-xs"
        />
        {url && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-red-600 hover:underline"
          >
            <FaTrash className="inline mr-1" size={10} /> Remove (use main image)
          </button>
        )}
        {hint && <p className="text-xs text-gray-400">{hint}</p>}
      </div>
    </div>
  </div>
);

// Simple label+value repeater (no icon). Used for the nutrient table rows.
const LabelValueRepeater = ({ title, helper, value = [], onChange }) => {
  const add = () => onChange([...value, { label: "", value: "" }]);
  const update = (i, patch) =>
    onChange(value.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  const remove = (i) => onChange(value.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-gray-700">{title}</label>
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-blueColor-50 text-blueColor-600 rounded hover:bg-blueColor-100"
        >
          <FaPlus /> Add
        </button>
      </div>
      {helper && <p className="text-xs text-gray-400 -mt-1">{helper}</p>}
      {value.length === 0 ? (
        <p className="text-xs text-gray-400 italic">কিছু যোগ করা হয়নি।</p>
      ) : (
        value.map((row, i) => (
          <div key={i} className="flex items-center gap-2 p-2 bg-white border rounded">
            <input
              type="text"
              value={row.label || ""}
              onChange={(e) => update(i, { label: e.target.value })}
              placeholder="Label (যেমন: ক্যালরি)"
              className="form-input flex-1"
            />
            <input
              type="text"
              value={row.value || ""}
              onChange={(e) => update(i, { value: e.target.value })}
              placeholder="Value (যেমন: ৩১০ kcal)"
              className="form-input flex-1"
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100 flex-shrink-0"
            >
              <FaTrash />
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default ProductPageContentForm;
