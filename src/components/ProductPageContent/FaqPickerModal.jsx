import { useState } from "react";
import { FaTimes, FaPlus } from "react-icons/fa";
import { useGetFaqTemplates } from "../../hooks/useGetFaqTemplate";
import useDebounced from "../../hooks/useDebounced";

const CATEGORIES = ["shelf_life", "storage", "ingredients", "usage", "health", "general"];

// Replace {{placeholders}} with current product form values.
// Anything missing stays as-is so admin can edit before saving.
const fillPlaceholders = (text, productCtx = {}) => {
  if (!text) return text;
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const v = productCtx[key];
    return v !== undefined && v !== null && v !== "" ? String(v) : `{{${key}}}`;
  });
};

const FaqPickerModal = ({ open, onClose, onPick, productCtx }) => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const debouncedSearch = useDebounced({ searchQuery: search, delay: 300 });

  const { data, isLoading } = useGetFaqTemplates({
    page: 1,
    limit: 100,
    is_active: true,
    category: category || undefined,
    search: debouncedSearch || undefined,
  });
  const templates = data?.data || [];

  if (!open) return null;

  const handlePick = (t) => {
    onPick({
      question: fillPlaceholders(t.question, productCtx),
      answer: fillPlaceholders(t.answer, productCtx),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl shadow-xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="font-semibold">Pick from FAQ Templates</h3>
            <p className="text-xs text-gray-500">
              Click "Add" to insert; placeholders are auto-filled from current product form.
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
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="form-input max-w-[160px]"
          >
            <option value="">All</option>
            {CATEGORIES.map((c) => (
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
          {templates.map((t) => (
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default FaqPickerModal;
