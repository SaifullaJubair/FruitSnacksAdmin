import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SettingS from "../../components/SiteSetting/SettingS";
import { IoSettingsOutline } from "react-icons/io5";
import { motion } from "framer-motion";

// Settings tabs grouped into 4 sections. Each tab keeps its existing
// /settings/:tab route + the SettingS switch case — only the navigation UI
// changed (flat wrap-row → grouped left sub-nav).
const TAB_GROUPS = [
  {
    group: "Store",
    icon: "🏪",
    tabs: [
      { id: "site-setting", label: "Site Setting" },
      { id: "currency", label: "Currency" },
      { id: "policies", label: "Policies" },
    ],
  },
  {
    group: "Commerce",
    icon: "🛒",
    tabs: [
      { id: "shipping", label: "Shipping" },
      { id: "payment-methods", label: "Payment Methods" },
      { id: "vat", label: "Tax / VAT" },
      { id: "loyalty", label: "Loyalty" },
    ],
  },
  {
    group: "Storefront",
    icon: "📢",
    tabs: [
      { id: "home-layout", label: "Home Layout" },
      { id: "feature-cards", label: "Feature Cards" },
      { id: "announcement-bar", label: "Announcement Bar" },
      { id: "offer-banner", label: "Offer Banner" },
      { id: "storefront-behaviour", label: "Storefront Behaviour" },
    ],
  },
  {
    group: "Integrations",
    icon: "🔌",
    tabs: [
      { id: "phone-credential", label: "Phone Credential" },
      { id: "sms", label: "SMS Provider" },
      { id: "email", label: "Email Provider" },
      { id: "analytics", label: "Analytics & Pixels" },
    ],
  },
];

const SettingPage = () => {
  const navigate = useNavigate();
  const { tab } = useParams();

  useEffect(() => {
    if (!tab) {
      navigate("/settings/site-setting", { replace: true });
    }
  }, [tab, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-6"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl">
              <IoSettingsOutline className="text-white text-3xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Settings
              </h1>
              <p className="text-gray-500 mt-1">
                Manage your application configuration
              </p>
            </div>
          </div>
        </motion.div>

        {/* Two-column: grouped left nav + content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left sub-nav */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:w-64 lg:shrink-0 bg-white rounded-2xl shadow-xl p-4 h-fit lg:sticky lg:top-6"
          >
            <nav className="space-y-4">
              {TAB_GROUPS.map((g) => (
                <div key={g.group}>
                  <p className="px-2 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <span>{g.icon}</span>
                    {g.group}
                  </p>
                  <div className="space-y-0.5">
                    {g.tabs.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => navigate(`/settings/${t.id}`)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                          tab === t.id
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </motion.aside>

          {/* Content */}
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1 min-w-0 bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            <SettingS />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SettingPage;
