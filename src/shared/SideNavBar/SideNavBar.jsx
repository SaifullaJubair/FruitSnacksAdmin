import { useContext, useEffect, useState } from "react";
import { logo } from "../../utils/imageImport";
import { Link, useLocation } from "react-router-dom";
import {
  MdOutlineAddchart,
  MdOutlineCampaign,
  MdOutlineLocalOffer,
  MdOutlineReviews,
} from "react-icons/md";
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

  return (
    <div className="flex flex-col min-h-screen bg-blueColor-800 text-gray-50">
      <div className="flex-grow">
        {/* Logo */}
        <div className="flex items-center justify-center border-b border-blueColor-600 mt-1 pb-3">
          <Link to="/">
            <img src={settingData?.logo} alt="Logo" width={70} height={70} />
          </Link>
        </div>
        {/* Menu — grouped into collapsible sections (single-open accordion) */}
        <ul className="flex flex-col pb-4 space-y-[2px]">
          {/* ── Dashboard (flat, always on top) ─────────────────────────── */}
          {user?.role_id?.dashboard_show === true && (
            <MenuItem
              to="/"
              icon={GoHome}
              label="Dashboard"
              isActive={isActive("/")}
              onClick={closeAllDropdowns}
            />
          )}

          {/* ── Catalog ──────────────────────────────────────────────────── */}
          {(user?.role_id?.category_show === true ||
            user?.role_id?.brand_show === true ||
            user?.role_id?.attribute_show === true ||
            user?.role_id?.product_show === true) && (
            <DropdownMenu
              label="Catalog"
              icon={TbCategoryPlus}
              isOpen={activeDropdown === "catalog"}
              onClick={() => toggleDropdown("catalog")}
            >
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
                  label="Brand"
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

          {/* ── Orders ───────────────────────────────────────────────────── */}
          {(user?.role_id?.order_show === true ||
            user?.role_id?.order_create_admin === true) && (
            <DropdownMenu
              label="Orders"
              icon={FaBorderAll}
              isOpen={activeDropdown === "orders"}
              onClick={() => toggleDropdown("orders")}
            >
              {user?.role_id?.order_show === true && (
                <ChildMenuItem
                  to="/order"
                  icon={FaBorderAll}
                  label="Order List"
                  isActive={isActive("/order")}
                />
              )}
              {/* Processing / Delivered / Cancelled / Returned / Offer are TABS
                  inside the Order List page. */}
              {user?.role_id?.order_create_admin === true && (
                <ChildMenuItem
                  to="/order/create"
                  icon={FaBorderAll}
                  label="Create POS Order"
                  isActive={isActive("/order/create")}
                />
              )}
              {user?.role_id?.order_show === true && (
                <>
                  <ChildMenuItem
                    to="/steadfast-order"
                    icon={FaBorderAll}
                    label="SteadFast Orders"
                    isActive={isActive("/steadfast-order")}
                  />
                  <ChildMenuItem
                    to="/pathao-order"
                    icon={FaBorderAll}
                    label="Pathao Orders"
                    isActive={isActive("/pathao-order")}
                  />
                  <ChildMenuItem
                    to="/fraud-check"
                    icon={RiShieldCheckLine}
                    label="Fraud Check"
                    isActive={isActive("/fraud-check")}
                  />
                  <ChildMenuItem
                    to="/abandoned-cart"
                    icon={FiShoppingCart}
                    label="Abandoned Carts"
                    isActive={isActive("/abandoned-cart")}
                  />
                </>
              )}
            </DropdownMenu>
          )}

          {/* ── Marketing ────────────────────────────────────────────────── */}
          {(user?.role_id?.offer_show === true ||
            user?.role_id?.campaign_show === true ||
            user?.role_id?.coupon_show === true ||
            user?.role_id?.banner_show === true ||
            user?.role_id?.slider_show === true) && (
            <DropdownMenu
              label="Marketing"
              icon={MdOutlineCampaign}
              isOpen={activeDropdown === "marketing"}
              onClick={() => toggleDropdown("marketing")}
            >
              {(user?.role_id?.offer_show === true ||
                user?.role_id?.offer_create === true ||
                user?.role_id?.offer_update === true) && (
                <ChildMenuItem
                  to="/flash-sale"
                  icon={MdFlashOn}
                  label="Flash Sale"
                  isActive={isActive("/flash-sale")}
                />
              )}
              {user?.role_id?.offer_show === true && (
                <ChildMenuItem
                  to="/offer-list"
                  icon={MdOutlineLocalOffer}
                  label="Offers"
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
              {user?.role_id?.campaign_show === true && (
                <ChildMenuItem
                  to="/campaign-list"
                  icon={MdOutlineCampaign}
                  label="Campaigns"
                  isActive={isActive("/campaign-list")}
                />
              )}
              {user?.role_id?.campaign_create === true && (
                <ChildMenuItem
                  to="/add-campaign"
                  icon={MdOutlineAddchart}
                  label="Add Campaign"
                  isActive={isActive("/add-campaign")}
                />
              )}
              {user?.role_id?.coupon_show === true && (
                <ChildMenuItem
                  to="/your-coupon"
                  icon={RiCoupon3Line}
                  label="Coupons"
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
              {user?.role_id?.banner_show === true && (
                <ChildMenuItem
                  to="/banner"
                  icon={PiFlagBannerFill}
                  label="Banner"
                  isActive={isActive("/banner")}
                />
              )}
              {user?.role_id?.slider_show === true && (
                <ChildMenuItem
                  to="/slider"
                  icon={TfiLayoutSliderAlt}
                  label="Slider"
                  isActive={isActive("/slider")}
                />
              )}
            </DropdownMenu>
          )}

          {/* ── Customers ────────────────────────────────────────────────── */}
          {(user?.role_id?.customer_show === true ||
            user?.role_id?.user_show === true ||
            user?.role_id?.review_show === true ||
            user?.role_id?.review_seed_bulk === true ||
            user?.role_id?.review_seed_manual === true ||
            user?.role_id?.question_show === true) && (
            <DropdownMenu
              label="Customers"
              icon={PiUsersThree}
              isOpen={activeDropdown === "customers"}
              onClick={() => toggleDropdown("customers")}
            >
              {user?.role_id?.customer_show === true && (
                <ChildMenuItem
                  to="/customer"
                  icon={FaUsers}
                  label="Customer"
                  isActive={isActive("/customer")}
                />
              )}
              {user?.role_id?.user_show === true && (
                <>
                  <ChildMenuItem
                    to="/wishlist"
                    icon={FaHeart}
                    label="Wishlists"
                    isActive={isActive("/wishlist")}
                  />
                  <ChildMenuItem
                    to="/loyalty"
                    icon={FaGift}
                    label="Loyalty Points"
                    isActive={isActive("/loyalty")}
                  />
                  <ChildMenuItem
                    to="/wallet"
                    icon={FaWallet}
                    label="Wallet"
                    isActive={isActive("/wallet")}
                  />
                </>
              )}
              {user?.role_id?.review_show === true && (
                <>
                  <ChildMenuItem
                    to="/review"
                    icon={MdOutlineReviews}
                    label="Reviews"
                    isActive={
                      isActive("/review") && !isActive("/review/pending")
                    }
                  />
                  <ChildMenuItem
                    to="/review/pending"
                    icon={MdOutlineReviews}
                    label="Pending Reviews"
                    isActive={isActive("/review/pending")}
                  />
                </>
              )}
              {(user?.role_id?.review_seed_bulk === true ||
                user?.role_id?.review_seed_manual === true) && (
                <ChildMenuItem
                  to="/review/seed"
                  icon={MdOutlineReviews}
                  label="Seed Reviews"
                  isActive={isActive("/review/seed")}
                />
              )}
              {user?.role_id?.question_show === true && (
                <ChildMenuItem
                  to="/question"
                  icon={FaQuestion}
                  label="Questions"
                  isActive={isActive("/question")}
                />
              )}
            </DropdownMenu>
          )}

          {/* ── Content ──────────────────────────────────────────────────── */}
          {(user?.role_id?.theme_show === true ||
            user?.role_id?.faq_template_show === true ||
            user?.role_id?.site_faq_show === true ||
            user?.role_id?.trust_point_show === true ||
            user?.role_id?.newsletter_show === true ||
            user?.role_id?.newsletter_export === true) && (
            <DropdownMenu
              label="Content"
              icon={IoColorPaletteOutline}
              isOpen={activeDropdown === "content"}
              onClick={() => toggleDropdown("content")}
            >
              {user?.role_id?.theme_show === true && (
                <ChildMenuItem
                  to="/theme"
                  icon={IoColorPaletteOutline}
                  label="Themes"
                  isActive={isActive("/theme")}
                />
              )}
              {user?.role_id?.faq_template_show === true && (
                <ChildMenuItem
                  to="/faq-template"
                  icon={FaQuestion}
                  label="FAQ Templates"
                  isActive={isActive("/faq-template")}
                />
              )}
              {user?.role_id?.site_faq_show === true && (
                <ChildMenuItem
                  to="/site-faq"
                  icon={FaQuestion}
                  label="Site FAQ"
                  isActive={isActive("/site-faq")}
                />
              )}
              {user?.role_id?.trust_point_show === true && (
                <ChildMenuItem
                  to="/trust-point"
                  icon={FaHandshake}
                  label="Brand Promise"
                  isActive={isActive("/trust-point")}
                />
              )}
              {(user?.role_id?.newsletter_show === true ||
                user?.role_id?.newsletter_export === true) && (
                <ChildMenuItem
                  to="/newsletter-subscribers"
                  icon={GrAnnounce}
                  label="Newsletter"
                  isActive={isActive("/newsletter-subscribers")}
                />
              )}
            </DropdownMenu>
          )}

          {/* ── Inventory ────────────────────────────────────────────────── */}
          {(user?.role_id?.setting_show === true ||
            user?.role_id?.supplier_show === true) && (
            <DropdownMenu
              label="Inventory"
              icon={FaWarehouse}
              isOpen={activeDropdown === "inventory"}
              onClick={() => toggleDropdown("inventory")}
            >
              {user?.role_id?.setting_show === true && (
                <ChildMenuItem
                  to="/warehouse"
                  icon={FaWarehouse}
                  label="Warehouses"
                  isActive={isActive("/warehouse")}
                />
              )}
              {user?.role_id?.supplier_show === true && (
                <ChildMenuItem
                  to="/supplier"
                  icon={FaUsers}
                  label="Suppliers"
                  isActive={isActive("/supplier")}
                />
              )}
            </DropdownMenu>
          )}

          {/* ── Settings ─────────────────────────────────────────────────── */}
          {(user?.role_id?.site_setting_update === true ||
            user?.role_id?.page_seo_show === true) && (
            <DropdownMenu
              label="Settings"
              icon={IoSettings}
              isOpen={activeDropdown === "settings"}
              onClick={() => toggleDropdown("settings")}
            >
              {user?.role_id?.site_setting_update === true && (
                <ChildMenuItem
                  to="/settings"
                  icon={IoSettings}
                  label="Site Settings"
                  isActive={isActive("/settings")}
                />
              )}
              {user?.role_id?.page_seo_show === true && (
                <ChildMenuItem
                  to="/page-seo"
                  icon={IoSettings}
                  label="Page SEO"
                  isActive={isActive("/page-seo")}
                />
              )}
            </DropdownMenu>
          )}

          {/* ── Staff ────────────────────────────────────────────────────── */}
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
                  label="Staff Roles"
                  isActive={isActive("/staff-role")}
                />
              )}
            </DropdownMenu>
          )}
        </ul>
      </div>
    </div>
  );
};

export default SideNavBar;
