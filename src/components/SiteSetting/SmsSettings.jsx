import { useState, useEffect } from "react";
import { BASE_URL } from "../../utils/baseURL";
import { toast } from "react-toastify";
import MiniSpinner from "../../shared/MiniSpinner/MiniSpinner";
import { motion } from "framer-motion";
import { FaEdit } from "react-icons/fa";
import { MdToggleOff, MdToggleOn, MdSms } from "react-icons/md";
import { FiInfo, FiEye, FiEyeOff } from "react-icons/fi";

const Toggle = ({ enabled, onChange, disabled }) => (
  <button
    type="button"
    onClick={() => !disabled && onChange(!enabled)}
    disabled={disabled}
    className={`flex items-center transition-colors ${
      disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
    }`}
  >
    {enabled ? (
      <MdToggleOn className="text-4xl text-sky-600" />
    ) : (
      <MdToggleOff className="text-4xl text-gray-400" />
    )}
  </button>
);

const buildState = (d) => ({
  sms_enabled: !!d?.sms_enabled,
  sms_provider_name: d?.sms_provider_name ?? "",
  sms_api_key: d?.sms_api_key ?? "",
  sms_api_secret: d?.sms_api_secret ?? "",
  sms_sender_id: d?.sms_sender_id ?? "",
});

const SmsSettings = ({ refetch, getInitialCurrencyData: d }) => {
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [state, setState] = useState(buildState(d));
  const [showKey, setShowKey] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  useEffect(() => {
    setState(buildState(d));
  }, [d]);

  const set = (key) => (val) => {
    if (!isEditing) return;
    setState((p) => ({ ...p, [key]: val }));
  };

  const handleCancel = () => {
    setIsEditing(false);
    setState(buildState(d));
    setShowKey(false);
    setShowSecret(false);
  };

  const handleSave = async () => {
    if (state.sms_enabled && !state.sms_api_key?.trim()) {
      toast.error("API key is required when SMS sending is enabled");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/setting`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _id: d?._id,
          sms_enabled: state.sms_enabled,
          sms_provider_name: state.sms_provider_name,
          sms_api_key: state.sms_api_key,
          sms_api_secret: state.sms_api_secret,
          sms_sender_id: state.sms_sender_id,
        }),
      });
      const result = await res.json();
      if (result?.statusCode === 200 && result?.success === true) {
        toast.success("SMS settings updated successfully");
        refetch();
        setIsEditing(false);
        setShowKey(false);
        setShowSecret(false);
      } else {
        toast.error(result?.message || "Something went wrong");
      }
    } catch (error) {
      toast.error(error?.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-sky-50 to-cyan-50">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-sky-600 to-cyan-600 rounded-xl">
                <MdSms className="text-white text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">SMS Provider</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Provider credentials used for OTP and order SMS
                </p>
              </div>
            </div>
            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-sky-600 to-cyan-600 text-white text-sm font-medium rounded-lg hover:from-sky-700 hover:to-cyan-700 focus:ring-4 focus:ring-sky-500/30 transition-all flex items-center gap-2"
              >
                <FaEdit /> Edit Settings
              </button>
            )}
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Enable */}
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-700">Enable SMS sending</p>
              <p className="text-xs text-gray-400 mt-0.5">
                When OFF, OTP + order SMS are skipped (server short-circuits).
              </p>
            </div>
            <Toggle
              enabled={state.sms_enabled}
              onChange={set("sms_enabled")}
              disabled={!isEditing}
            />
          </div>

          {/* Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600">Provider name</label>
              <input
                type="text"
                value={state.sms_provider_name}
                onChange={(e) => set("sms_provider_name")(e.target.value)}
                disabled={!isEditing}
                placeholder="BulkSMS BD"
                className="mt-1 w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600">Sender ID</label>
              <input
                type="text"
                value={state.sms_sender_id}
                onChange={(e) => set("sms_sender_id")(e.target.value)}
                disabled={!isEditing}
                placeholder="FruitSnacks"
                className="mt-1 w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-medium text-gray-600">API key</label>
              <div className="relative mt-1">
                <input
                  type={showKey ? "text" : "password"}
                  value={state.sms_api_key}
                  onChange={(e) => set("sms_api_key")(e.target.value)}
                  disabled={!isEditing}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showKey ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-medium text-gray-600">
                API secret <span className="text-gray-400">(optional, provider-dependent)</span>
              </label>
              <div className="relative mt-1">
                <input
                  type={showSecret ? "text" : "password"}
                  value={state.sms_api_secret}
                  onChange={(e) => set("sms_api_secret")(e.target.value)}
                  disabled={!isEditing}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showSecret ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-sky-50/60 border border-sky-100 rounded-lg p-3 flex items-start gap-2">
            <FiInfo className="text-sky-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-sky-700">
              Server reads these settings first, falling back to{" "}
              <code className="bg-white px-1 rounded">.env</code> values if any field is
              empty. So you can swap provider creds from the admin without redeploying.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={loading}
                  className="px-6 py-2.5 bg-gradient-to-r from-sky-600 to-cyan-600 text-white text-sm font-medium rounded-lg hover:from-sky-700 hover:to-cyan-700 focus:ring-4 focus:ring-sky-500/30 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <MiniSpinner />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Settings</span>
                  )}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-6 py-2.5 bg-gradient-to-r from-sky-600 to-cyan-600 text-white text-sm font-medium rounded-lg hover:from-sky-700 hover:to-cyan-700 transition-all flex items-center gap-2"
              >
                <FaEdit /> Edit Settings
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SmsSettings;
