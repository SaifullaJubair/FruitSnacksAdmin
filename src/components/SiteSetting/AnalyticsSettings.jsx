import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { BASE_URL } from "../../utils/baseURL";
import { toast } from "react-toastify";
import MiniSpinner from "../../shared/MiniSpinner/MiniSpinner";
import { motion } from "framer-motion";
import { FaEdit, FaEye, FaEyeSlash } from "react-icons/fa";
import {
  SiMeta,
  SiTiktok,
  SiGoogletagmanager,
  SiGoogleanalytics,
} from "react-icons/si";
import { VscAzure } from "react-icons/vsc";
import { MdToggleOff, MdToggleOn } from "react-icons/md";
import { FiInfo } from "react-icons/fi";

// ── Toggle Switch ──────────────────────────────────────────────
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
      <MdToggleOn className="text-4xl text-blue-600" />
    ) : (
      <MdToggleOff className="text-4xl text-gray-400" />
    )}
  </button>
);

// ── Password / Secret input ────────────────────────────────────
const SecretInput = ({ register, name, placeholder, disabled }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        {...register(name)}
        type={show ? "text" : "password"}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-3 py-2.5 pr-10 rounded-lg border text-sm transition-all ${
          disabled
            ? "border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
            : "border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        }`}
      />
      {!disabled && (
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {show ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
        </button>
      )}
    </div>
  );
};

// ── Platform Card ──────────────────────────────────────────────
const PlatformCard = ({
  icon,
  title,
  badge,
  iconBg,
  headerBg,
  border,
  children,
}) => (
  <div className={`rounded-xl border ${border} overflow-hidden`}>
    <div className={`px-5 py-4 ${headerBg} flex items-center gap-3`}>
      <div className={`p-2.5 ${iconBg} rounded-lg text-white`}>{icon}</div>
      <div>
        <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
        {badge && <p className="text-xs text-gray-500 mt-0.5">{badge}</p>}
      </div>
    </div>
    <div className="p-5 space-y-4">{children}</div>
  </div>
);

// ── Toggle Row ─────────────────────────────────────────────────
const ToggleRow = ({ label, description, enabled, onChange, disabled }) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
    <div>
      <p className="text-sm font-medium text-gray-700">{label}</p>
      {description && (
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      )}
    </div>
    <Toggle enabled={enabled} onChange={onChange} disabled={disabled} />
  </div>
);

// ── Field Row ──────────────────────────────────────────────────
const FieldRow = ({ label, hint, children }) => (
  <div className="space-y-1.5">
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {hint && <span className="text-xs text-gray-400">{hint}</span>}
    </div>
    {children}
  </div>
);

// ── Main Component ─────────────────────────────────────────────
const AnalyticsSettings = ({ refetch, getInitialCurrencyData: d }) => {
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [toggles, setToggles] = useState({
    meta_pixel_enabled: false,
    meta_capi_enabled: false,
    tiktok_pixel_enabled: false,
    tiktok_capi_enabled: false,
    gtm_enabled: false,
    ga4_enabled: false,
    clarity_enabled: false,
  });

  const { register, handleSubmit, setValue } = useForm();

  // DB data দিয়ে form populate করো
  useEffect(() => {
    if (!d) return;
    const textFields = [
      "meta_pixel_id",
      "meta_access_token",
      "tiktok_pixel_id",
      "tiktok_access_token",
      "gtm_id",
      "ga4_id",
      "clarity_id",
    ];
    textFields.forEach((f) => setValue(f, d[f] || ""));
    setToggles({
      meta_pixel_enabled: !!d.meta_pixel_enabled,
      meta_capi_enabled: !!d.meta_capi_enabled,
      tiktok_pixel_enabled: !!d.tiktok_pixel_enabled,
      tiktok_capi_enabled: !!d.tiktok_capi_enabled,
      gtm_enabled: !!d.gtm_enabled,
      ga4_enabled: !!d.ga4_enabled,
      clarity_enabled: !!d.clarity_enabled,
    });
  }, [d, setValue]);

  const setToggle = (key) => (val) => {
    if (!isEditing) return;
    setToggles((prev) => ({ ...prev, [key]: val }));
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (!d) return;
    const textFields = [
      "meta_pixel_id",
      "meta_access_token",
      "tiktok_pixel_id",
      "tiktok_access_token",
      "gtm_id",
      "ga4_id",
      "clarity_id",
    ];
    textFields.forEach((f) => setValue(f, d[f] || ""));
    setToggles({
      meta_pixel_enabled: !!d.meta_pixel_enabled,
      meta_capi_enabled: !!d.meta_capi_enabled,
      tiktok_pixel_enabled: !!d.tiktok_pixel_enabled,
      tiktok_capi_enabled: !!d.tiktok_capi_enabled,
      gtm_enabled: !!d.gtm_enabled,
      ga4_enabled: !!d.ga4_enabled,
      clarity_enabled: !!d.clarity_enabled,
    });
  };

  const handleDataPost = async (formData) => {
    setLoading(true);
    try {
      const sendData = {
        _id: d?._id,
        meta_pixel_id: formData.meta_pixel_id || "",
        meta_access_token: formData.meta_access_token || "",
        tiktok_pixel_id: formData.tiktok_pixel_id || "",
        tiktok_access_token: formData.tiktok_access_token || "",
        gtm_id: formData.gtm_id || "",
        ga4_id: formData.ga4_id || "",
        clarity_id: formData.clarity_id || "",
        ...toggles,
      };

      const res = await fetch(`${BASE_URL}/setting`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sendData),
      });

      const result = await res.json();
      if (result?.statusCode === 200 && result?.success === true) {
        toast.success("Analytics settings updated successfully");
        refetch();
        setIsEditing(false);
      } else {
        toast.error(result?.message || "Something went wrong");
      }
    } catch (error) {
      toast.error(error?.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = (editing) =>
    `w-full px-3 py-2.5 rounded-lg border text-sm transition-all ${
      editing
        ? "border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        : "border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
    }`;

  // Status overview pills
  const statusPills = [
    { label: "Meta Pixel", key: "meta_pixel_enabled", color: "blue" },
    { label: "TikTok Pixel", key: "tiktok_pixel_enabled", color: "gray" },
    { label: "GTM", key: "gtm_enabled", color: "green" },
    { label: "GA4", key: "ga4_enabled", color: "orange" },
    { label: "Clarity", key: "clarity_enabled", color: "purple" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* ── Header ─────────────────────────────────────────── */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl">
                <SiGoogleanalytics className="text-white text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Analytics & Pixels
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Configure tracking pixels and analytics platforms
                </p>
              </div>
            </div>
            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-500/30 transition-all flex items-center gap-2"
              >
                <FaEdit /> Edit Settings
              </button>
            )}
          </div>
        </div>

        {/* ── Status Overview (view mode only) ───────────────── */}
        {!isEditing && (
          <div className="flex flex-wrap gap-3 p-5 bg-gray-50 border-b border-gray-200">
            {statusPills.map(({ label, key }) => (
              <div
                key={key}
                className="bg-white rounded-lg border border-gray-200 px-4 py-2 flex items-center gap-2"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    toggles[key] ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
                <span className="text-xs font-medium text-gray-600">
                  {label}
                </span>
                <span
                  className={`text-xs font-bold ${
                    toggles[key] ? "text-green-600" : "text-gray-400"
                  }`}
                >
                  {toggles[key] ? "ON" : "OFF"}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ── Form ───────────────────────────────────────────── */}
        <form onSubmit={handleSubmit(handleDataPost)} className="p-6 space-y-6">
          {/* Meta Pixel */}
          <PlatformCard
            icon={<SiMeta size={18} />}
            title="Meta (Facebook) Pixel"
            badge="Browser tracking + Server-side CAPI"
            iconBg="bg-blue-600"
            headerBg="bg-blue-50"
            border="border-blue-100"
          >
            <ToggleRow
              label="Enable Meta Pixel"
              description="Loads fbq() script on all pages"
              enabled={toggles.meta_pixel_enabled}
              onChange={setToggle("meta_pixel_enabled")}
              disabled={!isEditing}
            />
            <FieldRow label="Pixel ID" hint="(from Events Manager)">
              <input
                {...register("meta_pixel_id")}
                placeholder="e.g. 123456789012345"
                disabled={!isEditing}
                className={inputCls(isEditing)}
              />
            </FieldRow>
            <ToggleRow
              label="Enable CAPI (Server-side)"
              description="Sends duplicate server events for iOS 14+ accuracy"
              enabled={toggles.meta_capi_enabled}
              onChange={setToggle("meta_capi_enabled")}
              disabled={!isEditing}
            />
            <FieldRow label="Access Token" hint="(Conversions API token)">
              <SecretInput
                register={register}
                name="meta_access_token"
                placeholder="EAAxxxxxxxxxxxxxxx..."
                disabled={!isEditing}
              />
            </FieldRow>
          </PlatformCard>

          {/* TikTok Pixel */}
          <PlatformCard
            icon={<SiTiktok size={18} />}
            title="TikTok Pixel"
            badge="Browser tracking + Server-side Events API"
            iconBg="bg-gray-900"
            headerBg="bg-gray-50"
            border="border-gray-200"
          >
            <ToggleRow
              label="Enable TikTok Pixel"
              description="Loads ttq script on all pages"
              enabled={toggles.tiktok_pixel_enabled}
              onChange={setToggle("tiktok_pixel_enabled")}
              disabled={!isEditing}
            />
            <FieldRow label="Pixel ID" hint="(from TikTok Ads Manager)">
              <input
                {...register("tiktok_pixel_id")}
                placeholder="e.g. CXXXXXXXXXXXXXXX"
                disabled={!isEditing}
                className={inputCls(isEditing)}
              />
            </FieldRow>
            <ToggleRow
              label="Enable Events API (Server-side)"
              description="Sends server events via TikTok Events API"
              enabled={toggles.tiktok_capi_enabled}
              onChange={setToggle("tiktok_capi_enabled")}
              disabled={!isEditing}
            />
            <FieldRow label="Access Token" hint="(Events API token)">
              <SecretInput
                register={register}
                name="tiktok_access_token"
                placeholder="Your TikTok access token..."
                disabled={!isEditing}
              />
            </FieldRow>
          </PlatformCard>

          {/* GTM */}
          <PlatformCard
            icon={<SiGoogletagmanager size={18} />}
            title="Google Tag Manager"
            badge="GA4 + other tags fire through GTM"
            iconBg="bg-green-600"
            headerBg="bg-green-50"
            border="border-green-100"
          >
            <ToggleRow
              label="Enable GTM"
              description="Loads GTM script in <head> and <body>"
              enabled={toggles.gtm_enabled}
              onChange={setToggle("gtm_enabled")}
              disabled={!isEditing}
            />
            <FieldRow label="GTM Container ID">
              <input
                {...register("gtm_id")}
                placeholder="e.g. GTM-XXXXXXX"
                disabled={!isEditing}
                className={inputCls(isEditing)}
              />
            </FieldRow>
          </PlatformCard>

          {/* GA4 */}
          <PlatformCard
            icon={<SiGoogleanalytics size={18} />}
            title="Google Analytics 4"
            badge="Use only if GTM is disabled — avoids double tracking"
            iconBg="bg-orange-500"
            headerBg="bg-orange-50"
            border="border-orange-100"
          >
            <ToggleRow
              label="Enable GA4 (Standalone)"
              description="Only enable if you are NOT using GTM"
              enabled={toggles.ga4_enabled}
              onChange={setToggle("ga4_enabled")}
              disabled={!isEditing}
            />
            <FieldRow label="Measurement ID">
              <input
                {...register("ga4_id")}
                placeholder="e.g. G-XXXXXXXXXX"
                disabled={!isEditing}
                className={inputCls(isEditing)}
              />
            </FieldRow>
          </PlatformCard>

          {/* Microsoft Clarity */}
          <PlatformCard
            icon={<VscAzure size={18} />}
            title="Microsoft Clarity"
            badge="Session recording & heatmaps"
            iconBg="bg-purple-600"
            headerBg="bg-purple-50"
            border="border-purple-100"
          >
            <ToggleRow
              label="Enable Clarity"
              description="Records user sessions and generates heatmaps"
              enabled={toggles.clarity_enabled}
              onChange={setToggle("clarity_enabled")}
              disabled={!isEditing}
            />
            <FieldRow label="Clarity Project ID">
              <input
                {...register("clarity_id")}
                placeholder="e.g. abcdefghij"
                disabled={!isEditing}
                className={inputCls(isEditing)}
              />
            </FieldRow>
          </PlatformCard>

          {/* ── Action Buttons ──────────────────────────────── */}
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
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-500/30 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <MiniSpinner />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Analytics Settings</span>
                  )}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-2"
              >
                <FaEdit /> Edit Settings
              </button>
            )}
          </div>
        </form>

        {/* ── Footer Note ─────────────────────────────────────── */}
        <div className="bg-gray-50 border-t border-gray-200 p-4 flex items-start gap-3">
          <FiInfo className="text-blue-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-gray-500">
            <span className="font-medium text-gray-700">Note:</span> Changes
            take effect immediately — no server restart or redeployment needed.
            Pixel scripts and server-side events load/unload automatically based
            on enabled status.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default AnalyticsSettings;
