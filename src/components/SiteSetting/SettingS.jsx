import { useEffect, useState } from "react";
import CurrencySymbol from "./CurrencySymbol";
import { useQuery } from "@tanstack/react-query";
import { BASE_URL } from "./../../utils/baseURL";
import { LoaderOverlay } from "../common/loader/LoderOverley";

import PhoneCredential from "./PhoneCredential";
import ShippingConFiguration from "./ShippingConFiguration";
import AllSiteSetting from "./SiteSetting/AllSiteSetting";

const SettingS = () => {
  const [activeNavButton, setActiveNavButton] = useState("SiteSetting");

  const handleNavButtonClick = (buttonName) => {
    setActiveNavButton(buttonName);
    sessionStorage.setItem("activeTab", buttonName);
  };
  useEffect(() => {
    // Retrieve active dropdown from localStorage when the component mounts
    const saveDropDown = sessionStorage.getItem("activeTab");
    if (saveDropDown) {
      setActiveNavButton(saveDropDown);
    }
  }, []);

  //data fetching of Authentication by Tans Tack Query
  const {
    data: getInitialAuthenticationData,
    isLoading: authLoading,
    refetch,
  } = useQuery({
    queryKey: [`/api/v1/authentication`],
    queryFn: async () => {
      try {
        const res = await fetch(`${BASE_URL}/authentication`, {
          credentials: "include",
        });

        if (!res.ok) {
          const errorData = await res.text(); // Get more info about the error
          throw new Error(
            `Error: ${res.status} ${res.statusText} - ${errorData}`
          );
        }

        const data = await res.json();
        return data;
      } catch (error) {
        console.error("Fetch error:", error);
        throw error; // Rethrow to propagate the error to react-query
      }
    },
  });

  //data fetching of Currency by Tans Tack Query
  const {
    data: getInitialCurrencyData,
    isLoading: currencyLoading,
    refetch: currencyRefetch,
  } = useQuery({
    queryKey: [`/api/v1/setting`],
    queryFn: async () => {
      try {
        const res = await fetch(`${BASE_URL}/setting`, {
          credentials: "include",
        });

        if (!res.ok) {
          const errorData = await res.text(); // Get more info about the error
          throw new Error(
            `Error: ${res.status} ${res.statusText} - ${errorData}`
          );
        }

        const data = await res.json();
        return data;
      } catch (error) {
        console.error("Fetch error:", error);
        throw error; // Rethrow to propagate the error to react-query
      }
    },
  });

  if (authLoading || currencyLoading) {
    return <LoaderOverlay />;
  }

  return (
    <div>
      <div className="flex flex-wrap  gap-4 mt-8">
        <button
          className={`bg-primaryColor hover:bg-blue-500 duration-200  text-white p-2 font-medium   text-sm sm:text-base ${
            activeNavButton == "SiteSetting" &&
            "border-t-[4px]  border-blue-900"
          }`}
          onClick={() => handleNavButtonClick("SiteSetting")}
        >
          Site Setting
        </button>

        <button
          className={`bg-primaryColor hover:bg-blue-500 duration-200  text-white p-2 font-medium   text-sm sm:text-base  ${
            activeNavButton == "phoneCredential" &&
            "border-t-[4px]  border-blue-900"
          }`}
          onClick={() => handleNavButtonClick("phoneCredential")}
        >
          OTP By Phone Credential
        </button>
        <button
          className={`bg-primaryColor hover:bg-blue-500 duration-200  text-white p-2 font-medium   text-sm sm:text-base  ${
            activeNavButton == "Currency Configuration" &&
            "border-t-[4px]  border-blue-900"
          }`}
          onClick={() => handleNavButtonClick("Currency Configuration")}
        >
          Currency Symbol
        </button>
        <button
          className={`bg-primaryColor hover:bg-blue-500 duration-200  text-white p-2 font-medium   text-sm sm:text-base  ${
            activeNavButton == "ShippingConfiguration" &&
            "border-t-[4px]  border-blue-900"
          }`}
          onClick={() => handleNavButtonClick("ShippingConfiguration")}
        >
          Shipping Configuration
        </button>
      </div>

      <div className="mt-6 min-w-[1150px]">
        {activeNavButton == "Currency Configuration" && (
          <CurrencySymbol
            refetch={currencyRefetch}
            getInitialCurrencyData={getInitialCurrencyData?.data[0]}
          />
        )}

        {activeNavButton == "phoneCredential" && (
          <PhoneCredential
            refetch={refetch}
            initialAuthenticationData={getInitialAuthenticationData?.data[0]}
          />
        )}
        {activeNavButton == "ShippingConfiguration" && (
          <ShippingConFiguration
            refetch={currencyRefetch}
            getInitialCurrencyData={getInitialCurrencyData?.data[0]}
          />
        )}
        {activeNavButton == "SiteSetting" && (
          <AllSiteSetting
            refetch={currencyRefetch}
            getInitialCurrencyData={getInitialCurrencyData?.data[0]}
          />
        )}
      </div>
    </div>
  );
};

export default SettingS;
