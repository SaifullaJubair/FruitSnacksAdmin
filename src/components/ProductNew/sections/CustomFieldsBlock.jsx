import { FaPlus, FaTrash } from "react-icons/fa";
import IconPicker from "../../common/IconPicker/IconPicker";

// Free-form spec rows for the PDP (label + value + optional icon).
// Icon is picked via the curated IconPicker (saves an icon_key string like
// "lu:MapPin") — same registry used everywhere else (PageContent IconText
// rows, theme builder).

const EMPTY = { label: "", value: "", icon_key: "" };

const CustomFieldsBlock = ({ customFields, setCustomFields }) => {
  const add = () => setCustomFields([...(customFields || []), { ...EMPTY }]);
  const update = (i, k, v) =>
    setCustomFields(
      (customFields || []).map((r, idx) => (idx === i ? { ...r, [k]: v } : r)),
    );
  const remove = (i) =>
    setCustomFields((customFields || []).filter((_, idx) => idx !== i));

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-gray-700">Custom spec rows</p>
          <p className="text-[11px] text-gray-400">
            Free-form rows shown on the PDP beyond the attribute spec table.
          </p>
        </div>
        <button
          type="button"
          onClick={add}
          className="px-3 py-1.5 text-xs bg-primaryColor text-white rounded-lg hover:bg-blue-500 flex items-center gap-1.5"
        >
          <FaPlus size={10} /> Add row
        </button>
      </div>

      {(!customFields || customFields.length === 0) && (
        <p className="text-xs text-gray-400 italic">No custom rows yet.</p>
      )}

      <div className="space-y-2">
        {(customFields || []).map((r, i) => (
          <div
            key={i}
            className="grid grid-cols-12 gap-3 items-start bg-white p-3 rounded border border-gray-200"
          >
            <div className="col-span-4">
              <label className="text-[11px] font-medium text-gray-600 mb-1 block">
                Label
              </label>
              <input
                type="text"
                value={r.label}
                onChange={(e) => update(i, "label", e.target.value)}
                placeholder="e.g. Origin"
                className="w-full p-2 border border-gray-300 rounded text-sm"
              />
            </div>
            <div className="col-span-5">
              <label className="text-[11px] font-medium text-gray-600 mb-1 block">
                Value
              </label>
              <input
                type="text"
                value={r.value}
                onChange={(e) => update(i, "value", e.target.value)}
                placeholder="e.g. Rajshahi"
                className="w-full p-2 border border-gray-300 rounded text-sm"
              />
            </div>
            <div className="col-span-2">
              <label className="text-[11px] font-medium text-gray-600 mb-1 block">
                Icon
              </label>
              <IconPicker
                value={r.icon_key || null}
                onChange={(key) => update(i, "icon_key", key || "")}
              />
            </div>
            <div className="col-span-1 flex items-center justify-end pt-6">
              <button
                type="button"
                onClick={() => remove(i)}
                className="p-2 text-red-600 hover:bg-red-50 rounded"
                title="Remove"
              >
                <FaTrash size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-gray-400 mt-2">
        Icon optional — empty = no icon, just text. Same icon registry as PDP /
        Page Content rows.
      </p>
    </div>
  );
};

export default CustomFieldsBlock;
