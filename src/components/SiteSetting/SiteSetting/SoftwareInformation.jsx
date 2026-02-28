import { useState } from "react";
import { useForm } from "react-hook-form";
import { BASE_URL } from "../../../utils/baseURL";
import { toast } from "react-toastify";
import MiniSpinner from "../../../shared/MiniSpinner/MiniSpinner";
import ImageUploader from "../../common/ImageUploader";

const SoftwareInformation = ({ refetch, getInitialCurrencyData }) => {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm();

  // Image preview states
  const [logoPreview, setLogoPreview] = useState(null);
  const [faviconPreview, setFaviconPreview] = useState(null);

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setLogoPreview(URL.createObjectURL(file));
  };

  const handleFaviconChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setFaviconPreview(URL.createObjectURL(file));
  };

  const handleShippingPost = async (data) => {
    setLoading(true);
    try {
      let logo = getInitialCurrencyData?.logo;
      let favicon = getInitialCurrencyData?.favicon;

      if (data?.logo?.[0]) {
        const logoUpload = await ImageUploader(data?.logo?.[0]);
        logo = logoUpload[0];
      }
      if (data?.favicon?.[0]) {
        const faviconUpload = await ImageUploader(data?.favicon?.[0]);
        favicon = faviconUpload[0];
      }

      const sendData = {
        _id: getInitialCurrencyData?._id,
        logo,
        favicon,
        title: data?.title || getInitialCurrencyData?.title,
        contact: data?.contact || getInitialCurrencyData?.contact,
        email: data?.email || getInitialCurrencyData?.email,
        address: data?.address || getInitialCurrencyData?.address,
        address_two: data?.address_two || getInitialCurrencyData?.address_two,
        address_three:
          data?.address_three || getInitialCurrencyData?.address_three,
        // ✅ SEO Fields
        seo_title: data?.seo_title || getInitialCurrencyData?.seo_title,
        seo_description:
          data?.seo_description || getInitialCurrencyData?.seo_description,
        seo_keywords:
          data?.seo_keywords || getInitialCurrencyData?.seo_keywords,
      };

      const response = await fetch(`${BASE_URL}/setting`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sendData),
      });

      const result = await response.json();
      if (result?.statusCode === 200 && result?.success === true) {
        toast.success(result?.message || "Settings updated successfully", {
          autoClose: 1000,
        });
        refetch();
      } else {
        toast.error(result?.message || "Something went wrong", {
          autoClose: 1000,
        });
      }
    } catch (error) {
      toast.error(error?.message, { autoClose: 1000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleShippingPost)} className="p-4 space-y-8">
      {/* ── Section 1: Logo & Favicon ── */}
      <div>
        <h5 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Branding
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logo */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Site Logo
            </label>
            {/* Preview */}
            <div className="mb-3 w-full h-28 bg-gray-50 border border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
              {logoPreview || getInitialCurrencyData?.logo ? (
                <img
                  src={logoPreview || getInitialCurrencyData?.logo}
                  alt="Logo preview"
                  className="max-h-24 max-w-full object-contain"
                />
              ) : (
                <span className="text-xs text-gray-400">No logo uploaded</span>
              )}
            </div>
            <input
              {...register("logo", {
                validate: (value) => {
                  if (value && value.length > 0) {
                    return (
                      value[0].type.startsWith("image/") ||
                      "Only image files are allowed"
                    );
                  }
                },
              })}
              onChange={(e) => {
                register("logo").onChange(e);
                handleLogoChange(e);
              }}
              type="file"
              accept="image/*"
              className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
            />
            <p className="text-xs text-gray-400 mt-1.5">
              Recommended: 400×120px, PNG/SVG
            </p>
          </div>

          {/* Favicon */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Favicon
            </label>
            {/* Preview */}
            <div className="mb-3 w-full h-28 bg-gray-50 border border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
              {faviconPreview || getInitialCurrencyData?.favicon ? (
                <img
                  src={faviconPreview || getInitialCurrencyData?.favicon}
                  alt="Favicon preview"
                  className="w-16 h-16 object-contain"
                />
              ) : (
                <span className="text-xs text-gray-400">
                  No favicon uploaded
                </span>
              )}
            </div>
            <input
              {...register("favicon", {
                validate: (value) => {
                  if (value && value.length > 0) {
                    return (
                      value[0].type.startsWith("image/") ||
                      "Only image files are allowed"
                    );
                  }
                },
              })}
              onChange={(e) => {
                register("favicon").onChange(e);
                handleFaviconChange(e);
              }}
              type="file"
              accept="image/*"
              className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
            />
            <p className="text-xs text-gray-400 mt-1.5">
              Recommended: 32×32px or 64×64px, ICO/PNG
            </p>
          </div>
        </div>
      </div>

      {/* ── Section 2: Basic Info ── */}
      <div>
        <h5 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Basic Information
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Site Title
            </label>
            <input
              {...register("title")}
              type="text"
              defaultValue={getInitialCurrencyData?.title}
              placeholder="e.g. Artisan Leather"
              className="w-full rounded-md border-gray-200 shadow-sm text-sm p-2 border-2 focus:border-blue-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Contact Number
            </label>
            <input
              {...register("contact")}
              type="text"
              defaultValue={getInitialCurrencyData?.contact}
              placeholder="e.g. 09696500122"
              className="w-full rounded-md border-gray-200 shadow-sm text-sm p-2 border-2 focus:border-blue-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              {...register("email")}
              type="email"
              defaultValue={getInitialCurrencyData?.email}
              placeholder="e.g. info@example.com"
              className="w-full rounded-md border-gray-200 shadow-sm text-sm p-2 border-2 focus:border-blue-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Shop 1 Address
            </label>
            <input
              {...register("address")}
              type="text"
              defaultValue={getInitialCurrencyData?.address}
              placeholder="Main branch address"
              className="w-full rounded-md border-gray-200 shadow-sm text-sm p-2 border-2 focus:border-blue-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Shop 2 Address
            </label>
            <input
              {...register("address_two")}
              type="text"
              defaultValue={getInitialCurrencyData?.address_two}
              placeholder="2nd branch address"
              className="w-full rounded-md border-gray-200 shadow-sm text-sm p-2 border-2 focus:border-blue-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Shop 3 Address
            </label>
            <input
              {...register("address_three")}
              type="text"
              defaultValue={getInitialCurrencyData?.address_three}
              placeholder="3rd branch address"
              className="w-full rounded-md border-gray-200 shadow-sm text-sm p-2 border-2 focus:border-blue-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* ── Section 3: SEO ── */}
      <div>
        <h5 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">
          SEO Settings
        </h5>
        <p className="text-xs text-gray-400 mb-4">
          Google search এ site কীভাবে দেখাবে সেটা control করুন।
        </p>
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              SEO Title
              <span className="ml-2 text-gray-400 font-normal">
                (Google search এ title)
              </span>
            </label>
            <input
              {...register("seo_title")}
              type="text"
              defaultValue={getInitialCurrencyData?.seo_title}
              placeholder="e.g. Artisan Leather – Premium Genuine Leather Products Bangladesh"
              className="w-full rounded-md border-gray-200 shadow-sm text-sm p-2 border-2 focus:border-blue-400 focus:outline-none bg-white"
            />
            <p className="text-xs text-gray-400 mt-1">
              Ideal length: 50–60 characters
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              SEO Description
              <span className="ml-2 text-gray-400 font-normal">
                (Google search এ description)
              </span>
            </label>
            <textarea
              {...register("seo_description")}
              rows={3}
              defaultValue={getInitialCurrencyData?.seo_description}
              placeholder="e.g. Bangladesh এর সেরা genuine leather wallet, bag ও belt। High quality, affordable price। Cash on delivery সারাদেশে।"
              className="w-full rounded-md border-gray-200 shadow-sm text-sm p-2 border-2 focus:border-blue-400 focus:outline-none bg-white resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">
              Ideal length: 150–160 characters
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              SEO Keywords
              <span className="ml-2 text-gray-400 font-normal">
                (comma দিয়ে আলাদা করুন)
              </span>
            </label>
            <input
              {...register("seo_keywords")}
              type="text"
              defaultValue={getInitialCurrencyData?.seo_keywords}
              placeholder="e.g. leather wallet, genuine leather, leather bag bangladesh"
              className="w-full rounded-md border-gray-200 shadow-sm text-sm p-2 border-2 focus:border-blue-400 focus:outline-none bg-white"
            />
          </div>

          {/* Live Google Preview */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">
              Google Preview
            </p>
            <div className="bg-white border border-gray-200 rounded p-3">
              <p className="text-blue-600 text-sm font-medium truncate">
                {getInitialCurrencyData?.seo_title ||
                  `${getInitialCurrencyData?.title || "Site Title"} – Premium Products`}
              </p>
              <p className="text-green-700 text-xs mt-0.5">
                artisenleather.com
              </p>
              <p className="text-gray-600 text-xs mt-1 line-clamp-2">
                {getInitialCurrencyData?.seo_description ||
                  "Site description এখানে দেখাবে। Admin panel থেকে SEO Description update করুন।"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Submit ── */}
      <div className="flex justify-end pt-2">
        {loading ? (
          <div className="px-10 py-2 flex items-center justify-center bg-primaryColor text-white rounded">
            <MiniSpinner />
          </div>
        ) : (
          <button
            type="submit"
            className="px-10 py-2 bg-primaryColor hover:bg-blue-500 duration-200 text-white rounded"
          >
            {getInitialCurrencyData?._id ? "Update" : "Save"}
          </button>
        )}
      </div>
    </form>
  );
};

export default SoftwareInformation;
