import { useState } from "react";
import { useForm } from "react-hook-form";
import { BASE_URL } from "../../../utils/baseURL";
import { toast } from "react-toastify";
import MiniSpinner from "../../../shared/MiniSpinner/MiniSpinner";

const StoreDetails = ({ refetch, getInitialCurrencyData }) => {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm();

  const handleShippingPost = async (data) => {
    setLoading(true);
    if (getInitialCurrencyData?._id) {
      try {
        const sendData = {
          _id: getInitialCurrencyData?._id,
          facebook: data?.facebook,
          instagram: data?.instagram,
          twitter: data?.twitter,
          you_tube: data?.you_tube,
          watsapp: data?.watsapp,
          tik_tok: data?.tik_tok,
          welcome_message: data?.welcome_message,
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
              : "Store Details update successfully",
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
      } catch (error) {
        toast.error(error?.message, {
          autoClose: 1000,
        });
        setLoading(false);
      } finally {
        setLoading(false);
      }
    }
  };
  return (
    <div>
      <form onSubmit={handleSubmit(handleShippingPost)} className="p-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="">
            <label
              htmlFor="facebook"
              className="block text-xs font-medium text-gray-700"
            >
              Facebook
            </label>
            <input
              {...register("facebook")}
              type="url"
              defaultValue={getInitialCurrencyData?.facebook}
              id="facebook"
              placeholder="Enter Your Facebook Link"
              className="mt-2 w-full rounded-md border-gray-200 shadow-sm sm:text-sm p-2 border-2"
            />
          </div>
          <div className="">
            <label
              htmlFor="instagram"
              className="block text-xs font-medium text-gray-700"
            >
              Instagram
            </label>
            <input
              {...register("instagram")}
              type="url"
              defaultValue={getInitialCurrencyData?.instagram}
              id="instagram"
              placeholder="Enter Your Instagram Link"
              className="mt-2 w-full rounded-md border-gray-200 shadow-sm sm:text-sm p-2 border-2"
            />
          </div>
          <div className="">
            <label
              htmlFor="twitter"
              className="block text-xs font-medium text-gray-700"
            >
              Twitter
            </label>
            <input
              {...register("twitter")}
              type="url"
              id="twitter"
              defaultValue={getInitialCurrencyData?.twitter}
              placeholder="Enter Your Twitter Link"
              className="mt-2 w-full rounded-md border-gray-200 shadow-sm sm:text-sm p-2 border-2"
            />
          </div>
          <div className="">
            <label
              htmlFor="you_tube"
              className="block text-xs font-medium text-gray-700"
            >
              Youtube
            </label>
            <input
              {...register("you_tube")}
              type="url"
              defaultValue={getInitialCurrencyData?.you_tube}
              id="you_tube"
              placeholder="Enter Your Youtube Link"
              className="mt-2 w-full rounded-md border-gray-200 shadow-sm sm:text-sm p-2 border-2"
            />
          </div>
          <div className="">
            <label
              htmlFor="watsapp"
              className="block text-xs font-medium text-gray-700"
            >
              WatsApp
            </label>
            <input
              {...register("watsapp")}
              type="url"
              defaultValue={getInitialCurrencyData?.watsapp}
              id="watsapp"
              placeholder="Enter Your WatsApp Link"
              className="mt-2 w-full rounded-md border-gray-200 shadow-sm sm:text-sm p-2 border-2"
            />
          </div>
          <div className="">
            <label
              htmlFor="tik_tok"
              className="block text-xs font-medium text-gray-700"
            >
              Tik Tok
            </label>
            <input
              {...register("tik_tok")}
              type="url"
              defaultValue={getInitialCurrencyData?.tik_tok}
              id="tik_tok"
              placeholder="Enter Your Tik Tok Link"
              className="mt-2 w-full rounded-md border-gray-200 shadow-sm sm:text-sm p-2 border-2"
            />
          </div>
          <div className="">
            <label
              htmlFor="welcome_message"
              className="block text-xs font-medium text-gray-700"
            >
              Welcome Message
            </label>
            <textarea
              {...register("welcome_message")}
              type="url"
              defaultValue={getInitialCurrencyData?.welcome_message}
              id="welcome_message"
              placeholder="Enter Your Welcome message"
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

export default StoreDetails;
