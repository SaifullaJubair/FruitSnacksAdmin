import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FaSave, FaPlus, FaTrash, FaListUl } from "react-icons/fa";
import { BASE_URL } from "../../utils/baseURL";
import { useGetThemes } from "../../hooks/useGetTheme";
import IconTextRepeater from "./IconTextRepeater";
import FaqPickerModal from "./FaqPickerModal";
import VariationWeightEditor from "./VariationWeightEditor";
import MiniSpinner from "../../shared/MiniSpinner/MiniSpinner";

const ProductPageContentForm = ({ product, refetch }) => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [faqPickerOpen, setFaqPickerOpen] = useState(false);

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
      benefits: (product?.benefits || []).join("\n"),
      og_title: product?.og_title || "",
      og_description: product?.og_description || "",
      og_image: product?.og_image || "",
      og_image_key: product?.og_image_key || "",
      nutrition: product?.nutrition || {},
      theme_overrides: product?.theme_overrides || {},
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

  // OG image direct upload helper
  const handleOgUpload = async (file) => {
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
        setValue("og_image", data.data.Location);
        setValue("og_image_key", data.data.Key);
        toast.success("OG image uploaded");
      } else {
        toast.error("Upload failed");
      }
    } catch {
      toast.error("Upload error");
    }
  };

  // Placeholder context for FAQ template fill — pulls from product + form state
  const faqContext = {
    product_name: product?.product_name,
    shelf_life: watch("nutrition.shelf_life"),
    weight: product?.unit,
    price: product?.product_price,
    origin: watch("nutrition.origin"),
  };

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
        benefits: (form.benefits || "")
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        short_features: shortFeatures,
        process_steps: processSteps,
        use_cases: useCases,
        faqs,
        nutrition: form.nutrition,
        og_image: form.og_image,
        og_image_key: form.og_image_key,
        og_title: form.og_title,
        og_description: form.og_description,
        theme_overrides: form.theme_overrides,
      };

      const res = await fetch(`${BASE_URL}/product`, {
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Theme */}
      <Section title="Theme" subtitle="Product page এর visual theme বেছে নাও।">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
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
              Theme list এ admin-approved active theme গুলো দেখাচ্ছে।{" "}
              <Link to="/theme/create" className="text-blueColor-600 hover:underline">
                নতুন theme তৈরি করো
              </Link>
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Theme Overrides — Primary (optional)
            </label>
            <input
              type="color"
              {...register("theme_overrides.colors.primary")}
              className="h-10 w-20"
            />
            <p className="text-xs text-gray-400 mt-1">
              এই product শুধুমাত্র এই color use করবে; বাকি theme একই থাকবে।
            </p>
          </div>
        </div>
      </Section>

      {/* Hero */}
      <Section title="Hero Section">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1">Badge Text</label>
            <input
              {...register("badge_text")}
              className="form-input"
              placeholder="প্রিমিয়াম কোয়ালিটি"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">
              Short Description / Tagline
            </label>
            <input
              {...register("short_description")}
              className="form-input"
              placeholder="স্বাস্থ্যকর স্ন্যাকস, প্রতিদিনের এনার্জি"
              maxLength={200}
            />
          </div>
        </div>

        <div className="mt-4 grid md:grid-cols-2 gap-4">
          <IconTextRepeater
            value={shortFeatures}
            onChange={setShortFeatures}
            label="Short Features (hero icons row)"
            helper="No Sugar, No Preservative, Rich in Fiber, Kids Friendly"
            max={4}
          />
          <IconTextRepeater
            value={processSteps}
            onChange={setProcessSteps}
            label="Process Steps (how it's made)"
            helper="তাজা ফল থেকে তৈরি / পানি বিয়োজন প্রসেস / পুষ্টিগুণ অক্ষুন্ন থাকে / পরীক্ষিত ও প্রাকৃতিক"
            max={4}
          />
        </div>
      </Section>

      {/* Benefits */}
      <Section title="Benefits" subtitle="প্রতি লাইনে একটি benefit লেখো।">
        <textarea
          {...register("benefits")}
          rows={6}
          className="form-input"
          placeholder={"রোগ প্রতিরোধ ক্ষমতা বাড়ায়\nহজমে সাহায্য করে\nআয়রনে ভরপুর"}
        />
      </Section>

      {/* Use cases */}
      <Section title="Use Cases — কোথায় ব্যবহার করবেন">
        <IconTextRepeater
          value={useCases}
          onChange={setUseCases}
          label="Use cases"
          max={6}
        />
      </Section>

      {/* Nutrition */}
      <Section title="Nutrition" subtitle="পুষ্টি তথ্য (প্রতি 100g)">
        <div className="grid md:grid-cols-3 gap-3">
          {[
            ["per_serving", "Per Serving (e.g. প্রতি 100g)"],
            ["calories", "Calories"],
            ["protein", "Protein"],
            ["carbohydrate", "Carbohydrate"],
            ["fiber", "Fiber"],
            ["sugar", "Sugar"],
            ["fat", "Fat"],
            ["vitamin_a", "Vitamin A"],
            ["vitamin_c", "Vitamin C"],
            ["iron", "Iron"],
            ["calcium", "Calcium"],
            ["origin", "Origin"],
            ["shelf_life", "Shelf Life"],
          ].map(([key, label]) => (
            <div key={key}>
              <label className="block text-xs font-medium mb-1">{label}</label>
              <input
                {...register(`nutrition.${key}`)}
                className="form-input"
                placeholder=""
              />
            </div>
          ))}
        </div>
      </Section>

      {/* FAQs */}
      <Section
        title="FAQs"
        subtitle="Product page এ যে প্রশ্নোত্তর দেখাবে।"
        actions={
          <button
            type="button"
            onClick={() => setFaqPickerOpen(true)}
            className="inline-flex items-center gap-2 text-xs px-3 py-1.5 bg-purple-50 text-purple-700 rounded hover:bg-purple-100"
          >
            <FaListUl /> Pick from Templates
          </button>
        }
      >
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
      </Section>

      {/* Variation weight / badge */}
      <Section
        title="Variation Weights & Badges"
        subtitle="প্রতিটি variation এর জন্য weight (Pathao courier weight calc এ ব্যবহার হবে) + অপশনাল badge text।"
      >
        <VariationWeightEditor productId={product?._id} />
      </Section>

      {/* OG / share */}
      <Section title="Social Share (Open Graph)">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1">OG Title</label>
            <input
              {...register("og_title")}
              className="form-input"
              placeholder="(default: meta_title)"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">OG Description</label>
            <input
              {...register("og_description")}
              className="form-input"
              placeholder="(default: meta_description)"
            />
          </div>
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
      </Section>

      <div className="flex justify-end pt-2 border-t">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blueColor-600 text-white rounded hover:bg-blueColor-700 disabled:opacity-60"
        >
          {submitting ? <MiniSpinner /> : <FaSave />} Save Page Content
        </button>
      </div>

      <FaqPickerModal
        open={faqPickerOpen}
        onClose={() => setFaqPickerOpen(false)}
        productCtx={faqContext}
        onPick={(faq) => {
          setFaqs((prev) => [...prev, faq]);
          setFaqPickerOpen(false);
          toast.success("FAQ added — edit if needed before saving");
        }}
      />
    </form>
  );
};

const Section = ({ title, subtitle, actions, children }) => (
  <section className="bg-white rounded-lg border border-gray-200 p-5">
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="text-base font-semibold text-gray-800">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {actions}
    </div>
    {children}
  </section>
);

export default ProductPageContentForm;
