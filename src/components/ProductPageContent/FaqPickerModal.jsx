import { useMemo, useState } from "react";
import { FaTimes, FaPlus } from "react-icons/fa";
import {
  useGetFaqTemplates,
  useGetFaqTemplateTopics,
} from "../../hooks/useGetFaqTemplate";
import useDebounced from "../../hooks/useDebounced";

// Replace {{placeholders}} with current product form values.
// Anything missing stays as-is so admin can edit before saving.
const fillPlaceholders = (text, productCtx = {}) => {
  if (!text) return text;
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const v = productCtx[key];
    return v !== undefined && v !== null && v !== "" ? String(v) : `{{${key}}}`;
  });
};

// A template is "suggested" for this product when it has no category scope
// (global) OR its category_ids intersect the product's category lineage.
const isSuggested = (tpl, productCategoryIds) => {
  const ids = Array.isArray(tpl?.category_ids) ? tpl.category_ids : [];
  if (ids.length === 0) return true; // global template
  const set = new Set(productCategoryIds || []);
  return ids.some((c) => set.has(typeof c === "object" ? String(c._id) : String(c)));
};

const FaqPickerModal = ({
  open,
  onClose,
  onPick,
  productCtx,
  productCategoryIds = [],
}) => {
  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState("");
  const [showAll, setShowAll] = useState(false);
  const debouncedSearch = useDebounced({ searchQuery: search, delay: 300 });

  const { data, isLoading } = useGetFaqTemplates({
    page: 1,
    limit: 100,
    is_active: true,
    category: topic || undefined,
    search: debouncedSearch || undefined,
  });
  const { data: topicsRes } = useGetFaqTemplateTopics();

  const templates = useMemo(() => data?.data || [], [data]);

  const topicOptions = useMemo(
    () => (Array.isArray(topicsRes?.data) ? topicsRes.data : []),
    [topicsRes],
  );

  // Split into suggested (for this product) vs other.
  const { suggested, other } = useMemo(() => {
    const sug = [];
    const oth = [];
    templates.forEach((t) => {
      (isSuggested(t, productCategoryIds) ? sug : oth).push(t);
    });
    return { suggested: sug, other: oth };
  }, [templates, productCategoryIds]);

  if (!open) return null;

  const handlePick = (t) => {
    onPick({
      question: fillPlaceholders(t.question, productCtx),
      answer: fillPlaceholders(t.answer, productCtx),
    });
  };

  const renderCard = (t) => (
    <div
      key={t._id}
      className="flex items-start gap-3 p-3 border rounded hover:bg-gray-50"
    >
      <div className="flex-1">
        <div className="text-xs text-gray-400 mb-1">
          <span className="px-1.5 py-0.5 bg-gray-100 rounded">{t.category}</span>
        </div>
        <p className="text-sm font-medium text-gray-800">
          {fillPlaceholders(t.question, productCtx)}
        </p>
        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
          {fillPlaceholders(t.answer, productCtx)}
        </p>
      </div>
      <button
        type="button"
        onClick={() => handlePick(t)}
        className="inline-flex items-center gap-1 text-xs px-3 py-1.5 bg-blueColor-600 text-white rounded hover:bg-blueColor-700 flex-shrink-0"
      >
        <FaPlus /> Add
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl shadow-xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="font-semibold">Pick from FAQ Templates</h3>
            <p className="text-xs text-gray-500">
              Click "Add" to insert; placeholders are auto-filled from current
              product form.
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <FaTimes />
          </button>
        </div>

        <div className="p-3 border-b flex gap-2">
          <input
            type="text"
            placeholder="Search question..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input flex-1"
          />
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="form-input max-w-[160px]"
          >
            <option value="">All topics</option>
            {topicOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-y-auto flex-1 p-3 space-y-2">
          {isLoading && <p className="text-sm text-gray-500">Loading...</p>}
          {!isLoading && templates.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-8">
              কোনো template মেলেনি।
            </p>
          )}

          {/* Suggested for this product */}
          {suggested.length > 0 && (
            <>
              <p className="text-xs font-semibold text-purple-700 flex items-center gap-1">
                ✨ Suggested for this product
                <span className="font-normal text-gray-400">
                  ({suggested.length})
                </span>
              </p>
              {suggested.map(renderCard)}
            </>
          )}

          {/* Other templates — folded unless toggled (or nothing suggested) */}
          {other.length > 0 && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowAll((v) => !v)}
                className="text-xs font-semibold text-gray-600 hover:text-gray-800"
              >
                {showAll ? "▾" : "▸"} Other templates ({other.length})
              </button>
              {(showAll || suggested.length === 0) && (
                <div className="space-y-2 mt-2">{other.map(renderCard)}</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FaqPickerModal;
