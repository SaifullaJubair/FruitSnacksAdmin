import { useState, useEffect, useCallback } from "react";
import { BASE_URL } from "../../utils/baseURL";

// ── Label map — page_key → readable name ─────────────────────────────────────
const PAGE_LABELS = {
  home: { label: "Home", icon: "🏠", group: "Main" },
  allProducts: { label: "All Products", icon: "🛍️", group: "Main" },
  allTrending: { label: "Trending Products", icon: "🔥", group: "Main" },
  newArrival: { label: "New Arrival", icon: "✨", group: "Main" },
  topProduct: { label: "Top Products", icon: "⭐", group: "Main" },
  latestProduct: { label: "Latest Products", icon: "🆕", group: "Main" },
  aboutUs: { label: "About Us", icon: "ℹ️", group: "Info" },
  privacyPolicy: { label: "Privacy Policy", icon: "🔒", group: "Info" },
  returnPolicy: { label: "Return Policy", icon: "↩️", group: "Info" },
  refundPolicy: { label: "Refund Policy", icon: "💰", group: "Info" },
  cancelPolicy: { label: "Cancel Policy", icon: "❌", group: "Info" },
  shippingInfo: { label: "Shipping Info", icon: "🚚", group: "Info" },
  termsCondition: { label: "Terms & Conditions", icon: "📋", group: "Info" },
  signIn: { label: "Sign In", icon: "🔑", group: "Auth" },
  signUp: { label: "Sign Up", icon: "👤", group: "Auth" },
  cart: { label: "Cart", icon: "🛒", group: "Private" },
  wishlist: { label: "Wishlist", icon: "❤️", group: "Private" },
  verify: { label: "Verify Account", icon: "✅", group: "Auth" },
  changePassword: { label: "Change Password", icon: "🔐", group: "Auth" },
  forgetPassword: { label: "Forget Password", icon: "🔓", group: "Auth" },
  offer: { label: "Offers", icon: "🎁", group: "Private" },
  orders: { label: "Orders", icon: "📦", group: "Private" },
  orderSuccess: { label: "Order Success", icon: "🎉", group: "Private" },
};

const GROUP_ORDER = ["Main", "Info", "Auth", "Private"];

const GROUP_COLORS = {
  Main: { bg: "#EFF6FF", border: "#BFDBFE", text: "#1D4ED8", dot: "#3B82F6" },
  Info: { bg: "#F0FDF4", border: "#BBF7D0", text: "#15803D", dot: "#22C55E" },
  Auth: { bg: "#FFF7ED", border: "#FED7AA", text: "#C2410C", dot: "#F97316" },
  Private: {
    bg: "#FDF4FF",
    border: "#E9D5FF",
    text: "#7E22CE",
    dot: "#A855F7",
  },
};

// ── Toast ─────────────────────────────────────────────────────────────────────
const Toast = ({ toasts }) => (
  <div
    style={{
      position: "fixed",
      bottom: 24,
      right: 24,
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      gap: 8,
    }}
  >
    {toasts.map((t) => (
      <div
        key={t.id}
        style={{
          padding: "12px 20px",
          borderRadius: 10,
          fontSize: 14,
          fontWeight: 500,
          background: t.type === "success" ? "#052E16" : "#450A0A",
          color: t.type === "success" ? "#86EFAC" : "#FCA5A5",
          border: `1px solid ${t.type === "success" ? "#166534" : "#991B1B"}`,
          boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
          animation: "slideUp 0.3s ease",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span>{t.type === "success" ? "✓" : "✕"}</span>
        {t.message}
      </div>
    ))}
  </div>
);

// ── Edit Modal ────────────────────────────────────────────────────────────────
const EditModal = ({ page, onClose, onSave }) => {
  const [form, setForm] = useState({
    title: page.title || "",
    description: page.description || "",
    noIndex: page.noIndex || false,
  });
  const [saving, setSaving] = useState(false);
  const meta = PAGE_LABELS[page.page_key] || {
    label: page.page_key,
    icon: "📄",
    group: "Main",
  };
  const gc = GROUP_COLORS[meta.group] || GROUP_COLORS.Main;

  const handleSave = async () => {
    setSaving(true);
    await onSave(page.page_key, form);
    setSaving(false);
  };

  // ESC close
  useEffect(() => {
    const fn = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  const charCount = form.description.length;
  const descColor =
    charCount > 160 ? "#EF4444" : charCount > 130 ? "#F59E0B" : "#6B7280";

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(4px)",
          zIndex: 1000,
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(600px, calc(100vw - 32px))",
          background: "#0F172A",
          borderRadius: 16,
          border: "1px solid #1E293B",
          boxShadow: "0 25px 80px rgba(0,0,0,0.6)",
          zIndex: 1001,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #1E293B",
            background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: gc.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                border: `1px solid ${gc.border}`,
              }}
            >
              {meta.icon}
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#F1F5F9" }}>
                {meta.label}
              </div>
              <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
                /{page.path || ""}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: "1px solid #334155",
              background: "transparent",
              color: "#64748B",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              transition: "all 0.2s",
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {/* Title */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 600,
                color: "#94A3B8",
                marginBottom: 8,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              Page Title
            </label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Enter page title..."
              style={{
                width: "100%",
                padding: "11px 14px",
                borderRadius: 10,
                background: "#1E293B",
                border: "1.5px solid #334155",
                color: "#F1F5F9",
                fontSize: 14,
                outline: "none",
                transition: "border-color 0.2s",
                boxSizing: "border-box",
                fontFamily: "inherit",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#3B82F6")}
              onBlur={(e) => (e.target.style.borderColor = "#334155")}
            />
          </div>

          {/* Description */}
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#94A3B8",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                Meta Description
              </label>
              <span style={{ fontSize: 12, color: descColor, fontWeight: 500 }}>
                {charCount}/160
              </span>
            </div>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Enter meta description... (Google 150-160 characters recommend করে)"
              rows={4}
              style={{
                width: "100%",
                padding: "11px 14px",
                borderRadius: 10,
                background: "#1E293B",
                border: "1.5px solid #334155",
                color: "#F1F5F9",
                fontSize: 14,
                outline: "none",
                resize: "vertical",
                transition: "border-color 0.2s",
                boxSizing: "border-box",
                fontFamily: "inherit",
                lineHeight: 1.6,
              }}
              onFocus={(e) => (e.target.style.borderColor = "#3B82F6")}
              onBlur={(e) => (e.target.style.borderColor = "#334155")}
            />
          </div>

          {/* noIndex toggle */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 16px",
              borderRadius: 10,
              background: form.noIndex
                ? "rgba(239,68,68,0.08)"
                : "rgba(34,197,94,0.08)",
              border: `1.5px solid ${form.noIndex ? "rgba(239,68,68,0.25)" : "rgba(34,197,94,0.25)"}`,
              transition: "all 0.3s",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: form.noIndex ? "#FCA5A5" : "#86EFAC",
                }}
              >
                {form.noIndex
                  ? "🚫  Google Indexing বন্ধ"
                  : "✅  Google Indexing চালু"}
              </div>
              <div style={{ fontSize: 12, color: "#64748B", marginTop: 3 }}>
                {form.noIndex
                  ? "এই page Google search এ দেখাবে না"
                  : "এই page Google search এ দেখাবে"}
              </div>
            </div>
            <button
              onClick={() => setForm({ ...form, noIndex: !form.noIndex })}
              style={{
                width: 48,
                height: 26,
                borderRadius: 13,
                border: "none",
                background: form.noIndex ? "#EF4444" : "#22C55E",
                cursor: "pointer",
                position: "relative",
                transition: "background 0.3s",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: "#fff",
                  position: "absolute",
                  top: 3,
                  left: form.noIndex ? 24 : 4,
                  transition: "left 0.3s",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                }}
              />
            </button>
          </div>

          {/* Google Preview */}
          {!form.noIndex && (
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#64748B",
                  marginBottom: 8,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                Google Preview
              </div>
              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: 10,
                  background: "#1E293B",
                  border: "1px solid #334155",
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    color: "#60A5FA",
                    fontWeight: 500,
                    marginBottom: 4,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {form.title || "Page Title"}
                </div>
                <div
                  style={{ fontSize: 12, color: "#86EFAC", marginBottom: 4 }}
                >
                  fruitsnacksbd.com/{page.path || ""}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#94A3B8",
                    lineHeight: 1.5,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {form.description || "Meta description এখানে দেখাবে..."}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid #1E293B",
            display: "flex",
            gap: 10,
            justifyContent: "flex-end",
            background: "#0A0F1A",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "9px 20px",
              borderRadius: 8,
              border: "1px solid #334155",
              background: "transparent",
              color: "#94A3B8",
              fontSize: 14,
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !form.title.trim()}
            style={{
              padding: "9px 24px",
              borderRadius: 8,
              border: "none",
              background:
                saving || !form.title.trim()
                  ? "#1E3A5F"
                  : "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
              color: saving || !form.title.trim() ? "#64748B" : "#fff",
              fontSize: 14,
              cursor: saving || !form.title.trim() ? "not-allowed" : "pointer",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.2s",
            }}
          >
            {saving ? (
              <>
                <div
                  style={{
                    width: 14,
                    height: 14,
                    border: "2px solid #64748B",
                    borderTopColor: "#94A3B8",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </>
  );
};

// ── Page Card ─────────────────────────────────────────────────────────────────
const PageCard = ({ page, onEdit }) => {
  const meta = PAGE_LABELS[page.page_key] || {
    label: page.page_key,
    icon: "📄",
    group: "Main",
  };
  const gc = GROUP_COLORS[meta.group] || GROUP_COLORS.Main;
  const hasDesc = page.description?.trim().length > 0;

  return (
    <div
      onClick={() => onEdit(page)}
      style={{
        background: "#0F172A",
        borderRadius: 12,
        border: "1px solid #1E293B",
        padding: "16px",
        cursor: "pointer",
        transition: "all 0.2s",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.border = "1px solid #334155";
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.3)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.border = "1px solid #1E293B";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Top row */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              flexShrink: 0,
              background: gc.bg,
              border: `1px solid ${gc.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
            }}
          >
            {meta.icon}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#F1F5F9" }}>
              {meta.label}
            </div>
            <div style={{ fontSize: 11, color: "#475569", marginTop: 1 }}>
              /{page.path || ""}
            </div>
          </div>
        </div>

        {/* noIndex badge */}
        <div
          style={{
            padding: "3px 8px",
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 600,
            flexShrink: 0,
            background: page.noIndex
              ? "rgba(239,68,68,0.12)"
              : "rgba(34,197,94,0.12)",
            color: page.noIndex ? "#FCA5A5" : "#86EFAC",
            border: `1px solid ${page.noIndex ? "rgba(239,68,68,0.25)" : "rgba(34,197,94,0.25)"}`,
          }}
        >
          {page.noIndex ? "No Index" : "Indexed"}
        </div>
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: 12,
          color: "#60A5FA",
          fontWeight: 500,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {page.title || <span style={{ color: "#475569" }}>No title set</span>}
      </div>

      {/* Description preview */}
      <div
        style={{
          fontSize: 11,
          color: hasDesc ? "#64748B" : "#374151",
          lineHeight: 1.5,
          height: "2.9em",
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
        }}
      >
        {hasDesc ? (
          page.description
        ) : (
          <span style={{ fontStyle: "italic" }}>No description</span>
        )}
      </div>

      {/* Edit hint */}
      <div
        style={{
          position: "absolute",
          bottom: 12,
          right: 14,
          fontSize: 11,
          color: "#334155",
          fontWeight: 500,
        }}
      >
        Edit →
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const PageSeoManagement = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [editPage, setEditPage] = useState(null);
  const [search, setSearch] = useState("");
  const [toasts, setToasts] = useState([]);
  const [activeGroup, setActiveGroup] = useState("All");

  const addToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      3500,
    );
  };

  // Fetch all pages
  const fetchPages = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/page-seo`);
      const json = await res.json();
      setPages(json?.data || []);
    } catch {
      addToast("Failed to load page SEO data", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  // Seed
  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await fetch(`${BASE_URL}/page-seo/seed`, { method: "POST" });
      const json = await res.json();
      addToast(`✓ ${json.message}`);
      fetchPages();
    } catch {
      addToast("Seed failed", "error");
    } finally {
      setSeeding(false);
    }
  };

  // Save
  const handleSave = async (key, data) => {
    try {
      const res = await fetch(`${BASE_URL}/page-seo/${key}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      addToast("Page SEO saved successfully!");
      setPages((prev) =>
        prev.map((p) => (p.page_key === key ? { ...p, ...data } : p)),
      );
      setEditPage(null);
    } catch {
      addToast("Failed to save. Please try again.", "error");
    }
  };

  // Filter
  const grouped = {};
  GROUP_ORDER.forEach((g) => {
    grouped[g] = [];
  });

  pages.forEach((page) => {
    const meta = PAGE_LABELS[page.page_key];
    const group = meta?.group || "Main";
    const label = meta?.label || page.page_key;
    const matchSearch =
      !search ||
      label.toLowerCase().includes(search.toLowerCase()) ||
      page.title?.toLowerCase().includes(search.toLowerCase()) ||
      page.path?.toLowerCase().includes(search.toLowerCase());

    const matchGroup = activeGroup === "All" || group === activeGroup;
    if (matchSearch && matchGroup && grouped[group]) {
      grouped[group].push(page);
    }
  });

  const totalIndexed = pages.filter((p) => !p.noIndex).length;
  const totalNoIndex = pages.filter((p) => p.noIndex).length;
  const hasDesc = pages.filter((p) => p.description?.trim().length > 0).length;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#060B14",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        color: "#F1F5F9",
        padding: "32px 24px",
      }}
    >
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; } 
        ::-webkit-scrollbar-track { background: #0F172A; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
      `}</style>

      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* ── Header ── */}
        <div
          style={{
            marginBottom: 32,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 6,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background:
                    "linear-gradient(135deg, #1D4ED8 0%, #7C3AED 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                }}
              >
                🔍
              </div>
              <h1
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  margin: 0,
                  color: "#F1F5F9",
                  letterSpacing: "-0.02em",
                }}
              >
                Page SEO Manager
              </h1>
            </div>
            <p style={{ margin: 0, fontSize: 14, color: "#64748B" }}>
              প্রতিটা page এর title, description ও indexing control করুন
            </p>
          </div>

          <button
            onClick={handleSeed}
            disabled={seeding}
            style={{
              padding: "10px 20px",
              borderRadius: 10,
              border: "1px solid #334155",
              background: seeding ? "#1E293B" : "#1E293B",
              color: seeding ? "#475569" : "#94A3B8",
              fontSize: 13,
              fontWeight: 600,
              cursor: seeding ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) =>
              !seeding && (e.currentTarget.style.borderColor = "#475569")
            }
            onMouseLeave={(e) =>
              !seeding && (e.currentTarget.style.borderColor = "#334155")
            }
            title="DB তে default data ঢোকানো (প্রথমবার)"
          >
            {seeding ? (
              <div
                style={{
                  width: 14,
                  height: 14,
                  border: "2px solid #475569",
                  borderTopColor: "#94A3B8",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }}
              />
            ) : (
              "⚡"
            )}
            Initialize Default Data
          </button>
        </div>

        {/* ── Stats ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 12,
            marginBottom: 28,
          }}
        >
          {[
            {
              label: "Total Pages",
              value: pages.length,
              color: "#3B82F6",
              bg: "rgba(59,130,246,0.1)",
              icon: "📄",
            },
            {
              label: "Google Indexed",
              value: totalIndexed,
              color: "#22C55E",
              bg: "rgba(34,197,94,0.1)",
              icon: "✅",
            },
            {
              label: "No Index",
              value: totalNoIndex,
              color: "#EF4444",
              bg: "rgba(239,68,68,0.1)",
              icon: "🚫",
            },
            {
              label: "Has Description",
              value: hasDesc,
              color: "#F59E0B",
              bg: "rgba(245,158,11,0.1)",
              icon: "📝",
            },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                padding: "16px 18px",
                borderRadius: 12,
                background: s.bg,
                border: `1px solid ${s.color}30`,
              }}
            >
              <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 800,
                  color: s.color,
                  lineHeight: 1,
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "#64748B",
                  marginTop: 4,
                  fontWeight: 500,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* ── Search + Group Filter ── */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 24,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {/* Search */}
          <div style={{ position: "relative", flex: "1 1 240px" }}>
            <span
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 14,
                color: "#475569",
              }}
            >
              🔍
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search pages..."
              style={{
                width: "100%",
                padding: "9px 14px 9px 36px",
                borderRadius: 10,
                background: "#0F172A",
                border: "1.5px solid #1E293B",
                color: "#F1F5F9",
                fontSize: 14,
                outline: "none",
                fontFamily: "inherit",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#334155")}
              onBlur={(e) => (e.target.style.borderColor = "#1E293B")}
            />
          </div>

          {/* Group tabs */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["All", ...GROUP_ORDER].map((g) => {
              const gc = GROUP_COLORS[g] || { dot: "#3B82F6" };
              const isActive = activeGroup === g;
              return (
                <button
                  key={g}
                  onClick={() => setActiveGroup(g)}
                  style={{
                    padding: "7px 14px",
                    borderRadius: 8,
                    border: "1.5px solid",
                    borderColor: isActive ? gc.dot : "#1E293B",
                    background: isActive ? `${gc.dot}18` : "transparent",
                    color: isActive ? gc.dot : "#475569",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {g}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 240,
              gap: 12,
              color: "#475569",
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                border: "2px solid #1E293B",
                borderTopColor: "#3B82F6",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }}
            />
            Loading pages...
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            {GROUP_ORDER.map((group) => {
              const items = grouped[group];
              if (!items || items.length === 0) return null;
              const gc = GROUP_COLORS[group];
              return (
                <div key={group}>
                  {/* Group header */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 14,
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: gc.dot,
                      }}
                    />
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: gc.dot,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                      }}
                    >
                      {group}
                    </span>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 600,
                        background: `${gc.dot}18`,
                        color: gc.dot,
                      }}
                    >
                      {items.length}
                    </span>
                    <div
                      style={{ flex: 1, height: 1, background: "#1E293B" }}
                    />
                  </div>

                  {/* Cards grid */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(280px, 1fr))",
                      gap: 12,
                    }}
                  >
                    {items.map((page) => (
                      <PageCard
                        key={page.page_key}
                        page={page}
                        onEdit={setEditPage}
                      />
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Empty state */}
            {GROUP_ORDER.every((g) => !grouped[g]?.length) && (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 0",
                  color: "#334155",
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>
                  No pages found
                </div>
                <div style={{ fontSize: 13, marginTop: 4 }}>
                  Try a different search term
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editPage && (
        <EditModal
          page={editPage}
          onClose={() => setEditPage(null)}
          onSave={handleSave}
        />
      )}

      {/* Toast */}
      <Toast toasts={toasts} />
    </div>
  );
};

export default PageSeoManagement;
