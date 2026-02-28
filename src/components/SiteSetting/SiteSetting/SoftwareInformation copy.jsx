import { useState } from "react";
import { useForm } from "react-hook-form";
import { BASE_URL } from "../../../utils/baseURL";
import { toast } from "react-toastify";
import MiniSpinner from "../../../shared/MiniSpinner/MiniSpinner";
import ImageUploader from "../../common/ImageUploader";

const SoftwareInformation = ({ refetch, getInitialCurrencyData }) => {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm();

  const handleShippingPost = async (data) => {
    setLoading(true);

    let logo;
    let favicon;
    if (data?.logo?.[0]) {
      const logoUpload = await ImageUploader(data?.logo?.[0]);
      logo = logoUpload[0];
    }
    if (data?.favicon?.[0]) {
      const faviconUpload = await ImageUploader(data?.favicon?.[0]);
      favicon = faviconUpload[0];
    }
    const sendData = {
      logo: logo || getInitialCurrencyData?.logo,
      favicon: favicon || getInitialCurrencyData?.favicon,
      title: data?.title || getInitialCurrencyData?.title,
      contact: data?.contact || getInitialCurrencyData?.contact,
      email: data?.email || getInitialCurrencyData?.email,
      address: data?.address || getInitialCurrencyData?.address,
      _id: getInitialCurrencyData?._id,
      address_two: data?.address_two || getInitialCurrencyData?.address_two,
      address_three:
        data?.address_three || getInitialCurrencyData?.address_three,
    };
    const response = await fetch(`${BASE_URL}/setting`, {
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
        result?.message
          ? result?.message
          : "Sowtware Information update successfully",
        {
          autoClose: 1000,
        }
      );
      refetch();
      setLoading(false);
    } else {
      toast.error(result?.message || "Something went wrong", {
        autoClose: 1000,
      });
      setLoading(false);
    }
  };
  return (
    <div>
      <form onSubmit={handleSubmit(handleShippingPost)} className="p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              className="block text-xs font-medium text-gray-700"
              htmlFor="logo"
            >
              Logo
            </label>
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
              id="logo"
              type="file"
              accept="image/*"
              className="mt-2 w-full file:bg-blue-600 file:border-none file:text-white rounded-md border-gray-200 shadow-sm sm:text-sm p-2 border-2 file:rounded cursor-pointer"
            />
          </div>
          <div>
            <label
              className="block text-xs font-medium text-gray-700"
              htmlFor="favicon"
            >
              Favicon
            </label>
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
              id="favicon"
              type="file"
              accept="image/*"
              className="mt-2 w-full file:bg-blue-600 file:border-none file:text-white rounded-md border-gray-200 shadow-sm sm:text-sm p-2 border-2 file:rounded cursor-pointer"
            />
          </div>

          <div>
            <label
              htmlFor=""
              className="block text-xs font-medium text-gray-700"
            >
              Title
            </label>
            <input
              {...register("title")}
              type="text"
              defaultValue={getInitialCurrencyData?.title}
              placeholder="Enter Title"
              className="mt-2 w-full rounded-md border-gray-200 shadow-sm sm:text-sm p-2 border-2"
            />
          </div>
          <div className="">
            <label
              htmlFor=""
              className="block text-xs font-medium text-gray-700"
            >
              Contact Number
            </label>
            <input
              {...register("contact")}
              type="text"
              defaultValue={getInitialCurrencyData?.contact}
              placeholder="Enter Contact Number"
              className="mt-2 w-full rounded-md border-gray-200 shadow-sm sm:text-sm p-2 border-2"
            />
          </div>
          <div className="">
            <label
              htmlFor=""
              className="block text-xs font-medium text-gray-700"
            >
              Email
            </label>
            <input
              {...register("email")}
              type="email"
              placeholder="Enter Email"
              defaultValue={getInitialCurrencyData?.email}
              className="mt-2 w-full rounded-md border-gray-200 shadow-sm sm:text-sm p-2 border-2"
            />
          </div>
          <div className="">
            <label
              htmlFor=""
              className="block text-xs font-medium text-gray-700"
            >
              Shop 1 Address
            </label>
            <input
              {...register("address")}
              type="text"
              defaultValue={getInitialCurrencyData?.address}
              placeholder="Enter Shop 1 Address"
              className="mt-2 w-full rounded-md border-gray-200 shadow-sm sm:text-sm p-2 border-2"
            />
          </div>
          <div className="">
            <label
              htmlFor=""
              className="block text-xs font-medium text-gray-700"
            >
              Shop 2 Address
            </label>
            <input
              {...register("address_two")}
              type="text"
              defaultValue={getInitialCurrencyData?.address_two}
              placeholder="Enter Shop 2 Address"
              className="mt-2 w-full rounded-md border-gray-200 shadow-sm sm:text-sm p-2 border-2"
            />
          </div>
          <div className="">
            <label
              htmlFor=""
              className="block text-xs font-medium text-gray-700"
            >
              Shop 3 Address
            </label>
            <input
              {...register("address_three")}
              type="text"
              defaultValue={getInitialCurrencyData?.address_three}
              placeholder="Enter Shop 3 Address"
              className="mt-2 w-full rounded-md border-gray-200 shadow-sm sm:text-sm p-2 border-2"
            />
          </div>
        </div>
        <div className="flex gap-6 mt-4 justify-end">
          {loading == true ? (
            <div className="px-10 py-2 flex items-center justify-center  bg-primaryColor text-white rounded">
              <MiniSpinner />
            </div>
          ) : (
            <>
              {getInitialCurrencyData?._id ? (
                <button
                  className="px-10 py-2  bg-primaryColor hover:bg-blue-500 duration-200 text-white rounded"
                  type="submit"
                >
                  Update
                </button>
              ) : (
                <button
                  className="px-10 py-2  bg-primaryColor hover:bg-blue-500 duration-200 text-white rounded"
                  type="submit"
                >
                  Save
                </button>
              )}
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default SoftwareInformation;
