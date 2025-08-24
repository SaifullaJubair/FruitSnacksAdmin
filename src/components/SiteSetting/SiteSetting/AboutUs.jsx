import { useState } from "react";
import ReactQuill from "react-quill-new";
import { BASE_URL } from "../../../utils/baseURL";
import { toast } from "react-toastify";
import MiniSpinner from "../../../shared/MiniSpinner/MiniSpinner";

const AboutUs = ({ refetch, getInitialCurrencyData }) => {
  const [loading, setLoading] = useState(false);
  const [returnPolicyLoading, setReturnPolicyLoading] = useState(false);
  const [privacyPolicyLoading, setPrivacyPolicyLoading] = useState(false);
  const [refundPolicyLoading, setRefundPolicyLoading] = useState(false);
  const [cancelPolicyLoading, setCancelPolicyLoading] = useState(false);
  const [termsPolicyLoading, setTermsPolicyLoading] = useState(false);
  const [shippingPolicyLoading, setShippingPolicyLoading] = useState(false);

  const [about_us, setAboutUs] = useState(getInitialCurrencyData?.about_us);
  const [return_policy, setReturnPolicy] = useState(
    getInitialCurrencyData?.return_policy
  );
  const [privacy_policy, setPrivacyPolicy] = useState(
    getInitialCurrencyData?.privacy_policy
  );
  const [refund_policy, setRefundPolicy] = useState(
    getInitialCurrencyData?.refund_policy
  );
  const [cancellation_policy, setCancellationPolicy] = useState(
    getInitialCurrencyData?.cancellation_policy
  );
  const [terms_condition, setTermsAndCondition] = useState(
    getInitialCurrencyData?.terms_condition
  );
  const [shipping_info, setShippingInfo] = useState(
    getInitialCurrencyData?.shipping_info
  );

  //About Us Post
  const handleAboutUsPost = async () => {
    setLoading(true);
    if (getInitialCurrencyData?._id) {
      try {
        const sendData = {
          _id: getInitialCurrencyData?._id,
          about_us: about_us,
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
            result?.message ? result?.message : "About update successfully",
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

  //ReturnPolicyPost Us Post
  const handleReturnPolicyPost = async () => {
    setReturnPolicyLoading(true);
    if (getInitialCurrencyData?._id) {
      try {
        const sendData = {
          _id: getInitialCurrencyData?._id,
          return_policy: return_policy,
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
              : "Return Policy update successfully",
            {
              autoClose: 1000,
            }
          );
          refetch();
          setReturnPolicyLoading(false);
        } else {
          toast.error(result?.message || "Something went wrong", {
            autoClose: 1000,
          });
          setReturnPolicyLoading(false);
        }
      } catch (error) {
        toast.error(error?.message, {
          autoClose: 1000,
        });
        setReturnPolicyLoading(false);
      } finally {
        setReturnPolicyLoading(false);
      }
    }
  };

  //PrivacyPolicyPost Us Post
  const handlePrivacyPolicyPost = async () => {
    setPrivacyPolicyLoading(true);
    if (getInitialCurrencyData?._id) {
      try {
        const sendData = {
          _id: getInitialCurrencyData?._id,
          privacy_policy: privacy_policy,
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
              : "Privacy Policy update successfully",
            {
              autoClose: 1000,
            }
          );
          refetch();
          setPrivacyPolicyLoading(false);
        } else {
          toast.error(result?.message || "Something went wrong", {
            autoClose: 1000,
          });
          setPrivacyPolicyLoading(false);
        }
      } catch (error) {
        toast.error(error?.message, {
          autoClose: 1000,
        });
        setPrivacyPolicyLoading(false);
      } finally {
        setPrivacyPolicyLoading(false);
      }
    }
  };

  //RefundPolicyPost Us Post
  const handleRefundPolicyPost = async () => {
    setRefundPolicyLoading(true);
    if (getInitialCurrencyData?._id) {
      try {
        const sendData = {
          _id: getInitialCurrencyData?._id,
          refund_policy: refund_policy,
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
              : "Privacy Policy update successfully",
            {
              autoClose: 1000,
            }
          );
          refetch();
          setRefundPolicyLoading(false);
        } else {
          toast.error(result?.message || "Something went wrong", {
            autoClose: 1000,
          });
          setRefundPolicyLoading(false);
        }
      } catch (error) {
        toast.error(error?.message, {
          autoClose: 1000,
        });
        setRefundPolicyLoading(false);
      } finally {
        setRefundPolicyLoading(false);
      }
    }
  };
  //CancelPolicyPost Us Post
  const handleCancellationPolicyPost = async () => {
    setCancelPolicyLoading(true);
    if (getInitialCurrencyData?._id) {
      try {
        const sendData = {
          _id: getInitialCurrencyData?._id,
          cancellation_policy: cancellation_policy,
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
              : "Cancelation Policy update successfully",
            {
              autoClose: 1000,
            }
          );
          refetch();
          setCancelPolicyLoading(false);
        } else {
          toast.error(result?.message || "Something went wrong", {
            autoClose: 1000,
          });
          setCancelPolicyLoading(false);
        }
      } catch (error) {
        toast.error(error?.message, {
          autoClose: 1000,
        });
        setCancelPolicyLoading(false);
      } finally {
        setCancelPolicyLoading(false);
      }
    }
  };

  //TermsPolicyPost Us Post
  const handleTermsAndConditionPost = async () => {
    setTermsPolicyLoading(true);
    if (getInitialCurrencyData?._id) {
      try {
        const sendData = {
          _id: getInitialCurrencyData?._id,
          terms_condition: terms_condition,
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
              : "Cancelation Policy update successfully",
            {
              autoClose: 1000,
            }
          );
          refetch();
          setTermsPolicyLoading(false);
        } else {
          toast.error(result?.message || "Something went wrong", {
            autoClose: 1000,
          });
          setTermsPolicyLoading(false);
        }
      } catch (error) {
        toast.error(error?.message, {
          autoClose: 1000,
        });
        setTermsPolicyLoading(false);
      } finally {
        setTermsPolicyLoading(false);
      }
    }
  };

  //ShippingPolicyPost Us Post
  const handleShippingPost = async () => {
    setShippingPolicyLoading(true);
    if (getInitialCurrencyData?._id) {
      try {
        const sendData = {
          _id: getInitialCurrencyData?._id,
          shipping_info: shipping_info,
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
              : "Cancelation Policy update successfully",
            {
              autoClose: 1000,
            }
          );
          refetch();
          setShippingPolicyLoading(false);
        } else {
          toast.error(result?.message || "Something went wrong", {
            autoClose: 1000,
          });
          setShippingPolicyLoading(false);
        }
      } catch (error) {
        toast.error(error?.message, {
          autoClose: 1000,
        });
        setShippingPolicyLoading(false);
      } finally {
        setShippingPolicyLoading(false);
      }
    }
  };

  return (
    <div>
      <ReactQuill
        theme="snow"
        value={about_us}
        onChange={setAboutUs}
        style={{
          width: "1150px",
          maxWidth: "100%", // Prevents overflow issues on smaller screens
        }}
      />
      <div className="mt-2 flex items-center justify-end">
        {loading == true ? (
          <div className="px-10 py-2 flex items-center justify-center  bg-primaryColor text-white rounded">
            <MiniSpinner />
          </div>
        ) : (
          <button
            className="px-10 py-2  bg-primaryColor hover:bg-blue-500 duration-200 text-white rounded"
            type="submit"
            onClick={() => handleAboutUsPost()}
          >
            Submit
          </button>
        )}
      </div>
      {/*Return Policy Info */}
      <h4 className="font-semibold text-[20px] mt-4">Return Policy</h4>
      <hr className="mt-2 mb-4" />
      <ReactQuill
        theme="snow"
        value={return_policy}
        onChange={setReturnPolicy}
        style={{
          width: "1150px",
          maxWidth: "100%", // Prevents overflow issues on smaller screens
        }}
      />
      <div className="mt-2 flex items-center justify-end">
        {returnPolicyLoading == true ? (
          <div className="px-10 py-2 flex items-center justify-center  bg-primaryColor text-white rounded">
            <MiniSpinner />
          </div>
        ) : (
          <button
            className="px-10 py-2  bg-primaryColor hover:bg-blue-500 duration-200 text-white rounded"
            type="submit"
            onClick={() => handleReturnPolicyPost()}
          >
            Submit
          </button>
        )}
      </div>
      {/*Privacy Policy Info */}
      <h4 className="font-semibold text-[20px] mt-4">Privacy Policy</h4>
      <hr className="mt-2 mb-4" />
      <ReactQuill
        theme="snow"
        value={privacy_policy}
        onChange={setPrivacyPolicy}
        style={{
          width: "1150px",
          maxWidth: "100%", // Prevents overflow issues on smaller screens
        }}
      />
      <div className="mt-2 flex items-center justify-end">
        {privacyPolicyLoading == true ? (
          <div className="px-10 py-2 flex items-center justify-center  bg-primaryColor text-white rounded">
            <MiniSpinner />
          </div>
        ) : (
          <button
            className="px-10 py-2  bg-primaryColor hover:bg-blue-500 duration-200 text-white rounded"
            type="submit"
            onClick={() => handlePrivacyPolicyPost()}
          >
            Submit
          </button>
        )}
      </div>
      {/*Refund Policy Policy Info */}
      <h4 className="font-semibold text-[20px] mt-4">Refund Policy</h4>
      <hr className="mt-2 mb-4" />
      <ReactQuill
        theme="snow"
        value={refund_policy}
        onChange={setRefundPolicy}
        style={{
          width: "1150px",
          maxWidth: "100%", // Prevents overflow issues on smaller screens
        }}
      />
      <div className="mt-2 flex items-center justify-end">
        {refundPolicyLoading == true ? (
          <div className="px-10 py-2 flex items-center justify-center  bg-primaryColor text-white rounded">
            <MiniSpinner />
          </div>
        ) : (
          <button
            className="px-10 py-2  bg-primaryColor hover:bg-blue-500 duration-200 text-white rounded"
            type="submit"
            onClick={() => handleRefundPolicyPost()}
          >
            Submit
          </button>
        )}
      </div>
      {/*Cancellation Policy Policy Info */}
      <h4 className="font-semibold text-[20px] mt-4">Cancellation Policy</h4>
      <hr className="mt-2 mb-4" />
      <ReactQuill
        theme="snow"
        value={cancellation_policy}
        onChange={setCancellationPolicy}
        style={{
          width: "1150px",
          maxWidth: "100%", // Prevents overflow issues on smaller screens
        }}
      />
      <div className="mt-2 flex items-center justify-end">
        {cancelPolicyLoading == true ? (
          <div className="px-10 py-2 flex items-center justify-center  bg-primaryColor text-white rounded">
            <MiniSpinner />
          </div>
        ) : (
          <button
            className="px-10 py-2  bg-primaryColor hover:bg-blue-500 duration-200 text-white rounded"
            type="submit"
            onClick={() => handleCancellationPolicyPost()}
          >
            Submit
          </button>
        )}
      </div>
      {/* terms_condition Policy Policy Info */}
      <h4 className="font-semibold text-[20px] mt-4">Terms And Condition</h4>
      <hr className="mt-2 mb-4" />
      <ReactQuill
        theme="snow"
        value={terms_condition}
        onChange={setTermsAndCondition}
        style={{
          width: "1150px",
          maxWidth: "100%", // Prevents overflow issues on smaller screens
        }}
      />
      <div className="mt-2 flex items-center justify-end">
        {termsPolicyLoading == true ? (
          <div className="px-10 py-2 flex items-center justify-center  bg-primaryColor text-white rounded">
            <MiniSpinner />
          </div>
        ) : (
          <button
            className="px-10 py-2  bg-primaryColor hover:bg-blue-500 duration-200 text-white rounded"
            type="submit"
            onClick={() => handleTermsAndConditionPost()}
          >
            Submit
          </button>
        )}
      </div>

      {/* shipping_info Policy Policy Info */}
      <h4 className="font-semibold text-[20px] mt-4">Shipping Information</h4>
      <hr className="mt-2 mb-4" />
      <ReactQuill
        theme="snow"
        value={shipping_info}
        onChange={setShippingInfo}
        style={{
          width: "1150px",
          maxWidth: "100%", // Prevents overflow issues on smaller screens
        }}
      />
      <div className="mt-2 flex items-center justify-end">
        {shippingPolicyLoading == true ? (
          <div className="px-10 py-2 flex items-center justify-center  bg-primaryColor text-white rounded">
            <MiniSpinner />
          </div>
        ) : (
          <button
            className="px-10 py-2  bg-primaryColor hover:bg-blue-500 duration-200 text-white rounded"
            type="submit"
            onClick={() => handleShippingPost()}
          >
            Submit
          </button>
        )}
      </div>
    </div>
  );
};

export default AboutUs;
