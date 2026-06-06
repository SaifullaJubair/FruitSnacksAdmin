import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

import { BASE_URL } from "../../utils/baseURL";
import { LoaderOverlay } from "../common/loader/LoderOverley";
import Policies from "./SiteSetting/Policies";
import SoftwareInformation from "./SiteSetting/SoftwareInformation";
import PhoneCredential from "./PhoneCredential";
import CurrencySymbol from "./CurrencySymbol";
import ShippingConFiguration from "./ShippingConFiguration";
import AnalyticsSettings from "./AnalyticsSettings";
import AnnouncementBarSettings from "./AnnouncementBarSettings";
import OfferBannerSettings from "./OfferBannerSettings";
import PaymentMethodsSettings from "./PaymentMethodsSettings";
import VatSettings from "./VatSettings";
import LoyaltySettings from "./LoyaltySettings";
import SmsSettings from "./SmsSettings";
import EmailSettings from "./EmailSettings";
import StorefrontBehaviourTab from "./StorefrontBehaviourTab";
import HomeLayoutTab from "./HomeLayoutTab";

const SettingS = () => {
  const { tab } = useParams();
  const navigate = useNavigate();

  const {
    data: getInitialAuthenticationData,
    isLoading: authLoading,
    refetch: authRefetch,
  } = useQuery({
    queryKey: ["authentication"],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/authentication`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Authentication fetch failed");
      return res.json();
    },
  });

  const {
    data: getInitialCurrencyData,
    isLoading: currencyLoading,
    refetch: currencyRefetch,
  } = useQuery({
    queryKey: ["setting"],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/setting`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Settings fetch failed");
      return res.json();
    },
  });

  if (authLoading || currencyLoading) return <LoaderOverlay />;

  const renderContent = () => {
    switch (tab) {
      case "site-setting":
        return (
          <SoftwareInformation
            refetch={currencyRefetch}
            getInitialCurrencyData={getInitialCurrencyData?.data[0]}
          />
        );
      case "phone-credential":
        return (
          <PhoneCredential
            refetch={authRefetch}
            initialAuthenticationData={getInitialAuthenticationData?.data[0]}
          />
        );
      case "currency":
        return (
          <CurrencySymbol
            refetch={currencyRefetch}
            getInitialCurrencyData={getInitialCurrencyData?.data[0]}
          />
        );
      case "shipping":
        return (
          <ShippingConFiguration
            refetch={currencyRefetch}
            getInitialCurrencyData={getInitialCurrencyData?.data[0]}
          />
        );

      // ✅ Phase C — payment methods (cod / manual MFS / bank / SSLCommerz / advance)
      case "payment-methods":
        return (
          <PaymentMethodsSettings
            refetch={currencyRefetch}
            getInitialCurrencyData={getInitialCurrencyData?.data[0]}
          />
        );

      // ✅ Phase H — site-wide VAT
      case "vat":
        return (
          <VatSettings
            refetch={currencyRefetch}
            getInitialCurrencyData={getInitialCurrencyData?.data[0]}
          />
        );

      // ✅ Phase G3 — loyalty points config
      case "loyalty":
        return (
          <LoyaltySettings
            refetch={currencyRefetch}
            getInitialCurrencyData={getInitialCurrencyData?.data[0]}
          />
        );

      // ✅ Phase G5 — SMS provider creds from settings
      case "sms":
        return (
          <SmsSettings
            refetch={currencyRefetch}
            getInitialCurrencyData={getInitialCurrencyData?.data[0]}
          />
        );

      // H-B — Email provider (SMTP for admin OTP emails)
      case "email":
        return (
          <EmailSettings
            refetch={currencyRefetch}
            getInitialCurrencyData={getInitialCurrencyData?.data[0]}
          />
        );

      // ✅ নতুন analytics tab
      case "analytics":
        return (
          <AnalyticsSettings
            refetch={currencyRefetch}
            getInitialCurrencyData={getInitialCurrencyData?.data[0]}
          />
        );

      case "announcement-bar":
        return (
          <AnnouncementBarSettings
            refetch={currencyRefetch}
            getInitialCurrencyData={getInitialCurrencyData?.data[0]}
          />
        );

      case "offer-banner":
        return (
          <OfferBannerSettings
            refetch={currencyRefetch}
            getInitialCurrencyData={getInitialCurrencyData?.data[0]}
          />
        );

      // ✅ C13 — Storefront behaviour toggles (13 fields)
      case "storefront-behaviour":
        return (
          <StorefrontBehaviourTab
            refetch={currencyRefetch}
            getInitialCurrencyData={getInitialCurrencyData?.data[0]}
          />
        );

      // Track D — Home Layout Builder
      case "home-layout":
        return (
          <HomeLayoutTab
            refetch={currencyRefetch}
            getInitialCurrencyData={getInitialCurrencyData?.data[0]}
          />
        );

      case "policies":
        return (
          <Policies
            refetch={currencyRefetch}
            getInitialCurrencyData={getInitialCurrencyData?.data[0]}
          />
        );
      default:
        navigate("/settings/site-setting");
        return null;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
        className="p-6"
      >
        {renderContent()}
      </motion.div>
    </AnimatePresence>
  );
};

export default SettingS;
