import { RxCross1 } from "react-icons/rx";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { generateSlug } from "./../../utils/generateSlug";
//import ReactTooltip from 'react-tooltip'
import { GrUpdate } from "react-icons/gr";
import { Tooltip } from "react-tooltip";
import { BASE_URL } from "../../utils/baseURL";
import { toast } from "react-toastify";
import MiniSpinner from "../../shared/MiniSpinner/MiniSpinner";

const UpDateCategory = ({
  setCategoryUpdateModal,
  categoryUpdateData,
  refetch,
  user,
}) => {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm();

  //Image Handling...
  const [imagePreview, setImagePreview] = useState(
    categoryUpdateData?.category_logo
  );
  //Video Handling...
  const [videoPreview, setVideoPreview] = useState(
    categoryUpdateData?.category_video
  );

  //
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };
  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  // Handle Update Category
  const handleDataPost = async (data) => {
    if (data?.category_logo[0] && data?.category_video[0]) {
      setLoading(true);
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === "category_logo") {
          formData.append(key, data?.category_logo[0]);
        } else if (key === "category_video") {
          formData.append(key, data?.category_video[0]);
        } else formData.append(key, value);
      });

      formData.append(
        "category_logo_key",
        categoryUpdateData?.category_logo_key
      );
      formData.append(
        "category_video_key",
        categoryUpdateData?.category_video_key
      );

      const category_slug = generateSlug(
        data?.category_name
          ? data?.category_name
          : categoryUpdateData?.category_name
      );
      formData.append("category_slug", category_slug);
      formData.append("_id", categoryUpdateData?._id);
      formData.append("category_updated_by", user?._id);
      const response = await fetch(`${BASE_URL}/category`, {
        method: "PATCH",
        credentials: "include",
        body: formData,
      });
      const result = await response.json();
      if (result?.statusCode === 200 && result?.success === true) {
        toast.success(
          result?.message ? result?.message : "Category update successfully",
          {
            autoClose: 1000,
          }
        );
        refetch();
        setLoading(false);
        setCategoryUpdateModal(false);
      } else {
        toast.error(result?.message || "Something went wrong", {
          autoClose: 1000,
        });
        setLoading(false);
      }
    } else if (data?.category_logo[0]) {
      setLoading(true);
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === "category_logo") {
          formData.append(key, data?.category_logo[0]);
        } else if (key === "category_video") {
        } else formData.append(key, value);
      });

      formData.append(
        "category_logo_key",
        categoryUpdateData?.category_logo_key
      );

      const category_slug = generateSlug(
        data?.category_name
          ? data?.category_name
          : categoryUpdateData?.category_name
      );
      formData.append("category_slug", category_slug);
      formData.append("_id", categoryUpdateData?._id);
      formData.append("category_updated_by", user?._id);
      const response = await fetch(`${BASE_URL}/category`, {
        method: "PATCH",
        credentials: "include",
        body: formData,
      });
      const result = await response.json();
      if (result?.statusCode === 200 && result?.success === true) {
        toast.success(
          result?.message ? result?.message : "Category update successfully",
          {
            autoClose: 1000,
          }
        );
        refetch();
        setLoading(false);
        setCategoryUpdateModal(false);
      } else {
        toast.error(result?.message || "Something went wrong", {
          autoClose: 1000,
        });
        setLoading(false);
      }
    } else if (data?.category_video[0]) {
      setLoading(true);
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === "category_video") {
          formData.append(key, data?.category_video[0]);
        } else if (key === "category_logo") {
        } else formData.append(key, value);
      });

      formData.append(
        "category_video_key",
        categoryUpdateData?.category_video_key
      );

      const category_slug = generateSlug(
        data?.category_name
          ? data?.category_name
          : categoryUpdateData?.category_name
      );
      formData.append("category_slug", category_slug);
      formData.append("_id", categoryUpdateData?._id);
      formData.append("category_updated_by", user?._id);
      const response = await fetch(`${BASE_URL}/category`, {
        method: "PATCH",
        credentials: "include",
        body: formData,
      });
      const result = await response.json();
      if (result?.statusCode === 200 && result?.success === true) {
        toast.success(
          result?.message ? result?.message : "Category update successfully",
          {
            autoClose: 1000,
          }
        );
        refetch();
        setLoading(false);
        setCategoryUpdateModal(false);
      } else {
        toast.error(result?.message || "Something went wrong", {
          autoClose: 1000,
        });
        setLoading(false);
      }
    } else {
      setLoading(true);
      const sendData = {
        _id: categoryUpdateData?._id,

        category_name: data?.category_name
          ? data?.category_name
          : categoryUpdateData?.category_name,
        category_serial: data?.category_serial
          ? data?.category_serial
          : categoryUpdateData?.category_serial,
        category_status: data?.category_status
          ? data?.category_status
          : categoryUpdateData?.category_status,
        feature_category_show: data?.feature_category_show,

        explore_category_show: data?.explore_category_show,
        category_updated_by: user?._id,
        category_slug: generateSlug(
          data?.category_name
            ? data?.category_name
            : categoryUpdateData?.category_name
        ),
      };
      const response = await fetch(`${BASE_URL}/category`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sendData),
      });
      const result = await response.json();
      if (result?.statusCode === 200 && result?.success === true) {
        toast.success(
          result?.message ? result?.message : "Category update successfully",
          {
            autoClose: 1000,
          }
        );
        refetch();
        setLoading(false);
        setCategoryUpdateModal(false);
      } else {
        toast.error(result?.message || "Something went wrong", {
          autoClose: 1000,
        });
        setLoading(false);
      }
    }
  };

  return (
    <div>
      <div>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative overflow-hidden text-left bg-white rounded-lg shadow-xl w-[550px] p-6 max-h-[100vh] overflow-y-auto scrollbar-thin">
            <div className="flex items-center justify-between mt-4">
              <h3
                className="text-[26px] font-bold text-gray-800 capitalize"
                id="modal-title"
              >
                Update Category
              </h3>
              <button
                type="button"
                className="btn bg-white  p-1 absolute right-3 rounded-full top-3 hover:bg-bgBtnInactive hover:text-btnInactiveColor"
                onClick={() => setCategoryUpdateModal(false)}
              >
                {" "}
                <RxCross1 size={20}></RxCross1>
              </button>
            </div>

            <hr className="mt-2 mb-6" />

            <form onSubmit={handleSubmit(handleDataPost)} className="">
              <div>
                <label
                  htmlFor="UserEmail"
                  className="block text-xs font-medium text-gray-700"
                >
                  Category Name
                </label>

                <input
                  {...register("category_name")}
                  type="text"
                  defaultValue={categoryUpdateData?.category_name}
                  className="mt-2 w-full rounded-md border-gray-200 shadow-sm sm:text-sm p-2 border-2"
                />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700">
                    Category Status
                  </label>
                  <select
                    {...register("category_status")}
                    defaultValue={categoryUpdateData?.category_status}
                    className="mt-2 rounded-md border-gray-200 shadow-sm sm:text-sm p-2 border-2 w-full"
                  >
                    <option value="active">Active</option>
                    <option value="in-active">In-Active</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">
                    Category serial
                  </label>

                  <input
                    {...register("category_serial", {
                      validate: (value) => {
                        if (value < 1) {
                          return "serial must be greater than 0";
                        }
                      },
                    })}
                    type="number"
                    defaultValue={categoryUpdateData?.category_serial}
                    className="mt-2 w-full rounded-md border-gray-200 shadow-sm sm:text-sm p-2 border-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">
                    Explore Category show
                  </label>
                  <div className="whitespace-nowrap px-4 py-2 text-gray-700 ">
                    <label
                      htmlFor="Toggle3"
                      className="inline-flex items-center space-x-4 cursor-pointer dark:text-gray-800"
                    >
                      <span className="relative mt-2">
                        <input
                          id="Toggle3"
                          type="checkbox"
                          defaultChecked={
                            categoryUpdateData?.explore_category_show
                          }
                          className="hidden peer"
                          {...register("explore_category_show")}
                        />
                        <div className="w-10 h-4 rounded-full shadow bg-slate-200 peer-checked:bg-bgBtnActive "></div>
                        <div className="absolute left-0 w-6 h-6 rounded-full shadow -inset-y-1 peer-checked:right-0 peer-checked:left-auto peer-checked:bg-primaryColor bg-white"></div>
                      </span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">
                    Feature Category show
                  </label>
                  <div className="whitespace-nowrap px-4 py-2 text-gray-700 ">
                    <label
                      htmlFor="Toggle4"
                      className="inline-flex items-center space-x-4 cursor-pointer dark:text-gray-800"
                    >
                      <span className="relative mt-2">
                        <input
                          id="Toggle4"
                          type="checkbox"
                          defaultChecked={
                            categoryUpdateData?.feature_category_show
                          }
                          className="hidden peer"
                          {...register("feature_category_show")}
                        />
                        <div className="w-10 h-4 rounded-full shadow bg-slate-200 peer-checked:bg-bgBtnActive "></div>
                        <div className="absolute left-0 w-6 h-6 rounded-full shadow -inset-y-1 peer-checked:right-0 peer-checked:left-auto peer-checked:bg-primaryColor bg-white"></div>
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* image */}
              <div className="mt-6 relative">
                {imagePreview && (
                  <>
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-64 object-cover my-2 rounded "
                      />
                    </div>
                  </>
                )}
                <>
                  <label
                    className="p-2  bg-primaryColor  rounded cursor-pointer absolute top-2  right-2 text-white border "
                    htmlFor="category_logo"
                    data-tooltip-id="category-image"
                    data-tooltip-content="Upload Your Image"
                  >
                    <GrUpdate size={25} />
                    <Tooltip id="category-image" />
                    <Tooltip />
                  </label>

                  <input
                    {...register("category_logo")}
                    accept="image/*"
                    type="file"
                    id="category_logo"
                    className=" sm:text-sm p-0.5 file:cursor-pointer file:bg-primaryColor file:text-white  file:border-none file:rounded file:px-2 file:py-1.5"
                    onChange={handleImageChange}
                  />
                  <p className="text-xs text-[#C9CACA]  mt-1 text-end">
                    Upload 300x300 pixel images in PNG, JPG, or WebP format (max
                    1 MB).
                  </p>
                </>
              </div>

              {/* video */}
              <div className="mt-6 relative">
                {videoPreview && (
                  <>
                    <div className="relative">
                      <video
                        src={videoPreview}
                        autoPlay
                        controls
                        alt="Preview"
                        className="w-full h-64 object-cover my-2 rounded "
                      />
                    </div>
                  </>
                )}
                <>
                  <label
                    className="p-2  bg-primaryColor  rounded cursor-pointer absolute top-2  right-2 text-white border "
                    htmlFor="category_video"
                    data-tooltip-id="category-video"
                    data-tooltip-content="Upload Your Video"
                  >
                    <GrUpdate size={25} />
                    <Tooltip id="category-video" />
                    <Tooltip />
                  </label>

                  <input
                    {...register("category_video")}
                    accept="video/*"
                    type="file"
                    id="category_video"
                    className=" sm:text-sm p-0.5 file:cursor-pointer file:bg-primaryColor file:text-white  file:border-none file:rounded file:px-2 file:py-1.5"
                    onChange={handleVideoChange}
                  />
                </>
              </div>

              <div className="flex gap-8 mt-6 justify-end">
                <button
                  className="px-10 py-2 border  rounded hover:bg-bgBtnInactive hover:text-btnInactiveColor"
                  onClick={() => setCategoryUpdateModal(false)}
                >
                  Cancel
                </button>
                {loading ? (
                  <div className="px-10 py-2  bg-primaryColor text-white rounded flex justify-center items-center">
                    <MiniSpinner />
                  </div>
                ) : (
                  <button
                    className="px-10 py-2  bg-primaryColor hover:bg-blue-500 duration-200 text-white rounded"
                    type="Submit"
                  >
                    Update
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpDateCategory;
