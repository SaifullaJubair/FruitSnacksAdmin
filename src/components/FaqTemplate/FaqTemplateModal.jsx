import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { FaTimes, FaSave } from "react-icons/fa";
import { BASE_URL } from "../../utils/baseURL";
import { useGetFaqTemplateTopics } from "../../hooks/useGetFaqTemplate";
import useGetCategory from "../../hooks/useGetCategory";

// Topic suggestions come entirely from the DB (distinct topics already in use).
// Fresh installs get a starter set from the backend bootstrap seed — no
// hardcoded list here, so the suggestions stay fully data-driven / niche-neutral.
const PLACEHOLDER_HINT = `Available placeholders: {{product_name}}, {{shelf_life}}, {{weight}}, {{price}}, {{origin}}`;

const FaqTemplateModal = ({ open, onClose, initial = null, refetch }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      question: initial?.question || "",
      answer: initial?.answer || "",
      category: initial?.category || "general",
      is_active: initial?.is_active ?? true,
    },
  });

  // Selected product-category ids (scope). Kept in local state, not RHF, because
  // it's a multi-select set rather than a single input.
  const [categoryIds, setCategoryIds] = useState([]);

  const { data: topicsRes } = useGetFaqTemplateTopics();
  const { data: categoryRes } = useGetCategory();

  // Datalist suggestions = distinct topics already in the DB.
  const topicOptions = useMemo(
    () => (Array.isArray(topicsRes?.data) ? topicsRes.data : []),
    [topicsRes],
  );

  // Flat category list with depth so we can indent the tree in the picker.
  const categories = useMemo(() => {
    const list = Array.isArray(categoryRes?.data) ? categoryRes.data : [];
    // Sort by category_path length then name so parents precede children.
    return [...list].sort((a, b) => {
      const da = a?.depth ?? (a?.category_path?.length || 0);
      const db = b?.depth ?? (b?.category_path?.length || 0);
      if (da !== db) return da - db;
      return String(a?.category_name || "").localeCompare(
        String(b?.category_name || ""),
      );
    });
  }, [categoryRes]);

  useEffect(() => {
    reset({
      question: initial?.question || "",
      answer: initial?.answer || "",
      category: initial?.category || "general",
      is_active: initial?.is_active ?? true,
    });
    setCategoryIds(
      Array.isArray(initial?.category_ids)
        ? initial.category_ids.map((c) =>
            typeof c === "object" ? String(c._id) : String(c),
          )
        : [],
    );
  }, [initial, reset]);

  if (!open) return null;

  const toggleCategory = (id) => {
    setCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const onSubmit = async (form) => {
    const url = initial?._id
      ? `${BASE_URL}/faq-template/${initial._id}`
      : `${BASE_URL}/faq-template`;
    const method = initial?._id ? "PATCH" : "POST";
    try {
      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, category_ids: categoryIds }),
      });
      const data = await res.json();
      if (data?.success) {
        toast.success(initial ? "Template updated" : "Template created");
        refetch();
        onClose();
      } else {
        toast.error(data?.message || "Failed");
      }
    } catch {
      toast.error("Network error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">
            {initial ? "Edit FAQ Template" : "Add FAQ Template"}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <FaTimes />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-3">
          {/* Topic — free text with datalist suggestions */}
          <div>
            <label className="block text-xs font-medium mb-1">
              Topic <span className="text-gray-400">(label, free text)</span>
            </label>
            <input
              list="faq-topic-options"
              {...register("category")}
              className="form-input"
              placeholder="e.g. shelf_life, storage, skin_type…"
            />
            <datalist id="faq-topic-options">
              {topicOptions.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
          </div>

          {/* Product-category scope — optional multi-select */}
          <div>
            <label className="block text-xs font-medium mb-1">
              Show for product categories{" "}
              <span className="text-gray-400">(empty = all products)</span>
            </label>
            <div className="max-h-40 overflow-y-auto border rounded p-2 space-y-1">
              {categories.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No categories.</p>
              ) : (
                categories.map((c) => {
                  const id = String(c._id);
                  const depth = c?.depth ?? (c?.category_path?.length || 0);
                  return (
                    <label
                      key={id}
                      className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 rounded px-1"
                      style={{ paddingLeft: `${depth * 16}px` }}
                    >
                      <input
                        type="checkbox"
                        checked={categoryIds.includes(id)}
                        onChange={() => toggleCategory(id)}
                      />
                      <span>{c.category_name}</span>
                    </label>
                  );
                })
              )}
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              Tagging a parent category also suggests this template for its
              sub-categories.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Question</label>
            <input
              type="text"
              {...register("question", { required: true })}
              className="form-input"
              placeholder="{{product_name}} কতদিন ভালো থাকে?"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Answer</label>
            <textarea
              {...register("answer", { required: true })}
              rows={4}
              className="form-input"
              placeholder="সঠিকভাবে রাখলে {{product_name}} {{shelf_life}} পর্যন্ত ভালো।"
            />
          </div>

          <p className="text-[11px] text-gray-500">{PLACEHOLDER_HINT}</p>

          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" {...register("is_active")} />
            Active
          </label>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-blueColor-600 text-white hover:bg-blueColor-700 rounded"
            >
              <FaSave /> Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FaqTemplateModal;
