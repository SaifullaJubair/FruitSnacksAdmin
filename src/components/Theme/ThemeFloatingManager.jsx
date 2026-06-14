import { useState } from "react";
import { toast } from "react-toastify";
import { FaPlus, FaTrash } from "react-icons/fa";
import { BASE_URL } from "../../utils/baseURL";
import MiniSpinner from "../../shared/MiniSpinner/MiniSpinner";

// Theme-level (GLOBAL) floating images manager. Every product using this theme
// inherits these floats; a product can later hide/replace/extend them from its
// own Page Content → Floating tab (product-level override layer).
//
// Uses the existing per-asset endpoints (immediate upload, no big multipart):
//   POST   /theme/:id/floating-asset           (multipart: asset file + meta)
//   DELETE /theme/:id/floating-asset/:index
//
// Only available in UPDATE mode (needs a saved theme _id to attach assets to).

// MULTI-NICHE-DEBT: section list hardcoded food (mirrors theme.model.ts enum).
// When the PDP section registry + pdp_section_array lands, build this list from the
// active niche's section registry. See docs/_ai/MULTI_NICHE_PLAN.md §4.
const SECTIONS = [
  { v: "any", label: "All sections (any)" },
  { v: "hero", label: "Hero / top" },
  { v: "order", label: "Order form" },
  { v: "benefits", label: "Benefits" },
  { v: "use_cases", label: "Use cases" },
  { v: "nutrition", label: "Nutrition" },
  { v: "reviews", label: "Reviews" },
  { v: "faq", label: "FAQ" },
];
const SIDES = [
  { v: "left", label: "Left" },
  { v: "right", label: "Right" },
];
const ALIGNS = [
  { v: "top", label: "Top" },
  { v: "middle", label: "Middle" },
  { v: "bottom", label: "Bottom" },
];
const ANIMS = [
  { v: "float", label: "Float (up-down)" },
  { v: "sway", label: "Sway (side)" },
  { v: "bounce", label: "Bounce" },
  { v: "spin", label: "Spin" },
  { v: "none", label: "No animation" },
];
const SPEEDS = [
  { v: "slow", label: "Slow" },
  { v: "normal", label: "Normal" },
  { v: "fast", label: "Fast" },
];
const SIZES = [
  { v: "xs", label: "XS" },
  { v: "sm", label: "Small" },
  { v: "md", label: "Medium" },
  { v: "lg", label: "Large" },
];

const ANIM_PREVIEW = {
  float: "brand-anim-float-slow",
  sway: "brand-anim-sway-slow",
  bounce: "brand-anim-bounce-slow",
  spin: "brand-anim-spin-slow",
  none: "",
};

export default function ThemeFloatingManager({ themeId, initialAssets = [], onChange }) {
  const [assets, setAssets] = useState(
    Array.isArray(initialAssets) ? initialAssets : [],
  );
  const [file, setFile] = useState(null);
  const [meta, setMeta] = useState({
    section: "any",
    position: "left",
    align: "middle",
    animation_type: "float",
    animation_speed: "slow",
    size: "md",
    opacity: 1,
    hide_on_mobile: true,
  });
  const [uploading, setUploading] = useState(false);

  const setM = (k, v) => setMeta((m) => ({ ...m, [k]: v }));

  const handleAdd = async () => {
    if (!file) {
      toast.error("একটা image select করো");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("asset", file);
      Object.entries(meta).forEach(([k, v]) => fd.append(k, String(v)));
      const res = await fetch(`${BASE_URL}/theme/${themeId}/floating-asset`, {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      const data = await res.json();
      if (!data?.success) {
        toast.error(data?.message || "Upload failed");
        return;
      }
      const next = [...assets, data.data];
      setAssets(next);
      onChange?.(next);
      setFile(null);
      toast.success("Floating image যোগ হয়েছে");
    } catch {
      toast.error("Network error");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (index) => {
    try {
      const res = await fetch(
        `${BASE_URL}/theme/${themeId}/floating-asset/${index}`,
        { method: "DELETE", credentials: "include" },
      );
      const data = await res.json();
      if (!data?.success) {
        toast.error(data?.message || "Delete failed");
        return;
      }
      const next = assets.filter((_, i) => i !== index);
      setAssets(next);
      onChange?.(next);
      toast.success("Removed");
    } catch {
      toast.error("Network error");
    }
  };

  return (
    <div className="space-y-4">
      {/* existing assets */}
      {assets.length === 0 ? (
        <p className="text-sm text-gray-400">
          এখনো কোনো global floating image নেই। নিচ থেকে যোগ করো।
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {assets.map((a, i) => (
            <div
              key={a.id || i}
              className="relative border border-gray-200 rounded-lg p-2 bg-gray-50"
            >
              <div className="h-20 flex items-center justify-center overflow-hidden">
                <img
                  src={a.asset_url}
                  alt=""
                  className={`max-h-20 object-contain ${ANIM_PREVIEW[a.animation_type] || ""}`}
                  style={{ opacity: typeof a.opacity === "number" ? a.opacity : 1 }}
                />
              </div>
              <div className="mt-1 text-[10px] text-gray-500 leading-tight">
                <div className="truncate">
                  {a.section} · {a.position}/{a.align || "middle"}
                </div>
                <div className="truncate">
                  {a.animation_type} · {a.size}
                  {a.hide_on_mobile ? " · 📵" : ""}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(i)}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                title="Remove"
              >
                <FaTrash size={9} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* add new */}
      <div className="border-t border-dashed pt-4 space-y-3">
        <p className="text-xs font-semibold text-gray-600 uppercase">
          New floating image
        </p>
        <input
          type="file"
          accept="image/png,image/webp,image/svg+xml,image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="form-input"
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Lbl t="Section">
            <select className="form-input" value={meta.section} onChange={(e) => setM("section", e.target.value)}>
              {SECTIONS.map((o) => <option key={o.v} value={o.v}>{o.label}</option>)}
            </select>
          </Lbl>
          <Lbl t="Side">
            <select className="form-input" value={meta.position} onChange={(e) => setM("position", e.target.value)}>
              {SIDES.map((o) => <option key={o.v} value={o.v}>{o.label}</option>)}
            </select>
          </Lbl>
          <Lbl t="Vertical (within section)">
            <select className="form-input" value={meta.align} onChange={(e) => setM("align", e.target.value)}>
              {ALIGNS.map((o) => <option key={o.v} value={o.v}>{o.label}</option>)}
            </select>
          </Lbl>
          <Lbl t="Size">
            <select className="form-input" value={meta.size} onChange={(e) => setM("size", e.target.value)}>
              {SIZES.map((o) => <option key={o.v} value={o.v}>{o.label}</option>)}
            </select>
          </Lbl>
          <Lbl t="Animation">
            <select className="form-input" value={meta.animation_type} onChange={(e) => setM("animation_type", e.target.value)}>
              {ANIMS.map((o) => <option key={o.v} value={o.v}>{o.label}</option>)}
            </select>
          </Lbl>
          <Lbl t="Speed">
            <select className="form-input" value={meta.animation_speed} onChange={(e) => setM("animation_speed", e.target.value)}>
              {SPEEDS.map((o) => <option key={o.v} value={o.v}>{o.label}</option>)}
            </select>
          </Lbl>
          <Lbl t={`Opacity (${meta.opacity})`}>
            <input
              type="range" min="0.1" max="1" step="0.1"
              value={meta.opacity}
              onChange={(e) => setM("opacity", Number(e.target.value))}
              className="w-full"
            />
          </Lbl>
          <Lbl t="Mobile">
            <label className="flex items-center gap-2 text-sm text-gray-600 mt-2">
              <input
                type="checkbox"
                checked={!meta.hide_on_mobile}
                onChange={(e) => setM("hide_on_mobile", !e.target.checked)}
              />
              Show on mobile
            </label>
          </Lbl>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={uploading || !file}
          className="inline-flex items-center gap-2 px-3 py-2 bg-blueColor-600 text-white rounded hover:bg-blueColor-700 disabled:opacity-60 text-sm"
        >
          {uploading ? <MiniSpinner /> : <FaPlus />} Add floating image
        </button>
      </div>
    </div>
  );
}

const Lbl = ({ t, children }) => (
  <div>
    <label className="block text-[11px] font-medium text-gray-500 mb-1">{t}</label>
    {children}
  </div>
);
