import { useEffect, useMemo, useState } from "react";
import { FiSearch, FiX, FiTrash2 } from "react-icons/fi";
import {
  ICON_CATEGORIES,
  ICON_REGISTRY,
  searchIcons,
  findIcon,
} from "../../../lib/icons/registry";
import DynamicIcon from "../../../lib/icons/DynamicIcon";

/**
 * Modal icon picker.
 *
 * Props:
 *   value: string | null         current icon key (e.g. "lu:Briefcase")
 *   onChange: (key|null) => void called when admin picks (or clears)
 *   label?: string               small label above the trigger
 *   uploadUrl?: string           if set, shows the value as a custom image
 *                                (advanced: SVG/PNG uploaded out-of-band)
 *
 * Usage:
 *   <IconPicker value={item.icon_key} onChange={(k) => setIconKey(k)} />
 */
export default function IconPicker({ value, onChange, label, uploadUrl }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const current = value ? findIcon(value) : null;
  const results = useMemo(
    () => searchIcons(query, category),
    [query, category],
  );

  // close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="inline-flex flex-col gap-1">
      {label && (
        <span className="text-xs font-medium text-gray-600">{label}</span>
      )}

      {/* Trigger */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center justify-center w-12 h-12 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary hover:bg-primary/5 transition"
          title={current ? current.label : "Pick an icon"}
        >
          {uploadUrl ? (
            <img
              src={uploadUrl}
              alt=""
              className="w-7 h-7 object-contain"
            />
          ) : current ? (
            <DynamicIcon name={current.key} size={22} className="text-primary" />
          ) : (
            <FiSearch size={18} className="text-gray-400" />
          )}
        </button>
        <div className="flex flex-col text-xs">
          <span className="font-medium text-gray-700">
            {uploadUrl ? "Custom upload" : current ? current.label : "No icon"}
          </span>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="text-primary hover:underline text-left"
          >
            {current || uploadUrl ? "Change" : "Pick icon"}
          </button>
        </div>
        {(current || uploadUrl) && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-gray-400 hover:text-red-500 p-1"
            title="Clear"
          >
            <FiTrash2 size={14} />
          </button>
        )}
      </div>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div>
                <h3 className="text-base font-bold text-gray-800">Pick an icon</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {ICON_REGISTRY.length} curated icons · search by name or use case
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
                aria-label="Close"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Search + categories */}
            <div className="px-5 py-3 border-b space-y-3 bg-gray-50">
              <div className="relative">
                <FiSearch
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search: gym, office, leaf, truck, kids…"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                  autoFocus
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                <CategoryChip
                  active={category === "all"}
                  onClick={() => setCategory("all")}
                  label="All"
                />
                {ICON_CATEGORIES.map((c) => (
                  <CategoryChip
                    key={c.key}
                    active={category === c.key}
                    onClick={() => setCategory(c.key)}
                    label={c.label}
                  />
                ))}
              </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              {results.length === 0 ? (
                <div className="text-center py-12 text-sm text-gray-500">
                  No icon matches &quot;{query}&quot;. Try another keyword.
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                  {results.map((icon) => {
                    const selected = value === icon.key;
                    return (
                      <button
                        key={icon.key}
                        type="button"
                        onClick={() => {
                          onChange(icon.key);
                          setOpen(false);
                        }}
                        title={icon.label}
                        className={`group flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition ${
                          selected
                            ? "border-primary bg-primary/5"
                            : "border-transparent hover:border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <DynamicIcon
                          name={icon.key}
                          size={22}
                          className={selected ? "text-primary" : "text-gray-700"}
                        />
                        <span className="text-[9px] text-gray-500 truncate w-full text-center">
                          {icon.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer note */}
            <div className="px-5 py-3 border-t bg-gray-50 text-[11px] text-gray-500">
              Can&apos;t find what you need? Use the file-upload field next to this picker to upload a custom SVG/PNG.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CategoryChip({ active, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1 text-xs rounded-full border transition ${
        active
          ? "bg-primary text-white border-primary"
          : "bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary"
      }`}
    >
      {label}
    </button>
  );
}
