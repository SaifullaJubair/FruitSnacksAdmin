import { createBrowserRouter } from "react-router-dom";
import DashboardLayout from "../layout/DashboardLayout";
import NotFound from "../shared/NotFound/NotFound";
import CategoryPage from "../pages/CategoryPage/CategoryPage";
import SubcategoryPage from "../pages/SubCategoryPage/SubcategoryPage";
import ChildCategoryPage from "../pages/ChildCategoryPage/ChildCategoryPage";
import BrandPage from "../pages/BrandPage/BrandPage";
import SpecificationPage from "../pages/SpecificationPage/SpecificationPage";
import AttributePage from "../pages/AttributePage/AttributePage";
import AllStaffPage from "../pages/StaffAndRolePage/AllStaffPage/AllStaffPage";
import StaffRoleTablePage from "../pages/StaffAndRolePage/StaffRoleTablePage/StaffRoleTablePage";
import ReviewPage from "../pages/ReviewPage/ReviewPage";
import CampaignListPage from "../pages/CampaignPage/CampaignListPage/CampaignListPage";
import AddStaffRolePage from "../pages/StaffAndRolePage/AddStaffRolePage/AddStaffRolePage";
import AddProductPage from "../pages/ProductPage/AddProductPage/AddProductPage";
import ProductListTablePage from "../pages/ProductPage/ProductListTablePage/ProductListTablePage";
import AddCampaignPage from "../pages/CampaignPage/AddCampaignPage/AddCampaignPage";
import SignInPage from "../pages/SignInPage/SignInPage";

import ProductUpdatePage from "../pages/ProductPage/ProductUpdatePage/ProductUpdatePage";
import SupplierPage from "../pages/Supplier/SupplierPage";

import YourCoupon from "../pages/CouponPage/YourCouponPage.jsx/YourCoupon";

import BannerPage from "../pages/Banner/BannerPage";
import SliderPage from "../pages/SliderPage/SliderPage";
import SettingPage from "../pages/SettingPage/SettingPage";

import PrivateRoute from "./privateRoute/PrivateRoute";

import AddCoupon from "../components/Coupon/AddCoupon";
import OrderPage from "../pages/OrderPage/OrderPage";
import ViewAllOrderInfo from "../components/Order/ViewAllOrderInfo";

import OfferTablePage from "../pages/OfferPage/OfferTablePage/OfferTablePage";

import AddOfferPage from "../pages/OfferPage/AddOfferPage/AddOfferPage";
import QuestionPage from "../pages/QuestionPage/QuestionPage";

import OfferOrderListPage from "../pages/OfferOrderListPage/OfferOrderListPage";
import CustomerPage from "../pages/AllCustomerPage/CustomerPage";
import DashBoard from "../pages/DashBoardPage/DashBoard";
import ProfilePage from "../pages/MyProfilePage/ProfilePage";
import PathaoOrderPage from "../pages/PathaoOrderPage/PathaoOrderPage";
import CancelOrderPage from "../pages/CancelOrderPage/CancelOrderPage";
import ReturnOrderPage from "../pages/ReturnOrderPage/ReturnOrderPage";
import DeliveryOrderPage from "../pages/DeliveryOrderPage/DeliveryOrderPage";
import SingleViewOfferOrder from "../components/OfferOrderList/SingleViewOfferOrder";

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
      {
        path: "/cancel-order",
        element: <CancelOrderPage />,
      },
      {
        path: "/return-order",
        element: <ReturnOrderPage />,
      },
      {
        path: "/delivery-order",
        element: <DeliveryOrderPage />,
      },

      {
        path: "/all-order-info/:id",
        element: <ViewAllOrderInfo />,
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
