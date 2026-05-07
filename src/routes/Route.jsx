import { createBrowserRouter } from "react-router-dom";
import DashboardLayout from "../layout/DashboardLayout";
import AttributePage from "../pages/AttributePage/AttributePage";
import BrandPage from "../pages/BrandPage/BrandPage";
import AddCampaignPage from "../pages/CampaignPage/AddCampaignPage/AddCampaignPage";
import CampaignListPage from "../pages/CampaignPage/CampaignListPage/CampaignListPage";
import CategoryPage from "../pages/CategoryPage/CategoryPage";
import ChildCategoryPage from "../pages/ChildCategoryPage/ChildCategoryPage";
import AddProductPage from "../pages/ProductPage/AddProductPage/AddProductPage";
import ProductListTablePage from "../pages/ProductPage/ProductListTablePage/ProductListTablePage";
import ReviewPage from "../pages/ReviewPage/ReviewPage";
import SignInPage from "../pages/SignInPage/SignInPage";
import SpecificationPage from "../pages/SpecificationPage/SpecificationPage";
import AddStaffRolePage from "../pages/StaffAndRolePage/AddStaffRolePage/AddStaffRolePage";
import AllStaffPage from "../pages/StaffAndRolePage/AllStaffPage/AllStaffPage";
import StaffRoleTablePage from "../pages/StaffAndRolePage/StaffRoleTablePage/StaffRoleTablePage";
import SubcategoryPage from "../pages/SubCategoryPage/SubcategoryPage";
import NotFound from "../shared/NotFound/NotFound";

import ProductUpdatePage from "../pages/ProductPage/ProductUpdatePage/ProductUpdatePage";
import SupplierPage from "../pages/Supplier/SupplierPage";

import YourCoupon from "../pages/CouponPage/YourCouponPage.jsx/YourCoupon";

import BannerPage from "../pages/Banner/BannerPage";
import SettingPage from "../pages/SettingPage/SettingPage";
import SliderPage from "../pages/SliderPage/SliderPage";

import PrivateRoute from "./privateRoute/PrivateRoute";

import AddCoupon from "../components/Coupon/AddCoupon";
import ViewAllOrderInfo from "../components/Order/ViewAllOrderInfo";
import OrderPage from "../pages/OrderPage/OrderPage";

import OfferTablePage from "../pages/OfferPage/OfferTablePage/OfferTablePage";

import AddOfferPage from "../pages/OfferPage/AddOfferPage/AddOfferPage";
import QuestionPage from "../pages/QuestionPage/QuestionPage";

import SingleViewOfferOrder from "../components/OfferOrderList/SingleViewOfferOrder";
import CustomerPage from "../pages/AllCustomerPage/CustomerPage";
import DashBoard from "../pages/DashBoardPage/DashBoard";
import FraudCheckPage from "../pages/Fraudcheckpage/Fraudcheckpage";
import ProfilePage from "../pages/MyProfilePage/ProfilePage";
import OfferOrderListPage from "../pages/OfferOrderListPage/OfferOrderListPage";
import PageSeoPage from "../pages/pageSeoPage/PageSeoPage";
import PathaoOrderPage from "../pages/PathaoOrderPage/PathaoOrderPage";
import SteadfastOrderPage from "../pages/SteadfastOrderPage/SteadfastOrderPage";
import ThemeListPage from "../pages/ThemePage/ThemeListPage";
import ThemeAddPage from "../pages/ThemePage/ThemeAddPage";
import ThemeUpdatePage from "../pages/ThemePage/ThemeUpdatePage";
import ThemePreviewPage from "../pages/ThemePage/ThemePreviewPage";
import FaqTemplateListPage from "../pages/FaqTemplatePage/FaqTemplateListPage";
import ProductPageContentEditPage from "../pages/ProductPage/ProductPageContentEditPage/ProductPageContentEditPage";

const route = createBrowserRouter([
  {
    path: "/",
    element: (
      <PrivateRoute>
        <DashboardLayout />
      </PrivateRoute>
    ),
    errorElement: <NotFound />,
    children: [
      {
        path: "/",
        element: <DashBoard />,
      },
      // ------Task Start------
      {
        path: "/category",
        element: <CategoryPage />,
      },
      {
        path: "/sub-category",
        element: <SubcategoryPage />,
      },
      {
        path: "/child-category",
        element: <ChildCategoryPage />,
      },
      {
        path: "/brand-category",
        element: <BrandPage />,
      },
      {
        path: "/specification-list",
        element: <SpecificationPage />,
      },
      {
        path: "/attribute",
        element: <AttributePage />,
      },

      // ------Task End------
      // ------Product Start------
      {
        path: "/product/product-create",
        element: <AddProductPage />,
      },
      {
        path: "/product/product-update/:id",
        element: <ProductUpdatePage />,
      },
      {
        path: "/product/product-list",
        element: <ProductListTablePage />,
      },

      // ------Product End-------
      // ------ Offer ----
      {
        path: "/offer-list",
        element: <OfferTablePage />,
      },

      {
        path: "/add-offer",
        element: <AddOfferPage />,
      },
      // ------ Offer End ----
      // ------ Campaign Start----
      {
        path: "/add-campaign",
        element: <AddCampaignPage />,
      },

      {
        path: "/campaign-list",
        element: <CampaignListPage />,
      },
      // ------ Campaign End ----
      // ------Staff And Role----
      {
        path: "/all-staff",
        element: <AllStaffPage />,
      },
      {
        path: "/staff-role",
        element: <StaffRoleTablePage />,
      },
      {
        path: "/create-staff-role",
        element: <AddStaffRolePage />,
      },

      // ------Staff And Role End----
      {
        path: "/review",
        element: <ReviewPage />,
      },
      //question.....
      {
        path: "/question",
        element: <QuestionPage />,
      },

      //------Coupon start-----//

      {
        path: "/your-coupon",
        element: <YourCoupon />,
      },
      {
        path: "/add-coupon",
        element: <AddCoupon />,
      },
      //------Coupon End-----//

      //----sell start----//

      {
        path: "/supplier",
        element: <SupplierPage />,
      },

      //....Banner Page Start....//
      {
        path: "/banner",
        element: <BannerPage />,
      },
      //....Slider Page Start....//
      {
        path: "/slider",
        element: <SliderPage />,
      },
      //....Site Settings Page....//
      {
        path: "/settings",
        element: <SettingPage />,
      },
      {
        path: "/settings/:tab",
        element: <SettingPage />,
      },
      //....Site Settings Page....//
      {
        path: "/page-seo",
        element: <PageSeoPage />,
      },
      // ......Offer-order list.......//
      {
        path: "/offer-order-list",
        element: <OfferOrderListPage />,
      },
      {
        path: "/all-offerOrder-info/:id",
        element: <SingleViewOfferOrder />,
      },

      // ......Order.......//
      {
        path: "/order",
        element: <OrderPage />,
      },
      {
        path: "/pathao-order",
        element: <PathaoOrderPage />,
      },
      // {
      //   path: "/cancel-order",
      //   element: <CancelOrderPage />,
      // },
      // {
      //   path: "/return-order",
      //   element: <ReturnOrderPage />,
      // },
      // {
      //   path: "/delivery-order",
      //   element: <DeliveryOrderPage />,
      // },
      // {
      //   path: "/processing-order",
      //   element: <StadefastProcessingOrderPage />,
      // },
      {
        path: "/steadfast-order",
        element: <SteadfastOrderPage />,
      },
      {
        path: "/fraud-check",
        element: <FraudCheckPage />,
      },
      {
        path: "/all-order-info/:id",
        element: <ViewAllOrderInfo />,
      },

      // ......Themes.......//
      {
        path: "/theme",
        element: <ThemeListPage />,
      },
      {
        path: "/theme/create",
        element: <ThemeAddPage />,
      },
      {
        path: "/theme/update/:id",
        element: <ThemeUpdatePage />,
      },
      {
        path: "/theme/preview/:id",
        element: <ThemePreviewPage />,
      },

      // ......FAQ Templates.......//
      {
        path: "/faq-template",
        element: <FaqTemplateListPage />,
      },

      // ......Product Page Content.......//
      {
        path: "/product/page-content/:id",
        element: <ProductPageContentEditPage />,
      },

      // ......Customers.......//
      {
        path: "/customer",
        element: <CustomerPage />,
      },
      // ......Customers.......//
      {
        path: "/admin/my-profile",
        element: <ProfilePage />,
      },
    ],
  },
  {
    path: "/sign-in",
    element: <SignInPage />,
  },
]);

export default route;
