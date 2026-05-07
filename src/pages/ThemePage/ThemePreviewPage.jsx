import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { useGetThemeById } from "../../hooks/useGetTheme";
import { LoaderOverlay } from "../../components/common/loader/LoderOverley";

// Inject theme as CSS variables on :root for the preview only.
const useThemeVars = (theme) => {
  useEffect(() => {
    if (!theme?.colors) return;
    const root = document.documentElement;
    const c = theme.colors;
    root.style.setProperty("--prv-primary", c.primary);
    root.style.setProperty("--prv-primary-light", c.primary_light);
    root.style.setProperty("--prv-primary-dark", c.primary_dark);
    root.style.setProperty("--prv-page-bg", c.page_bg);
    root.style.setProperty("--prv-section-bg", c.section_bg);
    root.style.setProperty("--prv-heading", c.heading_text);
    root.style.setProperty("--prv-body", c.body_text);
    root.style.setProperty("--prv-accent", c.accent);
    root.style.setProperty("--prv-button-text", c.button_text);
    root.style.setProperty(
      "--prv-button-radius",
      theme?.button_style?.border_radius || "8px",
    );
    return () => {
      // cleanup on unmount
      [
        "--prv-primary",
        "--prv-primary-light",
        "--prv-primary-dark",
        "--prv-page-bg",
        "--prv-section-bg",
        "--prv-heading",
        "--prv-body",
        "--prv-accent",
        "--prv-button-text",
        "--prv-button-radius",
      ].forEach((v) => root.style.removeProperty(v));
    };
  }, [theme]);
};

const FloatingAssets = ({ assets, section }) => {
  const filtered = (assets || []).filter(
    (a) => a.section === section || a.section === "any",
  );
  return (
    <>
      {filtered.map((a, i) => (
        <img
          key={i}
          src={a.asset_url}
          alt=""
          className={`absolute pointer-events-none ${
            a.position === "left" ? "left-2" : "right-2"
          } ${a.hide_on_mobile ? "hidden md:block" : ""} ${sizeClass(a.size)}`}
          style={{
            opacity: a.opacity ?? 1,
            zIndex: i,
            top: i % 2 ? "30%" : "10%",
            animation: animationStyle(a.animation_type, a.animation_speed),
          }}
        />
      ))}
    </>
  );
};

const sizeClass = (s) =>
  ({ xs: "w-12", sm: "w-16", md: "w-24", lg: "w-36" }[s] || "w-24");

const animationStyle = (type, speed) => {
  const dur = { slow: "5s", normal: "3s", fast: "1.5s" }[speed] || "3s";
  if (type === "none") return "";
  return `prv-${type} ${dur} ease-in-out infinite`;
};

const ThemePreviewPage = () => {
  const { id } = useParams();
  const { data, isLoading } = useGetThemeById(id);
  const theme = data?.data;
  useThemeVars(theme);

  if (isLoading) return <LoaderOverlay />;
  if (!theme) return <div className="p-4 text-center text-gray-500">Theme not found.</div>;

  const p = theme.preview_data || {};

  return (
    <>
      {/* Local keyframes for preview animations */}
      <style>{`
        @keyframes prv-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes prv-sway { 0%,100%{transform:rotate(-3deg)} 50%{transform:rotate(3deg)} }
        @keyframes prv-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-16px)} }
        @keyframes prv-spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
        .prv-button { background: var(--prv-primary); color: var(--prv-button-text); border-radius: var(--prv-button-radius); }
        .prv-bg { background: var(--prv-page-bg); }
        .prv-section { background: var(--prv-section-bg); }
        .prv-heading { color: var(--prv-heading); }
        .prv-body { color: var(--prv-body); }
        .prv-accent { color: var(--prv-accent); }
      `}</style>

      <div className="bg-gray-100 min-h-screen">
        {/* Sticky preview top bar (admin context, not styled by theme) */}
        <div className="sticky top-0 z-50 bg-white border-b shadow-sm px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/theme" className="text-sm text-blueColor-600 hover:underline">
              <FaArrowLeft className="inline" /> Themes
            </Link>
            <span className="text-sm text-gray-700">
              Preview: <strong>{theme.theme_name}</strong>
            </span>
            <span
              className={`px-2 py-0.5 rounded text-xs ${
                theme.status === "active"
                  ? "bg-green-100 text-green-700"
                  : theme.status === "draft"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {theme.status}
            </span>
          </div>
          <Link
            to={`/theme/update/${id}`}
            className="text-sm px-3 py-1 bg-blueColor-600 text-white rounded hover:bg-blueColor-700"
          >
            Back to Edit
          </Link>
        </div>

        {/* Themed mock product page */}
        <div className="prv-bg min-h-screen">
          {/* Hero */}
          <section className="relative overflow-hidden p-6 md:p-12">
            <FloatingAssets assets={theme.floating_assets} section="hero" />
            <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6 items-center">
              <div>
                <span
                  className="inline-block text-xs px-3 py-1 rounded-full mb-3"
                  style={{
                    background: "var(--prv-primary-light)",
                    color: "var(--prv-primary-dark)",
                  }}
                >
                  প্রিমিয়াম কোয়ালিটি
                </span>
                <p className="prv-accent text-sm mb-1">১০০% প্রাকৃতিক</p>
                <h1
                  className="prv-heading text-3xl md:text-5xl font-bold mb-2"
                  style={{ fontFamily: theme.typography?.font_key }}
                >
                  {p.product_name || "শুকনো আপেল"}
                </h1>
                <p className="prv-body mb-4">
                  {p.short_description || "স্বাস্থ্যকর স্ন্যাকস, প্রতিদিনের এনার্জি"}
                </p>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="prv-heading text-2xl font-bold">
                    ৳{p.price ?? 350}
                  </span>
                  {p.discount_price && (
                    <span className="text-gray-400 line-through text-sm">
                      ৳{p.discount_price}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button className="prv-button px-5 py-2.5 text-sm font-medium">
                    অর্ডার করুন এখনই
                  </button>
                  <button className="px-5 py-2.5 text-sm font-medium border rounded"
                    style={{
                      borderColor: "var(--prv-primary)",
                      color: "var(--prv-primary-dark)",
                      borderRadius: "var(--prv-button-radius)",
                    }}>
                    WhatsApp
                  </button>
                </div>
              </div>
              <div className="flex justify-center">
                {p.image_url ? (
                  <img src={p.image_url} alt="" className="max-h-80 object-contain" />
                ) : (
                  <div
                    className="w-72 h-72 rounded-2xl flex items-center justify-center text-gray-400 border"
                    style={{ background: "var(--prv-primary-light)" }}
                  >
                    Product image
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Order section */}
          <section className="prv-section relative overflow-hidden p-6 md:p-12">
            <FloatingAssets assets={theme.floating_assets} section="order" />
            <div className="max-w-3xl mx-auto bg-white rounded-xl p-5 shadow-sm">
              <h2 className="prv-heading font-bold mb-4">অর্ডার করুন এখনই</h2>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {["100g", "250g", "500g", "1kg"].map((w, i) => (
                  <button
                    key={w}
                    className={`py-2 text-sm rounded border ${
                      i === 1 ? "border-2" : ""
                    }`}
                    style={{
                      borderColor: i === 1 ? "var(--prv-primary)" : "#e5e7eb",
                      background: i === 1 ? "var(--prv-primary-light)" : "white",
                    }}
                  >
                    <div className="font-semibold prv-body">{w}</div>
                    <div className="text-xs text-gray-500">৳{[150, 350, 650, 1200][i]}</div>
                  </button>
                ))}
              </div>
              <button className="prv-button w-full py-3 text-sm font-medium">
                অর্ডার কনফার্ম করুন
              </button>
            </div>
          </section>

          {/* Benefits */}
          <section className="relative overflow-hidden p-6 md:p-12">
            <FloatingAssets assets={theme.floating_assets} section="benefits" />
            <div className="max-w-5xl mx-auto">
              <h2 className="prv-heading text-2xl font-bold mb-4">শুকনো আপেলের উপকারিতা 🍎</h2>
              <ul className="grid md:grid-cols-2 gap-2">
                {["রোগ প্রতিরোধ ক্ষমতা বাড়ায়", "হজমে সাহায্য করে", "আয়রনে ভরপুর", "ভিটামিন C ও আয়রনের উৎস"].map(
                  (b) => (
                    <li
                      key={b}
                      className="flex items-center gap-2 prv-body p-3 rounded"
                      style={{ background: "var(--prv-primary-light)" }}
                    >
                      <span className="prv-accent">✓</span> {b}
                    </li>
                  ),
                )}
              </ul>
            </div>
          </section>

          {/* Use cases */}
          <section className="prv-section relative overflow-hidden p-6 md:p-12">
            <FloatingAssets assets={theme.floating_assets} section="use_cases" />
            <div className="max-w-5xl mx-auto">
              <h2 className="prv-heading text-2xl font-bold mb-4">কোথায় ব্যবহার করবেন?</h2>
              <div className="grid md:grid-cols-4 gap-3">
                {["অফিস স্ন্যাকস", "বাচ্চাদের টিফিনে", "জিম ও ওয়ার্কআউটের পরে", "ভ্রমণের সময়"].map((u) => (
                  <div key={u} className="bg-white p-3 rounded shadow-sm text-center prv-body text-sm">
                    {u}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Nutrition */}
          <section className="relative overflow-hidden p-6 md:p-12">
            <FloatingAssets assets={theme.floating_assets} section="nutrition" />
            <div className="max-w-3xl mx-auto bg-white p-5 rounded-xl shadow-sm">
              <h2 className="prv-heading text-xl font-bold mb-3">পুষ্টি তথ্য (প্রতি 100g)</h2>
              <table className="w-full text-sm prv-body">
                <tbody>
                  {[
                    ["ক্যালরি", "320 kcal"],
                    ["প্রোটিন", "2.2 g"],
                    ["কার্বোহাইড্রেট", "76 g"],
                    ["ফাইবার", "7.5 g"],
                  ].map(([k, v]) => (
                    <tr key={k} className="border-b last:border-0">
                      <td className="py-2">{k}</td>
                      <td className="py-2 text-right">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* FAQ */}
          <section className="prv-section relative overflow-hidden p-6 md:p-12">
            <FloatingAssets assets={theme.floating_assets} section="faq" />
            <div className="max-w-3xl mx-auto">
              <h2 className="prv-heading text-2xl font-bold mb-4">সাধারণ কিছু প্রশ্ন</h2>
              {["শুকনো আপেলে কি চিনি ছাড়া হয়?", "কতদিন ভালো থাকে?", "ডেলিভারি কত দিনে?"].map((q) => (
                <div key={q} className="bg-white p-3 rounded mb-2 prv-body">
                  {q}
                </div>
              ))}
            </div>
          </section>

          <div className="text-center text-xs text-gray-400 p-4">
            — Theme preview ends —
          </div>
        </div>
      </div>
    </>
  );
};

export default ThemePreviewPage;
