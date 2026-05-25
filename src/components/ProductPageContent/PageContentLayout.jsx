import { useState } from "react";
import { FaCheck, FaCircle, FaSave, FaExternalLinkAlt, FaBars } from "react-icons/fa";
import MiniSpinner from "../../shared/MiniSpinner/MiniSpinner";

// Shell for the Page Content editor: left vertical tabs (with completeness
// dots), main area showing only the active section, and a sticky bottom save
// bar with an "Open live page" link. On mobile (<md) the sidebar collapses
// into a dropdown so the form has full width.
//
// Props:
//   sections     — array from pageContentMeta.js, with `isComplete(ctx)`
//   ctx          — context object passed to each section's isComplete()
//   active       — current section id
//   onChange(id) — switch active section
//   livePath     — e.g. `/products/<slug>` (used by the open-live link)
//   saving       — boolean
//   onSave       — click handler
//   children     — the section bodies. The caller is responsible for keeping
//                  every section mounted (use a `hidden` className on inactive
//                  ones) so react-hook-form / local state survives tab switches.
const PageContentLayout = ({
  sections,
  ctx,
  active,
  onChange,
  livePath,
  saving,
  onSave,
  children,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeIdx = sections.findIndex((s) => s.id === active);
  const activeMeta = sections[activeIdx] || sections[0];

  const Tab = ({ s, idx }) => {
    const done = s.isComplete(ctx);
    const isActive = s.id === active;
    return (
      <button
        type="button"
        onClick={() => {
          onChange(s.id);
          setMobileOpen(false);
        }}
        className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 text-sm transition ${
          isActive
            ? "bg-blueColor-50 text-blueColor-700 font-semibold"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        <span className="text-[10px] w-5 text-gray-400 tabular-nums">{idx + 1}.</span>
        {done ? (
          <FaCheck size={11} className="text-green-500 shrink-0" />
        ) : (
          <FaCircle size={6} className="text-gray-300 shrink-0" />
        )}
        <span className="flex-1 truncate">{s.label}</span>
      </button>
    );
  };

  return (
    <div className="relative">
      <div className="md:grid md:grid-cols-[220px_1fr] md:gap-5">
        {/* Mobile: section picker bar */}
        <div className="md:hidden mb-3">
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="w-full flex items-center justify-between px-3 py-2 bg-white border rounded-md text-sm font-medium text-gray-700"
          >
            <span className="flex items-center gap-2">
              <FaBars size={12} /> {activeMeta?.label}
            </span>
            <span className="text-xs text-gray-400">
              {activeIdx + 1} / {sections.length}
            </span>
          </button>
          {mobileOpen && (
            <div className="mt-2 p-2 bg-white border rounded-md space-y-1">
              {sections.map((s, i) => (
                <Tab key={s.id} s={s} idx={i} />
              ))}
            </div>
          )}
        </div>

        {/* Desktop: sticky sidebar */}
        <aside className="hidden md:block">
          <div className="sticky top-4 p-2 bg-white border rounded-lg space-y-1">
            {sections.map((s, i) => (
              <Tab key={s.id} s={s} idx={i} />
            ))}
          </div>
        </aside>

        {/* Active section content (we render only the active node, but the
            caller keeps all sub-section state in the parent form to avoid
            losing react-hook-form/local state on tab switch). */}
        <main className="min-w-0 pb-20">
          {activeMeta && (
            <div className="mb-3">
              <h2 className="text-lg font-bold text-gray-800">{activeMeta.label}</h2>
              {activeMeta.hint && (
                <p className="text-xs text-gray-500">{activeMeta.hint}</p>
              )}
            </div>
          )}
          {children}
        </main>
      </div>

      {/* Sticky save bar */}
      <div className="fixed bottom-0 left-0 right-0 md:left-[260px] z-30 bg-white border-t shadow-lg px-4 py-3 flex items-center justify-end gap-3">
        {livePath && (
          <a
            href={livePath}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-blueColor-700 hover:bg-gray-50 rounded"
            title="Open the live product page in a new tab"
          >
            <FaExternalLinkAlt size={11} /> Open live page
          </a>
        )}
        <button
          type="submit"
          disabled={saving}
          onClick={onSave}
          className="inline-flex items-center gap-2 px-5 py-2 bg-blueColor-600 text-white rounded hover:bg-blueColor-700 disabled:opacity-60 text-sm font-semibold"
        >
          {saving ? <MiniSpinner /> : <FaSave />} Save Page Content
        </button>
      </div>
    </div>
  );
};

export default PageContentLayout;
