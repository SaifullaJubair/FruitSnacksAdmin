import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { RxCross1 } from "react-icons/rx";
import { BASE_URL } from "../../utils/baseURL";
import MiniSpinner from "../../shared/MiniSpinner/MiniSpinner";

const UpdatePageSeo = ({
  setShowPageSeoUpdateModal,
  getPageSeoUpdateData,
  refetch,
}) => {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: getPageSeoUpdateData?.title || "",
      description: getPageSeoUpdateData?.description || "",
      noIndex: getPageSeoUpdateData?.noIndex || false,
    },
  });

  // Handle Update Page SEO
  const handleDataUpdate = async (data) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/page-seo/${getPageSeoUpdateData?.page_key}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(data),
        },
      );

      const result = await response.json();
      if (result?.statusCode === 200 && result?.success === true) {
        toast.success(
          result?.message ? result?.message : "Page SEO updated successfully",
          { autoClose: 1000 },
        );
        refetch();
        setLoading(false);
        setShowPageSeoUpdateModal(false);
      } else {
        toast.error(result?.message || "Something went wrong", {
          autoClose: 1000,
        });
        setLoading(false);
      }
    } catch (error) {
      toast.error(error?.message, { autoClose: 1000 });
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="relative overflow-hidden text-left bg-white rounded-lg shadow-xl w-[650px] p-6 max-h-[100vh] overflow-y-auto scrollbar-thin">
          <div className="flex items-center justify-between mt-4">
            <h3
              className="text-[26px] font-bold text-gray-800 capitalize"
              id="modal-title"
            >
              Update Page SEO - {getPageSeoUpdateData?.page_key}
            </h3>
            <button
              type="button"
              className="btn bg-white p-1 absolute right-3 rounded-full top-3 hover:bg-bgBtnInactive hover:text-btnInactiveColor"
              onClick={() => setShowPageSeoUpdateModal(false)}
            >
              <RxCross1 size={20} />
            </button>
          </div>

          <hr className="mt-2 mb-6" />

          <form onSubmit={handleSubmit(handleDataUpdate)}>
            {/* Page Path (Read-only) */}
            <div>
              <label className="block text-xs font-medium text-gray-700">
                Page Path
              </label>
              <input
                type="text"
                value={`/${getPageSeoUpdateData?.path || ""}`}
                disabled
                className="mt-2 w-full rounded-md border-gray-200 shadow-sm sm:text-sm p-2 border-2 bg-gray-100 cursor-not-allowed"
              />
            </div>

            {/* Meta Title */}
            <div className="mt-4">
              <label className="block text-xs font-medium text-gray-700">
                Meta Title <span className="text-red-500">*</span>
              </label>
              <input
                {...register("title", {
                  required: "Meta Title is required",
                  maxLength: {
                    value: 60,
                    message: "Title should be max 60 characters",
                  },
                })}
                type="text"
                placeholder="Enter meta title"
                className="mt-2 w-full rounded-md border-gray-200 shadow-sm sm:text-sm p-2 border-2"
              />
              {errors.title && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.title?.message}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Recommended: 50-60 characters
              </p>
            </div>

            {/* Meta Description */}
            <div className="mt-4">
              <label className="block text-xs font-medium text-gray-700">
                Meta Description
              </label>
              <textarea
                {...register("description", {
                  maxLength: {
                    value: 160,
                    message: "Description should be max 160 characters",
                  },
                })}
                rows={4}
                placeholder="Enter meta description"
                className="mt-2 w-full rounded-md border-gray-200 shadow-sm sm:text-sm p-2 border-2"
              />
              {errors.description && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.description?.message}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Recommended: 150-160 characters
              </p>
            </div>

            {/* NoIndex Toggle */}
            <div className="mt-4">
              <label className="flex items-center space-x-2">
                <input
                  {...register("noIndex")}
                  type="checkbox"
                  className="w-4 h-4 text-primaryColor border-gray-300 rounded focus:ring-primaryColor"
                />
                <span className="text-sm font-medium text-gray-700">
                  NoIndex (Hide from search engines)
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Check this for private pages (login, cart, etc.)
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-6 justify-end">
              <button
                className="px-10 py-2 border rounded hover:bg-bgBtnInactive hover:text-btnInactiveColor"
                onClick={(e) => {
                  e.preventDefault();
                  setShowPageSeoUpdateModal(false);
                }}
                type="button"
              >
                Cancel
              </button>
              {loading ? (
                <div className="px-10 py-2 flex items-center justify-center bg-primaryColor text-white rounded">
                  <MiniSpinner />
                </div>
              ) : (
                <button
                  className="px-10 py-2 bg-primaryColor hover:bg-blue-500 duration-200 text-white rounded"
                  type="submit"
                >
                  Update
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdatePageSeo;
