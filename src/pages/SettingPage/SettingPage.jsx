import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SettingS from "../../components/SiteSetting/SettingS";
import { IoSettingsOutline } from "react-icons/io5";
import { motion } from "framer-motion";

const SettingPage = () => {
  const navigate = useNavigate();
  const { tab } = useParams();

  const tabs = [
    { id: "site-setting", label: "Site Setting", icon: "🌐" },
    { id: "phone-credential", label: "Phone Credential", icon: "📱" },
    { id: "currency", label: "Currency", icon: "💰" },
    { id: "shipping", label: "Shipping", icon: "🚚" },
    { id: "payment-methods", label: "Payment Methods", icon: "💳" }, // ✅ Phase C
    { id: "vat", label: "Tax / VAT", icon: "🧾" }, // ✅ Phase H
    { id: "loyalty", label: "Loyalty", icon: "🎁" }, // ✅ Phase G3
    { id: "sms", label: "SMS Provider", icon: "✉️" }, // ✅ Phase G5
    { id: "analytics", label: "Analytics & Pixels", icon: "📊" }, // ✅ নতুন tab
    { id: "storefront-behaviour", label: "Storefront Behaviour", icon: "🛒" }, // ✅ C13
    { id: "announcement-bar", label: "Announcement Bar", icon: "📢" },
    { id: "offer-banner", label: "Offer Banner", icon: "⏰" },
    { id: "policies", label: "Policies", icon: "📜" },
  ];

  useEffect(() => {
    if (!tab) {
      navigate("/settings/site-setting", { replace: true });
    }
  }, [tab, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Card */}
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

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 mt-6">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => navigate(`/settings/${t.id}`)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                  tab === t.id
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content Area */}
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <SettingS />
        </motion.div>
      </div>
    </div>
  );
};

export default SettingPage;
