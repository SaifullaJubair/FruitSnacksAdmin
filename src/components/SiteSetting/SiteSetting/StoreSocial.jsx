import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import {
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaYoutube,
  FaWhatsapp,
  FaTiktok,
  FaStore,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
} from "react-icons/fa";
import { BASE_URL } from "../../../utils/baseURL";
import MiniSpinner from "../../../shared/MiniSpinner/MiniSpinner";

const StoreSocial = ({ refetch, getInitialCurrencyData: data }) => {
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      // Store Information
      store_name: data?.store_name || "",
      store_email: data?.store_email || "",
      store_phone: data?.store_phone || "",
      store_address: data?.store_address || "",
      store_address_two: data?.store_address_two || "",
      store_address_three: data?.store_address_three || "",

      // Social Media
      facebook: data?.facebook || "",
      instagram: data?.instagram || "",
      twitter: data?.twitter || "",
      you_tube: data?.you_tube || "",
      watsapp: data?.watsapp || "",
      tik_tok: data?.tik_tok || "",
    },
  });

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleStoreSocialPost = async (data) => {
    setLoading(true);
    if (data?._id) {
      try {
        const sendData = {
          _id: data?._id,
          ...data,
        };

        const response = await fetch(`${BASE_URL}/setting`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sendData),
        });

        const result = await response.json();
        if (result?.statusCode === 200 && result?.success === true) {
          toast.success("Store & Social settings updated successfully");
          refetch();
          setIsEditing(false);
        } else {
          toast.error(result?.message || "Something went wrong");
        }
      } catch (error) {
        toast.error(error?.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const socialFields = [
    {
      name: "facebook",
      label: "Facebook",
      icon: FaFacebook,
      color: "bg-blue-600",
      placeholder: "https://facebook.com/yourpage",
    },
    {
      name: "instagram",
      label: "Instagram",
      icon: FaInstagram,
      color: "bg-pink-600",
      placeholder: "https://instagram.com/yourpage",
    },
    {
      name: "twitter",
      label: "Twitter",
      icon: FaTwitter,
      color: "bg-sky-500",
      placeholder: "https://twitter.com/yourpage",
    },
    {
      name: "you_tube",
      label: "YouTube",
      icon: FaYoutube,
      color: "bg-red-600",
      placeholder: "https://youtube.com/@yourchannel",
    },
    {
      name: "watsapp",
      label: "WhatsApp",
      icon: FaWhatsapp,
      color: "bg-green-600",
      placeholder: "https://wa.me/yournumber",
    },
    {
      name: "tik_tok",
      label: "TikTok",
      icon: FaTiktok,
      color: "bg-black",
      placeholder: "https://tiktok.com/@yourpage",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <form onSubmit={handleSubmit(handleStoreSocialPost)}>
        {/* Store Information Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-2 mb-6">
            <FaStore className="text-blue-600 text-xl" />
            <h3 className="text-lg font-semibold text-gray-800">
              Store Information
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Store Name
              </label>
              <input
                {...register("store_name")}
                type="text"
                disabled={!isEditing}
                placeholder="Enter store name"
                className="w-full rounded-lg border-gray-200 shadow-sm text-sm p-2.5 border focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Store Email
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...register("store_email")}
                  type="email"
                  disabled={!isEditing}
                  placeholder="Enter store email"
                  className="w-full pl-10 rounded-lg border-gray-200 shadow-sm text-sm p-2.5 border focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Store Phone
              </label>
              <div className="relative">
                <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...register("store_phone")}
                  type="tel"
                  disabled={!isEditing}
                  placeholder="Enter store phone"
                  className="w-full pl-10 rounded-lg border-gray-200 shadow-sm text-sm p-2.5 border focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Store Address (Main)
              </label>
              <div className="relative">
                <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...register("store_address")}
                  type="text"
                  disabled={!isEditing}
                  placeholder="Enter main address"
                  className="w-full pl-10 rounded-lg border-gray-200 shadow-sm text-sm p-2.5 border focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Store Address 2
              </label>
              <input
                {...register("store_address_two")}
                type="text"
                disabled={!isEditing}
                placeholder="Enter second address"
                className="w-full rounded-lg border-gray-200 shadow-sm text-sm p-2.5 border focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Store Address 3
              </label>
              <input
                {...register("store_address_three")}
                type="text"
                disabled={!isEditing}
                placeholder="Enter third address"
                className="w-full rounded-lg border-gray-200 shadow-sm text-sm p-2.5 border focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
          </div>
        </div>

        {/* Social Media Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">
            Social Media Links
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {socialFields.map((field) => {
              const Icon = field.icon;
              return (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                  </label>
                  <div className="relative">
                    <div
                      className={`absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 ${field.color} rounded-lg flex items-center justify-center text-white`}
                    >
                      <Icon size={14} />
                    </div>
                    <input
                      {...register(field.name)}
                      type="url"
                      disabled={!isEditing}
                      placeholder={field.placeholder}
                      className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Welcome Message Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Welcome Message
          </h3>

          <textarea
            {...register("welcome_message")}
            disabled={!isEditing}
            rows={4}
            placeholder="Enter your welcome message..."
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white disabled:bg-gray-50 disabled:text-gray-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-500/30 transition-all duration-200 disabled:opacity-50 flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <MiniSpinner />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span>Save Changes</span>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-500/30 transition-all duration-200"
            >
              Edit Settings
            </button>
          )}
        </div>
      </form>
    </motion.div>
  );
};

export default StoreSocial;
