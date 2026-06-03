import { useContext, useEffect, useState } from "react";
import { logo } from "../../utils/imageImport";
import { Link, useLocation } from "react-router-dom";
import {
  MdOutlineAddchart,
  MdOutlineCampaign,
  MdOutlineLocalOffer,
  MdOutlineReviews,
} from "react-icons/md";
import { BiTask } from "react-icons/bi";
import { GoHome } from "react-icons/go";
import { GrAnnounce } from "react-icons/gr";
import { BsShieldPlus } from "react-icons/bs";
import { PiFlagBannerFill, PiUsersThree } from "react-icons/pi";
import { TbCategoryPlus } from "react-icons/tb";

import { FiUsers } from "react-icons/fi";
import { ChildMenuItem, DropdownMenu, MenuItem } from "./DropdownAndMenuItem";
import { IoSettings } from "react-icons/io5";

import { RiCoupon3Line, RiShieldCheckLine } from "react-icons/ri";
import { FaBorderAll, FaQuestion, FaHandshake, FaWarehouse, FaHeart, FaGift, FaWallet } from "react-icons/fa";
import { FaUsers } from "react-icons/fa6";
import { MdFlashOn } from "react-icons/md";
import { FiAlertTriangle, FiShoppingCart } from "react-icons/fi";

import { TfiLayoutSliderAlt } from "react-icons/tfi";
import { IoColorPaletteOutline } from "react-icons/io5";
import { SettingContext } from "../../context/SettingProvider";
import { LoaderOverlay } from "../../components/common/loader/LoderOverley";
import { AuthContext } from "../../context/AuthProvider";

const SideNavBar = () => {
  const { settingData, loading: settingLoading } = useContext(SettingContext);
  const { user, loading } = useContext(AuthContext);
  const { pathname } = useLocation();
  const [activeDropdown, setActiveDropdown] = useState(null); // Centralized state to track open dropdown

  useEffect(() => {
    // Retrieve active dropdown from localStorage when the component mounts
    const saveDropDown = localStorage.getItem("activeDropdown");
    if (saveDropDown) {
      setActiveDropdown(saveDropDown);
    }
  }, []);

  // Toggle dropdowns, collapse others when one is opened
  const toggleDropdown = (dropdown) => {
    const newActiveDropdown = activeDropdown === dropdown ? null : dropdown;
    setActiveDropdown(newActiveDropdown);

    localStorage.setItem("activeDropdown", newActiveDropdown);
  };

  // Collapse all dropdowns when a menu item is clicked
  const closeAllDropdowns = () => {
    setActiveDropdown(null);
    localStorage.removeItem("activeDropdown");
  };
  const isActive = (route) =>
    pathname === route
      ? "bg-blueColor-600 text-white font-semibold border-blueColor-100 "
      : "";

  if (settingLoading || loading) {
    return <LoaderOverlay />;
  }

  console.log(user?.role_id, "page seo show");

  return (
    <div className="flex flex-col min-h-screen bg-blueColor-800 text-gray-50">
      <div className="flex-grow">
        {/* Logo */}
        <div className="flex items-center justify-center border-b border-blueColor-600 mt-1 pb-3">
          <Link to="/">
            <img src={settingData?.logo} alt="Logo" width={70} height={70} />
          </Link>
        </div>
        {/* Menu */}
        <ul className="flex flex-col pb-4 space-y-[2px]">
          <MenuItem
            to="/"
            icon={GoHome}
            label="Dashboard"
            isActive={isActive("/")}
            onClick={closeAllDropdowns} // Close all dropdowns when clicked
          />
          {(user?.role_id?.category_show === true ||
            user?.role_id?.brand_show === true ||
            user?.role_id?.attribute_show === true) && (
            <DropdownMenu
              label="Task"
              icon={BiTask}
              isOpen={activeDropdown === "task"}
              onClick={() => toggleDropdown("task")}
            >
              {/* Category is now a nested tree — Sub/Child Category pages retired. */}
              {user?.role_id?.category_show === true && (
                <ChildMenuItem
                  to="/category"
                  icon={TbCategoryPlus}
                  label="Category"
                  isActive={isActive("/category")}
                />
              )}

              {user?.role_id?.brand_show === true && (
                <ChildMenuItem
                  to="/brand-category"
                  icon={TbCategoryPlus}
                  label="Brand Category"
                  isActive={isActive("/brand-category")}
                />
              )}

              {user?.role_id?.attribute_show === true && (
                <ChildMenuItem
                  to="/attribute"
                  icon={TbCategoryPlus}
                  label="Attribute"
                  isActive={isActive("/attribute")}
                />
              )}
            </DropdownMenu>
          )}
          {user?.role_id?.product_show === true && (
            <DropdownMenu
              label="Products"
              icon={BiTask}
              isOpen={activeDropdown === "products"}
              onClick={() => toggleDropdown("products")}
            >
              {user?.role_id?.product_show === true && (
                <ChildMenuItem
                  to="/product/product-list"
                  icon={TbCategoryPlus}
                  label="Product List"
                  isActive={isActive("/product/product-list")}
                />
              )}
              {user?.role_id?.product_create === true && (
                <ChildMenuItem
                  to="/product/product-create"
                  icon={TbCategoryPlus}
                  label="Add Product"
                  isActive={isActive("/product/product-create")}
                />
              )}
              {/* A3b — Low-stock list (Phase B4). product_show flag. */}
              {user?.role_id?.product_show === true && (
                <ChildMenuItem
                  to="/low-stock"
                  icon={FiAlertTriangle}
                  label="Low Stock"
                  isActive={isActive("/low-stock")}
                />
              )}
            </DropdownMenu>
          )}
          {/* {user?.role_id?.offer_show === true && (
            <DropdownMenu
              label="Offer"
              icon={MdOutlineLocalOffer}
              isOpen={activeDropdown === "offer"}
              onClick={() => toggleDropdown("offer")}
            >
              {user?.role_id?.offer_show === true && (
                <ChildMenuItem
                  to="/offer-list"
                  icon={MdOutlineLocalOffer}
                  label="Total Offer"
                  isActive={isActive("/offer-list")}
                />
              )}
              {user?.role_id?.offer_create === true && (
                <ChildMenuItem
                  to="/add-offer"
                  icon={MdOutlineLocalOffer}
                  label="Add Offer"
                  isActive={isActive("/add-offer")}
                />
              )}
            </DropdownMenu>
          )} */}
          {/* {user?.role_id?.campaign_show === true && (
            <DropdownMenu
              label="Campaign"
              icon={MdOutlineCampaign}
              isOpen={activeDropdown === "campaign"}
              onClick={() => toggleDropdown("campaign")}
            >
              {user?.role_id?.campaign_show === true && (
                <ChildMenuItem
                  to="/campaign-list"
                  icon={GrAnnounce}
                  label="Campaign List"
                  isActive={isActive("/campaign-list")}
                />
              )}
              {user?.role_id?.offer_create === true && (
                <ChildMenuItem
                  to="/add-campaign"
                  icon={MdOutlineAddchart}
                  label="Add Campaign"
                  isActive={isActive("/add-campaign")}
                />
              )}
            </DropdownMenu>
          )} */}
          {(user?.role_id?.role_show === true ||
            user?.role_id?.user_show === true) && (
            <DropdownMenu
              label="Staff"
              icon={FiUsers}
              isOpen={activeDropdown === "staff"}
              onClick={() => toggleDropdown("staff")}
            >
              {user?.role_id?.user_show === true && (
                <ChildMenuItem
                  to="/all-staff"
                  icon={PiUsersThree}
                  label="All Staff"
                  isActive={isActive("/all-staff")}
                />
              )}
              {user?.role_id?.role_create === true && (
                <ChildMenuItem
                  to="/create-staff-role"
                  icon={BsShieldPlus}
                  label="Add Staff Role"
                  isActive={isActive("/create-staff-role")}
                />
              )}
              {user?.role_id?.role_show === true && (
                <ChildMenuItem
                  to="/staff-role"
                  icon={BsShieldPlus}
                  label="Staff Role"
                  isActive={isActive("/staff-role")}
                />
              )}
            </DropdownMenu>
          )}
          {/* <MenuItem
            to="/supplier"
            icon={FaUsers}
            label="Supplier"
            isActive={isActive("/supplier")}
            onCli
            ck={closeAllDropdowns} // Close all dropdowns when clicked
          /> */}
          {user?.role_id?.review_show === true && (
            <MenuItem
              to="/review"
              icon={MdOutlineReviews}
              label="Review"
              isActive={isActive("/review")}
              onClick={closeAllDropdowns} // Close all dropdowns when clicked
            />
          )}
          {/* {user?.role_id?.question_show === true && (
            <MenuItem
              to="/question"
              icon={FaQuestion}
              label="Question"
              isActive={isActive("/question")}
              onClick={closeAllDropdowns} // Close all dropdowns when clicked
            />
          )} */}
          {user?.role_id?.coupon_show === true && (
            <DropdownMenu
              label="Coupon"
              icon={BiTask}
              isOpen={activeDropdown === "coupons"}
              onClick={() => toggleDropdown("coupons")}
            >
              {user?.role_id?.coupon_show === true && (
                <ChildMenuItem
                  to="/your-coupon"
                  icon={RiCoupon3Line}
                  label="Your Coupon"
                  isActive={isActive("/your-coupon")}
                />
              )}
              {user?.role_id?.coupon_create === true && (
                <ChildMenuItem
                  to="/add-coupon"
                  icon={RiCoupon3Line}
                  label="Add Coupon"
                  isActive={isActive("/add-coupon")}
                />
              )}
            </DropdownMenu>
          )}
          {/* Flash Sale — Phase E. Gated by offer_show/_create/_update so a
              viewer role still sees the list. */}
          {(user?.role_id?.offer_show === true ||
            user?.role_id?.offer_create === true ||
            user?.role_id?.offer_update === true) && (
            <MenuItem
              to="/flash-sale"
              icon={MdFlashOn}
              label="Flash Sale"
              isActive={isActive("/flash-sale")}
              onClick={closeAllDropdowns}
            />
          )}
          {user?.role_id?.banner_show === true && (
            <MenuItem
              to="/banner"
              icon={PiFlagBannerFill}
              label="Banner"
              isActive={isActive("/banner")}
              onClick={closeAllDropdowns} // Close all dropdowns when clicked
            />
          )}
          {user?.role_id?.theme_show === true && (
            <MenuItem
              to="/theme"
              icon={IoColorPaletteOutline}
              label="Themes"
              isActive={isActive("/theme")}
              onClick={closeAllDropdowns}
            />
          )}
          {user?.role_id?.faq_template_show === true && (
            <MenuItem
              to="/faq-template"
              icon={FaQuestion}
              label="FAQ Templates"
              isActive={isActive("/faq-template")}
              onClick={closeAllDropdowns}
            />
          )}
          {/* Warehouse — Phase H. Gated by setting_show (matches BE). */}
          {user?.role_id?.setting_show === true && (
            <MenuItem
              to="/warehouse"
              icon={FaWarehouse}
              label="Warehouses"
              isActive={isActive("/warehouse")}
              onClick={closeAllDropdowns}
            />
          )}
          {user?.role_id?.trust_point_show === true && (
            <MenuItem
              to="/trust-point"
              icon={FaHandshake}
              label="Brand Promise"
              isActive={isActive("/trust-point")}
              onClick={closeAllDropdowns}
            />
          )}
          {/* {user?.role_id?.slider_show === true && (
            <MenuItem
              to="/slider"
              icon={TfiLayoutSliderAlt}
              label="Slider"
              isActive={isActive("/slider")}
              onClick={closeAllDropdowns} // Close all dropdowns when clicked
            />
          )} */}
          {user?.role_id?.site_setting_update === true && (
            <MenuItem
              to="/settings"
              icon={IoSettings}
              label="Setting"
              isActive={isActive("/settings")}
              onClick={closeAllDropdowns} // Close all dropdowns when clicked
            />
          )}
          {user?.role_id?.page_seo_show === true && (
            <MenuItem
              to="/page-seo"
              icon={IoSettings}
              label="Page Seo"
              isActive={isActive("/page-seo")}
              onClick={closeAllDropdowns} // Close all dropdowns when clicked
            />
          )}
          {/* ......Order....  */}
          {user?.role_id?.order_show === true && (
            <>
              <MenuItem
                to="/fraud-check"
                icon={RiShieldCheckLine}
                label="Fraud Check"
                isActive={isActive("/fraud-check")}
                onClick={closeAllDropdowns}
              />
              <MenuItem
                to="/order"
                icon={FaBorderAll}
                label="Order List"
                isActive={isActive("/order")}
                onClick={closeAllDropdowns}
              />
              <MenuItem
                to="/processing-order"
                icon={FaBorderAll}
                label="Processing Order"
                isActive={isActive("/processing-order")}
                onClick={closeAllDropdowns}
              />
              <MenuItem
                to="/steadfast-order"
                icon={FaBorderAll}
                label="SteadFast Order"
                isActive={isActive("/steadfast-order")}
                onClick={closeAllDropdowns}
              />
              <MenuItem
                to="/pathao-order"
                icon={FaBorderAll}
                label="Pathao Order List"
                isActive={isActive("/pathao-order")}
                onClick={closeAllDropdowns}
              />
              {/* A3b — Abandoned Cart (Phase G2). Same order_show flag. */}
              <MenuItem
                to="/abandoned-cart"
                icon={FiShoppingCart}
                label="Abandoned Carts"
                isActive={isActive("/abandoned-cart")}
                onClick={closeAllDropdowns}
              />
              {/* <MenuItem
                to="/delivery-order"
                icon={FaBorderAll}
                label="Delivery Order List"
                isActive={isActive("/delivery-order")}
                onClick={closeAllDropdowns}
              />
              <MenuItem
                to="/return-order"
                icon={FaBorderAll}
                label="Return Order List"
                isActive={isActive("/return-order")}
                onClick={closeAllDropdowns}
              />
              <MenuItem
                to="/cancel-order"
                icon={FaBorderAll}
                label="Cancel Order List"
                isActive={isActive("/cancel-order")}
                onClick={closeAllDropdowns}
              /> */}
            </>
          )}
          {/* {user?.role_id?.offer_order_show === true && (
            <MenuItem
              to="/offer-order-list"
              icon={FaBorderAll}
              label="Offer Order List"
              isActive={isActive("/offer-order-list")}
              onClick={closeAllDropdowns}
            />
          )} */}
          {/* ......All Customer....  */}
          {user?.role_id?.customer_show === true && (
            <MenuItem
              to="/customer"
              icon={FaUsers}
              label="Customer"
              isActive={isActive("/customer")}
              onClick={closeAllDropdowns}
            />
          )}
          {/* A3b — Wishlist viewer (Phase G1). user_show flag (matches BE). */}
          {user?.role_id?.user_show === true && (
            <MenuItem
              to="/wishlist"
              icon={FaHeart}
              label="Wishlists"
              isActive={isActive("/wishlist")}
              onClick={closeAllDropdowns}
            />
          )}
          {/* A3b — Loyalty viewer + adjust (Phase G3). user_show flag. */}
          {user?.role_id?.user_show === true && (
            <MenuItem
              to="/loyalty"
              icon={FaGift}
              label="Loyalty Points"
              isActive={isActive("/loyalty")}
              onClick={closeAllDropdowns}
            />
          )}
          {/* V fix — Wallet viewer + adjust (Phase E). user_show flag. */}
          {user?.role_id?.user_show === true && (
            <MenuItem
              to="/wallet"
              icon={FaWallet}
              label="Wallet"
              isActive={isActive("/wallet")}
              onClick={closeAllDropdowns}
            />
          )}
        </ul>
      </div>
    </div>
  );
};

export default SideNavBar;
