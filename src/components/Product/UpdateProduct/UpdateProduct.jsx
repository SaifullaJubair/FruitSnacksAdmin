import { useState } from "react";
import { TiTick } from "react-icons/ti";
import "./updateStapper.css";
import UpdateStepOne from "./UpdateStepOne/UpdateStepOne";
import UpdateStepThree from "./UpdateStepThree/UpdateStepThree";

// UpdateProduct = 2-step wizard since Phase 2 (variation-attribute-filter).
// Old UpdateStepTwo (specifications picker) was retired with the backend
// specification module; attribute assignment now lives in UpdateStepOne.

const UpdateProduct = ({ productData, refetch }) => {
  const steps = ["", ""];

  const [currentStep, setCurrentStep] = useState(1);
  const [complete] = useState(false);

  // step one initial state — single-leaf category from the nested tree.
  // (sub_category_id / child_category_id no longer exist on the product model.)
  const [stepOneData, setStepOneData] = useState(() => {
    if (!productData) return {};
    return {
      _id: productData?._id || null,
      product_name: productData?.product_name || "",
      product_slug: productData?.product_slug || "",
      product_sku: productData?.product_sku || "",
      category_id: productData?.category_id?._id || null,
      category_name: productData?.category_id?.category_name || "",
      category_path: productData?.category_path || [],
      brand_id: productData?.brand_id?._id || null,
      brand_name: productData?.brand_id?.brand_name || "",
      is_variation: productData?.is_variation || false,
      product_price: productData?.product_price || 0,
      product_discount_price: productData?.product_discount_price || 0,
      product_buying_price: productData?.product_buying_price || 0,
      product_quantity: productData?.product_quantity || 0,
      defaultVariationData: productData?.variations,
      newVariationData: [],
      againAddNewVariation: false,
      deletedImageArray: [],
      // ── Phase F + H initial values (read from the existing product doc) ──
      video_link: productData?.video_link || "",
      condition: productData?.condition || "new",
      product_weight_grams: productData?.product_weight_grams ?? "",
      vat_percentage_override: productData?.vat_percentage_override ?? "",
      warehouse_id:
        typeof productData?.warehouse_id === "object"
          ? productData?.warehouse_id?._id || ""
          : productData?.warehouse_id || "",
      product_dimensions: productData?.product_dimensions || {},
      tier_prices: Array.isArray(productData?.tier_prices)
        ? productData.tier_prices
        : [],
      group_prices: Array.isArray(productData?.group_prices)
        ? productData.group_prices
        : [],
      // ── Phase F (A2c) initial values ─────────────────────────────────
      product_type: productData?.product_type || "simple",
      download_url: productData?.download_url || "",
      license_key: productData?.license_key || "",
      bundle_items: Array.isArray(productData?.bundle_items)
        ? productData.bundle_items.map((b) => ({
            product_id:
              typeof b.product_id === "object"
                ? b.product_id?._id || ""
                : b.product_id || "",
            quantity: b.quantity ?? 1,
          }))
        : [],
      available_from: productData?.available_from || "",
      billing_interval: productData?.billing_interval || "",
      custom_fields: Array.isArray(productData?.custom_fields)
        ? productData.custom_fields
        : [],
    };
  });

  // State to manage selected attributes (Phase 2 form state)
  const [selectedAttributes, setSelectedAttributes] = useState([]);
  const [selectedAttributeValues, setSelectedAttributeValues] = useState([]);
  const [dataToSubmit, setDataToSubmit] = useState([]);

  // step three (final) initial state — media + SEO
  const [stepThreeData, setStepThreeData] = useState({
    _id: productData?._id || null,
    description: productData?.description || "",
    main_image: productData?.main_image || null,
    main_image_key: productData?.main_image_key || null,
    size_chart: productData?.size_chart || null,
    size_chart_key: productData?.size_chart_key || null,
    main_video: productData?.main_video || null,
    main_video_key: productData?.main_video_key || null,
    meta_description: productData?.meta_description || "",
    meta_title: productData?.meta_title || "",
    meta_keywords: productData?.meta_keywords || [],
    other_images: productData?.other_images || [],
    panel_owner_id: productData?.panel_owner_id?._id || null,
    product_by: productData?.product_by || "",
    product_publisher_id: productData?.product_publisher_id?._id || null,
    product_status: productData?.product_status || "",
    shipping_days: productData?.shipping_days,
    unit: productData?.unit || "",
    product_warrenty: productData?.product_warrenty || "",
    product_return: productData?.product_return || "",
    barcode: productData?.barcode || "",
    product_pre_order: productData?.product_pre_order || false,
    product_returnable_days: productData?.product_returnable_days || 0,
    trending_product: productData?.trending_product == true ? true : false,
  });

  return (
    <div className="mt-6 bg-white  rounded-lg shadow-xl sm:p-6 py-6">
      <div className="flex items-center justify-center   ">
        {steps?.map((step, i) => (
          <div
            key={i}
            className={`step-item    ${currentStep === i + 1 && "active"} ${
              (i + 1 < currentStep || complete) && "complete"
            }`}
          >
            <div className="step  text-gray-700 ">
              {i + 1 < currentStep || complete ? <TiTick size={24} /> : i + 1}
            </div>
            <p className="text-gray-500 text-xs ">{step}</p>
          </div>
        ))}
      </div>
      <div className="mx-4  mt-6 sm:mt-10">
        {currentStep == 2 ? (
          <UpdateStepThree
            setCurrentStep={setCurrentStep}
            stepThreeData={stepThreeData}
            stepOneData={stepOneData}
            productData={productData}
            refetch={refetch}
          />
        ) : (
          <UpdateStepOne
            stepOneData={stepOneData}
            setStepOneData={setStepOneData}
            setCurrentStep={setCurrentStep}
            selectedAttributes={selectedAttributes}
            selectedAttributeValues={selectedAttributeValues}
            setSelectedAttributes={setSelectedAttributes}
            setSelectedAttributeValues={setSelectedAttributeValues}
            setDataToSubmit={setDataToSubmit}
            dataToSubmit={dataToSubmit}
          />
        )}
      </div>
    </div>
  );
};

export default UpdateProduct;
