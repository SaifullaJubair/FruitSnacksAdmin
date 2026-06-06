import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { BASE_URL } from "../../utils/baseURL";
import MiniSpinner from "../../shared/MiniSpinner/MiniSpinner";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import "react-phone-number-input/style.css";
import PhoneInput, {
  formatPhoneNumber,
  isPossiblePhoneNumber,
  isValidPhoneNumber,
} from "react-phone-number-input";

// H — admin self password-reset UI. Backend endpoints
// /admin_reg_log/forgot-password + /admin_reg_log/reset-password have existed
// since Phase D but the admin had no way to call them — locked-out admins
// previously needed another admin to reset their password.
//
// 2-step flow: phone → OTP arrives → enter OTP + new password → /sign-in.
const ForgetPasswordPage = () => {
  const [step, setStep] = useState(1); // 1 = send OTP, 2 = verify + new password
  const [loading, setLoading] = useState(false);
  const [admin_phone, setAdminPhone] = useState();
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const validatePhone = () => {
    if (!admin_phone) {
      toast.error("Phone is required!", { autoClose: 2000 });
      return false;
    }
    if (
      !formatPhoneNumber(admin_phone) ||
      !isPossiblePhoneNumber(admin_phone) ||
      !isValidPhoneNumber(admin_phone)
    ) {
      toast.error("Mobile number not valid!", { autoClose: 2000 });
      return false;
    }
    return true;
  };

  const handleSendOTP = async () => {
    if (!validatePhone()) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/admin_reg_log/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ admin_phone }),
      });
      const result = await res.json();
      if (result?.statusCode === 200 && result?.success === true) {
        toast.success(result?.message || "OTP sent to your phone", {
          autoClose: 1500,
        });
        setStep(2);
      } else {
        toast.error(result?.message || "Something went wrong", {
          autoClose: 2000,
        });
      }
    } catch (e) {
      toast.error("Network error or server is down", { autoClose: 2000 });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (data) => {
    if (!validatePhone()) return;
    if (!data?.admin_otp) {
      toast.error("OTP is required!", { autoClose: 2000 });
      return;
    }
    if (!data?.admin_password || data.admin_password.length < 6) {
      toast.error("Password must be at least 6 characters", { autoClose: 2000 });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/admin_reg_log/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          admin_phone,
          admin_otp: data?.admin_otp,
          admin_password: data?.admin_password,
        }),
      });
      const result = await res.json();
      if (result?.statusCode === 200 && result?.success === true) {
        toast.success(result?.message || "Password reset successfully", {
          autoClose: 1500,
        });
        reset();
        navigate("/sign-in", { replace: true });
      } else {
        toast.error(result?.message || "Something went wrong", {
          autoClose: 2000,
        });
      }
    } catch (e) {
      toast.error("Network error or server is down", { autoClose: 2000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center md:min-h-screen py-7">
      <div className="w-full mx-3 md:w-[420px] px-3 md:px-10 pt-5 pb-14 border rounded bg-slate-100 shadow-md">
        <h2 className="text-2xl text-center text-gray-900 my-4 font-bold border-b pb-2">
          Forgot Password
        </h2>
        <p className="text-xs text-gray-500 mb-4 text-center">
          {step === 1
            ? "Enter your admin phone — we'll send you an OTP."
            : "Enter the OTP and a new password."}
        </p>

        {step === 1 ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendOTP();
            }}
            className="space-y-4"
          >
            <div className="form-control w-full border border-slate-300 py-4 px-2 rounded-md">
              <label htmlFor="admin_phone">Phone</label>
              <PhoneInput
                className="mt-2 w-full rounded-md border-white-light bg-white px-2 py-2 text-black ps-4 placeholder:text-white-dark text-xl custom-input"
                placeholder="Enter phone number"
                id="admin_phone"
                value={admin_phone}
                defaultCountry="BD"
                international
                countryCallingCodeEditable={false}
                onChange={setAdminPhone}
              />
            </div>
            <button
              className="px-10 py-2 text-textColor bg-primaryColor w-full opacity-100 hover:opacity-80 transition-opacity duration-200 ease-in-out rounded-full"
              type="submit"
              disabled={loading}
            >
              {loading ? <MiniSpinner /> : "Send OTP"}
            </button>
            <p className="text-center text-sm">
              Remembered your password?{" "}
              <button
                type="button"
                className="text-primaryColor underline"
                onClick={() => navigate("/sign-in")}
              >
                Sign in
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleSubmit(handleResetPassword)} className="space-y-4">
            <div className="form-control w-full border border-slate-300 py-4 px-2 rounded-md space-y-3">
              <div>
                <label className="block text-xs text-gray-600">
                  Phone (locked)
                </label>
                <input
                  type="text"
                  value={admin_phone || ""}
                  readOnly
                  className="mt-1 w-full rounded-md border-gray-200 shadow-sm sm:text-sm p-2 border-2 bg-gray-50"
                />
              </div>
              <div>
                <label htmlFor="admin_otp" className="block text-xs text-gray-600">
                  OTP <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("admin_otp", { required: "OTP is required" })}
                  id="admin_otp"
                  type="text"
                  inputMode="numeric"
                  placeholder="6-digit OTP"
                  maxLength={6}
                  className="mt-1 w-full rounded-md border-gray-200 shadow-sm sm:text-sm p-2 border-2 tracking-widest text-center text-lg"
                />
                {errors.admin_otp && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.admin_otp?.message}
                  </p>
                )}
              </div>
              <div className="relative">
                <label
                  htmlFor="admin_password"
                  className="block text-xs text-gray-600"
                >
                  New Password <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("admin_password", {
                    required: "New password is required",
                    minLength: { value: 6, message: "At least 6 characters" },
                  })}
                  id="admin_password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  className="mt-1 w-full rounded-md border-gray-200 shadow-sm sm:text-sm p-2 border-2"
                />
                <div
                  className="absolute top-[34px] right-3 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaRegEye size={20} />
                  ) : (
                    <FaRegEyeSlash size={20} />
                  )}
                </div>
                {errors.admin_password && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.admin_password?.message}
                  </p>
                )}
              </div>
            </div>
            <button
              className="px-10 py-2 text-textColor bg-primaryColor w-full opacity-100 hover:opacity-80 transition-opacity duration-200 ease-in-out rounded-full"
              type="submit"
              disabled={loading}
            >
              {loading ? <MiniSpinner /> : "Reset Password"}
            </button>
            <div className="flex justify-between text-sm">
              <button
                type="button"
                className="text-gray-600 underline"
                onClick={() => {
                  setStep(1);
                  reset();
                }}
              >
                ← Change phone
              </button>
              <button
                type="button"
                className="text-primaryColor underline"
                onClick={handleSendOTP}
                disabled={loading}
              >
                Resend OTP
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgetPasswordPage;
