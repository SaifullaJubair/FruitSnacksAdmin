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
import { FaBorderAll, FaQuestion } from "react-icons/fa";
import { FaUsers } from "react-icons/fa6";

import { TfiLayoutSliderAlt } from "react-icons/tfi";
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
            user?.role_id?.sub_category_show === true ||
            // user?.role_id?.child_category_show === true ||
            user?.role_id?.brand_show === true ||
            user?.role_id?.specification_show === true ||
            user?.role_id?.attribute_show === true) && (
            <DropdownMenu
              label="Task"
              icon={BiTask}
              isOpen={activeDropdown === "task"}
              onClick={() => toggleDropdown("task")}
            >
              {user?.role_id?.category_show === true && (
                <ChildMenuItem
                  to="/category"
                  icon={TbCategoryPlus}
                  label="Category"
                  isActive={isActive("/category")}
                />
              )}

              {user?.role_id?.sub_category_show === true && (
                <ChildMenuItem
                  to="/sub-category"
                  icon={TbCategoryPlus}
                  label="Sub Category"
                  isActive={isActive("/sub-category")}
                />
              )}
              {/* {user?.role_id?.child_category_show === true && (
                <ChildMenuItem
                  to="/child-category"
                  icon={TbCategoryPlus}
                  label="Child Category"
                  isActive={isActive("/child-category")}
                />
              )} */}

              {user?.role_id?.brand_show === true && (
                <ChildMenuItem
                  to="/brand-category"
                  icon={TbCategoryPlus}
                  label="Brand Category"
                  isActive={isActive("/brand-category")}
                />
              )}
              {/* {user?.role_id?.specification_show === true && (
                <ChildMenuItem
                  to="/specification-list"
                  icon={TbCategoryPlus}
                  label="Specification"
                  isActive={isActive("/specification-list")} 
                />
              )} */}

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
          {user?.role_id?.banner_show === true && (
            <MenuItem
              to="/banner"
              icon={PiFlagBannerFill}
              label="Banner"
              isActive={isActive("/banner")}
              onClick={closeAllDropdowns} // Close all dropdowns when clicked
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
          {/* ......Order....  */}
          {user?.role_id?.order_show === true && (
            <>
              <MenuItem
                to="/fraud-check"
                icon={RiShieldCheckLine}
                label="Fraud Check"
                isActive={isActive("/order")}
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
        </ul>
      </div>
    </div>
  );
};

export default SideNavBar;
