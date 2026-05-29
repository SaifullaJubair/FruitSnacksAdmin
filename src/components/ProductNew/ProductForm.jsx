import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import Select from "react-select";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { MdCancel } from "react-icons/md";
import {
  RiImageAddLine,
  RiVideoAddLine,
  RiRefreshLine,
} from "react-icons/ri";
import { PiImagesThin } from "react-icons/pi";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import { FiInfo } from "react-icons/fi";

import { BASE_URL } from "../../utils/baseURL";
import { AuthContext } from "../../context/AuthProvider";
import { LoaderOverlay } from "../common/loader/LoderOverley";
import MiniSpinner from "../../shared/MiniSpinner/MiniSpinner";
import CategoryTreePicker from "../Category/CategoryTreePicker";

import StepOneVariation from "./stepOne/StepOneVariation";
import StepOnePrice from "./stepOne/StepOnePrice";
import StepOneAdvanced from "./stepOne/StepOneAdvanced";
import { StepOneBaseContext } from "./stepOne/StepOneBaseContext";
import CustomFieldsBlock from "./sections/CustomFieldsBlock";
import BundleItemsBlock from "./sections/BundleItemsBlock";
import SectionInfoModal from "./sections/SectionInfoModal";
import {
  logisticsInfo,
  bulkPricingInfo,
  customSpecRowsInfo,
  seoInfo,
  pricingStockInfo,
} from "./sections/sectionInfoContent";

// ─────────────────────────────────────────────────────────────────────────────
// ProductForm — single-page Add/Update product form.
//
// Sections (top → bottom):
//   1. Basic Info (always open)        — name, category, brand, SKU, barcode
//                                         (+ auto-gen), unit, trending,
//                                         description, media (main_image +
//                                         video radio "upload OR link" +
//                                         other_images + size chart)
//   2. Product Type (always open)      — radio: simple / variable (add mode)
//                                         + combo (update only). Combo →
//                                         inline BundleItemsBlock.
//   3. Pricing & Stock (always open)   — simple OR variation matrix
//   4. Advanced — Logistics (collapsed) — weight, dims, warehouse, warranty,
//                                          return note, VAT override
//   5. Advanced — Bulk Pricing (collapsed) — tier + group prices
//   6. Advanced — Custom Spec Rows (collapsed) — custom_fields[]
//   7. Advanced — SEO (collapsed)      — meta_title/desc/keywords
//
// One useForm() owns ALL fields, so the variation image modal can `watch()`
// the latest main_image + other_images. Backend payload identical to v1.
// On Add success → "✨ Configure Hero Content →" CTA → /product/page-content/:id.
// ─────────────────────────────────────────────────────────────────────────────

const PHASE_FH_JSON_FIELDS = [
  "product_dimensions",
  "tier_prices",
  "group_prices",
  "custom_fields",
  "bundle_items",
];

const appendPhaseFHJsonFields = (formData, src) => {
  PHASE_FH_JSON_FIELDS.forEach((k) => {
    const v = src?.[k];
    if (v === undefined || v === null) return;
    if (Array.isArray(v) && v.length === 0) return;
    if (!Array.isArray(v) && typeof v === "object" && Object.keys(v).length === 0)
      return;
    formData.append(k, JSON.stringify(v));
  });
};

// Resolve a per-row `variation_image` value (tagged object | File | string)
// to a concrete File / string for FormData.
const resolveVariationImage = (value, mainImage, otherImages) => {
  if (!value) return null;
  if (value instanceof File) return value;
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    if (value.source === "new" && value.file instanceof File) return value.file;
    if (value.source === "existing") {
      if (value.ref === "main") return mainImage instanceof File ? mainImage : null;
      if (value.ref?.startsWith("other:")) {
        const idx = Number(value.ref.split(":")[1]);
        const item = (otherImages || [])[idx];
        return item instanceof File ? item : null;
      }
    }
  }
  return null;
};

// Pseudo-unique barcode — timestamp + 4-digit random. Owner can edit.
const generateBarcode = () => {
  const ts = Date.now().toString().slice(-9);
  const rand = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  return `BC-${ts}-${rand}`;
};

// Collapsible card with chevron header. `alwaysOpen` hides the chevron.
// `infoContent` (JSX) renders a small ⓘ button next to the title — click opens
// a modal that explains "what / when / example" for this section. Click of the
// ⓘ button does NOT toggle the collapse (stopPropagation).
const Section = ({
  title,
  subtitle,
  open,
  setOpen,
  alwaysOpen = false,
  infoContent,
  infoTitle,
  children,
}) => {
  const [infoOpen, setInfoOpen] = useState(false);
  const expanded = alwaysOpen || open;
  return (
    <section className="shadow-md bg-gray-50 rounded-lg p-4 sm:p-6 md:p-8">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => !alwaysOpen && setOpen(!open)}
          className="flex-1 flex items-center gap-2 text-left"
        >
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-textColor inline-flex items-center gap-2">
              {title}
            </h1>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          </div>
        </button>
        <div className="flex items-center gap-2 flex-shrink-0">
          {infoContent && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setInfoOpen(true);
              }}
              className="w-8 h-8 inline-flex items-center justify-center rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100"
              title="What is this section? See examples"
              aria-label="Section info"
            >
              <FiInfo size={16} />
            </button>
          )}
          {!alwaysOpen && (
            <button
              type="button"
              onClick={() => setOpen(!open)}
              className="text-gray-500 p-1"
              aria-label={expanded ? "Collapse" : "Expand"}
            >
              {expanded ? <FaChevronDown size={18} /> : <FaChevronRight size={18} />}
            </button>
          )}
        </div>
      </div>
      {expanded && <div className="mt-6 space-y-6">{children}</div>}
      {infoContent && (
        <SectionInfoModal
          open={infoOpen}
          title={infoTitle || title}
          onClose={() => setInfoOpen(false)}
        >
          {infoContent}
        </SectionInfoModal>
      )}
    </section>
  );
};

const ProductForm = ({ mode = "add", initialData = null, onSaved }) => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const isUpdate = mode === "update";

  // ── React Hook Form ───────────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      product_name: initialData?.product_name || "",
      product_sku: initialData?.product_sku || "",
      barcode: initialData?.barcode || "",
      product_price: initialData?.product_price ?? "",
      product_discount_price: initialData?.product_discount_price ?? "",
      product_buying_price: initialData?.product_buying_price ?? "",
      product_quantity: initialData?.product_quantity ?? "",
      unit: initialData?.unit || "",
      meta_title: initialData?.meta_title || "",
      meta_description: initialData?.meta_description || "",
      product_warrenty: initialData?.product_warrenty || "",
      product_return: initialData?.product_return || "",
    },
  });

  // ── Local state ────────────────────────────────────────────────────────────
  const [category_id, setCategory_id] = useState(
    initialData?.category_id?._id || initialData?.category_id || "",
  );
  const [category_name, setCategory_name] = useState(
    initialData?.category_id?.category_name || initialData?.category_name || "",
  );
  const [category_path, setCategoryPath] = useState(
    initialData?.category_path || [],
  );

  const [brand_id, setBrand_id] = useState(
    initialData?.brand_id?._id || initialData?.brand_id || "",
  );
  const [brand_name, setBrand_name] = useState(
    initialData?.brand_id?.brand_name || initialData?.brand_name || "",
  );

  const [description, setDescription] = useState(initialData?.description || "");

  // Media
  const [thumbnailPreview, setThumbnailPreview] = useState(
    initialData?.main_image || null,
  );
  const [thumbnailVideoPreview, setThumbnailVideoPreview] = useState(
    initialData?.main_video || null,
  );
  const [sizeChartPreview, setSizeChartPreview] = useState(
    initialData?.size_chart || null,
  );
  // Backend returns other_images as [{other_image, other_image_key, _id}, …]
  // (object array). Normalise to a flat string-URL array for previews + the
  // RHF pool so existing entries survive an update submit.
  const initialOtherImagesUrls = (initialData?.other_images || [])
    .map((it) => (typeof it === "string" ? it : it?.other_image))
    .filter(Boolean);
  const [imagePreviews, setImagePreviews] = useState(initialOtherImagesUrls);

  // Prime RHF with prefilled string URLs in update mode (so they survive submit).
  // ALSO sync the local preview states — they were initialised from initialData
  // on first render, but if the parent passes new initialData later (e.g. a
  // refetch after save), the previews would otherwise stay stale.
  useEffect(() => {
    if (!isUpdate) return;
    if (initialData?.main_image) {
      setValue("main_image", initialData.main_image);
      setThumbnailPreview(initialData.main_image);
    }
    if (initialData?.main_video) {
      setValue("main_video", initialData.main_video);
      setThumbnailVideoPreview(initialData.main_video);
    }
    if (initialData?.size_chart) {
      setValue("size_chart", initialData.size_chart);
      setSizeChartPreview(initialData.size_chart);
    }
    if (initialOtherImagesUrls.length) {
      setValue("other_images", initialOtherImagesUrls);
      setImagePreviews(initialOtherImagesUrls);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUpdate, initialData]);

  // Video mode — "upload" or "link"; default to whichever has data on update,
  // else "upload" for fresh adds.
  const [videoMode, setVideoMode] = useState(
    initialData?.video_link && !initialData?.main_video ? "link" : "upload",
  );
  const [videoLink, setVideoLink] = useState(initialData?.video_link || "");

  // Variation matrix
  const [showProductVariation, setShowProductVariation] = useState(
    initialData?.is_variation || false,
  );
  const [inputValueData, setFormData] = useState(
    Array.isArray(initialData?.variations) ? initialData.variations : [],
  );
  const [selectedAttributes, setSelectedAttributes] = useState([]);
  const [selectedAttributeValues, setSelectedAttributeValues] = useState([]);
  // axisById lives here (not inside StepOneVariation) so update-mode can
  // rehydrate it from initialData.variant_axes before the matrix mounts.
  const [axisById, setAxisById] = useState({});
  const [dataToSubmit, setDataToSubmit] = useState({
    product_attributes: [],
    variant_axes: [],
    attributes_details: [],
  });

  // Attribute registry — fetched once, used by the rehydration effect below to
  // turn `initialData.product_attributes` (just ids) into the full attribute +
  // value objects that StepOneVariation expects in its selected state.
  // StepOneVariation also reads from this same react-query key, so we hit the
  // cache instead of double-fetching.
  const { data: attributesResp } = useQuery({
    queryKey: ["/api/v1/attribute"],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/attribute`, { credentials: "include" });
      return res.json();
    },
    enabled: isUpdate,    // only needed for update-mode prefill
  });
  const allAttributes = attributesResp?.data ?? [];

  // Rehydrate the variation block from initialData ONCE — when attributes
  // arrive (update-mode only). Guarded by a ref so a refetch / re-render
  // never wipes the admin's in-progress edits.
  const variationHydratedRef = useRef(false);
  useEffect(() => {
    if (!isUpdate) return;
    if (variationHydratedRef.current) return;
    if (!allAttributes.length) return;
    if (!Array.isArray(initialData?.product_attributes) || initialData.product_attributes.length === 0) {
      variationHydratedRef.current = true;
      return;
    }

    // Map ids → full attribute objects (preserving the order the admin saved)
    const attrsById = new Map(allAttributes.map((a) => [a._id, a]));
    const nextSelectedAttributes = [];
    const nextSelectedValues = [];

    initialData.product_attributes.forEach((pa) => {
      const attr = attrsById.get(pa.attribute_id);
      if (!attr) return;     // attribute deleted since save — skip silently
      nextSelectedAttributes.push(attr);

      const valuesById = new Map(
        (attr.attribute_values || []).map((v) => [v._id, v]),
      );
      const picked = (pa.value_ids || [])
        .map((vid) => valuesById.get(vid))
        .filter(Boolean);
      nextSelectedValues.push(picked);
    });

    // axisById from variant_axes (mandatory flag means this axis drives variations)
    const nextAxisById = {};
    (initialData?.variant_axes || []).forEach((va) => {
      if (va.is_mandatory !== false) nextAxisById[va.attribute_id] = true;
    });

    setSelectedAttributes(nextSelectedAttributes);
    setSelectedAttributeValues(nextSelectedValues);
    setAxisById(nextAxisById);
    // Batch 2 E6 — also rehydrate the per-attribute show_in_filter map.
    const nextShowInFilter = {};
    initialData.product_attributes.forEach((pa) => {
      if (pa.attribute_id !== undefined && pa.show_in_filter === false) {
        nextShowInFilter[pa.attribute_id] = false;
      }
    });
    setInitialShowInFilterById(nextShowInFilter);
    variationHydratedRef.current = true;
  }, [isUpdate, allAttributes, initialData]);

  // Holds the rehydrated show_in_filter map for StepOneVariation to seed itself.
  const [initialShowInFilterById, setInitialShowInFilterById] = useState({});

  // Phase F + H scalars
  const [weightGrams, setWeightGrams] = useState(
    initialData?.product_weight_grams ?? "",
  );
  const [vatOverride, setVatOverride] = useState(
    initialData?.vat_percentage_override ?? "",
  );
  const [warehouseId, setWarehouseId] = useState(
    typeof initialData?.warehouse_id === "object"
      ? initialData?.warehouse_id?._id || ""
      : initialData?.warehouse_id || "",
  );
  const [dimensions, setDimensions] = useState(initialData?.product_dimensions || {});
  const [tierPrices, setTierPrices] = useState(
    Array.isArray(initialData?.tier_prices) ? initialData.tier_prices : [],
  );
  const [groupPrices, setGroupPrices] = useState(
    Array.isArray(initialData?.group_prices) ? initialData.group_prices : [],
  );

  // product_type — Combo only available in update mode
  const [productType, setProductType] = useState(
    initialData?.product_type || "simple",
  );
  const [bundleItems, setBundleItems] = useState(
    Array.isArray(initialData?.bundle_items)
      ? initialData.bundle_items.map((b) => ({
          product_id:
            typeof b.product_id === "object"
              ? b.product_id?._id || ""
              : b.product_id || "",
          quantity: b.quantity ?? 1,
        }))
      : [],
  );
  const [customFields, setCustomFields] = useState(
    Array.isArray(initialData?.custom_fields) ? initialData.custom_fields : [],
  );

  // SEO
  const [keywords, setKeywords] = useState(
    Array.isArray(initialData?.meta_keywords) ? initialData.meta_keywords : [],
  );
  const [inputKeyword, setInputKeyword] = useState("");
  const [trending_product, setTrendingProduct] = useState(
    initialData?.trending_product ?? true,
  );

  // Collapse state
  const [advLogOpen, setAdvLogOpen] = useState(false);
  const [advBulkOpen, setAdvBulkOpen] = useState(false);
  const [advCustomOpen, setAdvCustomOpen] = useState(
    Array.isArray(initialData?.custom_fields) && initialData.custom_fields.length > 0,
  );
  const [advSeoOpen, setAdvSeoOpen] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [postSaveProductId, setPostSaveProductId] = useState(null);

  // Brand fetch
  const { data: brandsResp = {}, isLoading: brandLoading } = useQuery({
    queryKey: ["/api/v1/brand/dashboard"],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/brand/dashboard`, {
        credentials: "include",
      });
      return res.json();
    },
  });
  const brandData = brandsResp?.data ?? [];

  // Live values for variation matrix + modal
  const watchedBasePrice = Number(watch("product_price")) || 0;
  const watchedMainImage = watch("main_image");
  const watchedOtherImages = watch("other_images");

  // ── Media handlers ────────────────────────────────────────────────────────
  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailPreview(URL.createObjectURL(file));
      setValue("main_image", file);
    }
  };
  const removeThumbnail = () => {
    setThumbnailPreview(null);
    setValue("main_image", null);
  };
  const handleThumbnailVideoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailVideoPreview(URL.createObjectURL(file));
      setValue("main_video", file);
    }
  };
  const removeThumbnailVideo = () => {
    setThumbnailVideoPreview(null);
    setValue("main_video", null);
  };
  const handleSizeChartChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSizeChartPreview(URL.createObjectURL(file));
      setValue("size_chart", file);
    }
  };
  const removeSizeChart = () => {
    setSizeChartPreview(null);
    setValue("size_chart", null);
  };
  const handleOtherImagesChange = (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    const previews = Array.from(files).map((f) => URL.createObjectURL(f));
    setImagePreviews([...imagePreviews, ...previews]);
    const current = watchedOtherImages ? Array.from(watchedOtherImages) : [];
    setValue("other_images", [...current, ...files]);
    e.target.value = null;
  };
  const removeOtherImage = (idx) => {
    const next = [...imagePreviews];
    next.splice(idx, 1);
    setImagePreviews(next);
    const current = Array.from(watchedOtherImages || []);
    current.splice(idx, 1);
    setValue("other_images", current.length ? current : null);
  };

  // Switch video mode — clears the other side so only one submits.
  const switchVideoMode = (next) => {
    setVideoMode(next);
    if (next === "upload") {
      setVideoLink("");
    } else {
      removeThumbnailVideo();
    }
  };

  // Keyword tag handlers
  const handleKeywordKey = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const k = inputKeyword.trim();
      if (k) {
        setKeywords([...keywords, { keyword: k }]);
        setInputKeyword("");
      }
    }
  };
  const removeKeyword = (k) =>
    setKeywords(keywords.filter((it) => it.keyword !== k));

  // Validation
  const validateSimpleNumeric = (form) => {
    const price = parseFloat(form.product_price);
    const discount = parseFloat(form.product_discount_price);
    const qty = parseFloat(form.product_quantity);
    if (!Number.isNaN(discount) && price <= discount) {
      toast.error("Product price must be greater than the discount price.");
      return false;
    }
    if (Number.isNaN(qty) || qty < 0) {
      toast.error("Product quantity is required and must be ≥ 0.");
      return false;
    }
    return true;
  };
  const validateVariationRows = () => {
    for (let i = 0; i < inputValueData.length; i++) {
      const r = inputValueData[i];
      const price = Number(r.variation_price);
      const discount = Number(r.variation_discount_price);
      const qty = Number(r.variation_quantity);
      if (price > 0 && discount > 0 && price <= discount) {
        toast.error(`Row ${i + 1}: price must be greater than discount.`);
        return false;
      }
      if (qty < 0) {
        toast.error(`Row ${i + 1}: quantity must be ≥ 0.`);
        return false;
      }
    }
    return true;
  };

  // Build & submit FormData
  const buildFormData = (form, publish) => {
    const fd = new FormData();
    fd.append("product_status", publish ? "active" : "in-active");
    fd.append("product_publisher_id", user?._id || "");
    fd.append("trending_product", trending_product);

    fd.append("product_name", form.product_name || "");
    if (form.product_sku) fd.append("product_sku", form.product_sku);
    if (form.barcode) fd.append("barcode", form.barcode);
    if (form.product_warrenty) fd.append("product_warrenty", form.product_warrenty);
    if (form.product_return) fd.append("product_return", form.product_return);
    if (form.unit) fd.append("unit", form.unit);
    if (form.meta_title) fd.append("meta_title", form.meta_title);
    if (form.meta_description) fd.append("meta_description", form.meta_description);

    fd.append("category_id", category_id);
    if (category_name) fd.append("category_name", category_name);
    (category_path || []).forEach((id, i) => fd.append(`category_path[${i}]`, id));

    if (brand_id) fd.append("brand_id", brand_id);
    if (brand_name) fd.append("brand_name", brand_name);

    fd.append("description", description || "");

    if (form.main_image instanceof File) fd.append("main_image", form.main_image);
    if (form.size_chart instanceof File) fd.append("size_chart", form.size_chart);
    // Split other_images into:
    //   - Files → uploaded fresh under `other_images[i]` (backend S3-uploads)
    //   - Strings → preserved as existing URLs via `other_default_images` shape
    //     (backend recombines into the final other_images array). Without
    //     sending the existing URLs the update controller wipes them and only
    //     keeps the fresh uploads.
    if (Array.isArray(form.other_images)) {
      let fileIdx = 0;
      let urlIdx = 0;
      // Build a quick lookup of S3 keys keyed by their public URL — only
      // available in update mode where initialData carries the full objects.
      const keyByUrl = new Map();
      (initialData?.other_images || []).forEach((it) => {
        if (it && typeof it === "object" && it.other_image) {
          keyByUrl.set(it.other_image, it.other_image_key || "");
        }
      });
      form.other_images.forEach((item) => {
        if (item instanceof File) {
          fd.append(`other_images[${fileIdx}]`, item);
          fileIdx += 1;
        } else if (typeof item === "string" && item) {
          // Existing image URL — backend rebuilds via other_default_images.
          fd.append(`other_default_images[other_image][${urlIdx}]`, item);
          fd.append(
            `other_default_images[other_image_key][${urlIdx}]`,
            keyByUrl.get(item) || "",
          );
          urlIdx += 1;
        }
      });
    }

    // Video — only the active mode is sent.
    if (videoMode === "upload") {
      if (form.main_video instanceof File) fd.append("main_video", form.main_video);
      fd.append("video_link", ""); // explicitly clear the other side
    } else {
      fd.append("video_link", videoLink || "");
      // do NOT append main_video — clearing is by omission (backend keeps existing
      // on update unless we add a "clear" toggle later)
    }

    fd.append("product_price", form.product_price || 0);
    // Variable mode also sends product-level discount + buying as the matrix
    // defaults. Quantity is per-variation in Variable mode (skip).
    if (form.product_discount_price)
      fd.append("product_discount_price", form.product_discount_price);
    if (form.product_buying_price)
      fd.append("product_buying_price", form.product_buying_price);
    if (!showProductVariation) {
      fd.append("product_quantity", form.product_quantity || 0);
    }

    fd.append("meta_keywords", JSON.stringify(keywords));
    // postProduct uses `showProductVariation`; updateProduct uses `is_variation`
    // + `againAddNewVariation`. Send all three so both endpoints work without
    // a backend rename.
    fd.append("showProductVariation", showProductVariation);
    fd.append("is_variation", showProductVariation ? "true" : "false");
    // We always rebuild the variation_details payload from the matrix on submit,
    // so for the update path tell the controller NOT to skip the variation
    // upsert loop. (Backend only acts when this is the string "false".)
    fd.append("againAddNewVariation", "false");

    if (showProductVariation && Array.isArray(inputValueData)) {
      inputValueData.forEach((row, idx) => {
        const prefix = `variation_details[${idx}]`;
        // Critical for UPDATE: backend `updateOne({_id: variationDetails._id})`
        // needs the existing variation row's id. Without it the update query
        // matches nothing and the row never changes (even though Mongoose
        // returns a truthy ack, so the controller wrongly reports success).
        if (row._id) fd.append(`${prefix}[_id]`, row._id);
        fd.append(`${prefix}[variation_name]`, row.variation_name || "");
        fd.append(`${prefix}[variation_price]`, row.variation_price || 0);
        fd.append(
          `${prefix}[variation_discount_price]`,
          row.variation_discount_price || 0,
        );
        fd.append(`${prefix}[variation_quantity]`, row.variation_quantity || 0);
        fd.append(
          `${prefix}[variation_buying_price]`,
          row.variation_buying_price || 0,
        );
        fd.append(
          `${prefix}[variation_alert_quantity]`,
          row.variation_alert_quantity || 0,
        );
        fd.append(
          `${prefix}[variation_price_delta]`,
          row.variation_price_delta ?? 0,
        );
        fd.append(`${prefix}[is_active]`, row.is_active !== false);
        (row.combination || []).forEach((vid, ci) =>
          fd.append(`${prefix}[combination][${ci}]`, vid),
        );

        // Batch 2 C1 — multi-image variation. If row has the array shape,
        // split into Files (new uploads) + URL strings (reused), send under
        // the two parallel form fields the backend now parses. Otherwise
        // fall back to the legacy single-image path.
        const imagesArr = Array.isArray(row.variation_images)
          ? row.variation_images
          : null;
        if (imagesArr && imagesArr.length > 0) {
          let fileIdx = 0;
          let urlIdx = 0;
          imagesArr.forEach((it) => {
            let asFile = null;
            let asUrl = null;
            if (it instanceof File) asFile = it;
            else if (typeof it === "string") asUrl = it;
            else if (it && typeof it === "object") {
              if (it.url) asUrl = it.url;
              else if (it.file instanceof File) asFile = it.file;
            }
            if (asFile) {
              fd.append(`${prefix}[variation_images][${fileIdx}]`, asFile);
              fileIdx += 1;
            } else if (asUrl) {
              fd.append(
                `${prefix}[variation_images_urls][${urlIdx}]`,
                asUrl,
              );
              urlIdx += 1;
            }
          });
          // Keep legacy single field synced for cart/order back-compat —
          // first URL in the array (Files will be resolved server-side, so
          // we can't echo the URL until they're uploaded; backend's helper
          // already syncs `variation_image` after upload).
          const firstUrl = imagesArr.find((x) => typeof x === "string") ||
            (imagesArr.find((x) => x && x.url) || {}).url;
          if (typeof firstUrl === "string") {
            fd.append(`${prefix}[variation_image]`, firstUrl);
          }
        } else {
          // Legacy single-image path (admin hasn't touched the new modal yet
          // OR is editing an older variation that only has variation_image).
          const resolvedImage = resolveVariationImage(
            row.variation_image,
            watchedMainImage,
            watchedOtherImages,
          );
          if (resolvedImage instanceof File) {
            fd.append(`${prefix}[variation_image]`, resolvedImage);
          } else if (typeof resolvedImage === "string") {
            fd.append(`${prefix}[variation_image]`, resolvedImage);
          }
        }
        if (row.variation_video instanceof File) {
          fd.append(`${prefix}[variation_video]`, row.variation_video);
        }
      });
    }

    (dataToSubmit?.product_attributes || []).forEach((pa, i) => {
      fd.append(`product_attributes[${i}][attribute_id]`, pa.attribute_id);
      (pa.value_ids || []).forEach((vid, j) =>
        fd.append(`product_attributes[${i}][value_ids][${j}]`, vid),
      );
      // Batch 2 E6 — explicit show_in_filter (default true). Sent always so
      // the backend never has to guess; absent only on legacy clients.
      fd.append(
        `product_attributes[${i}][show_in_filter]`,
        pa.show_in_filter !== false,
      );
    });
    (dataToSubmit?.variant_axes || []).forEach((va, i) => {
      fd.append(`variant_axes[${i}][attribute_id]`, va.attribute_id);
      fd.append(`variant_axes[${i}][is_mandatory]`, va.is_mandatory !== false);
    });
    (dataToSubmit?.attributes_details || []).forEach((att, i) => {
      fd.append(`attributes_details[${i}][attribute_name]`, att?.attribute_name || "");
      (att?.attribute_values || []).forEach((v, j) => {
        fd.append(
          `attributes_details[${i}][attribute_values][${j}][attribute_value_name]`,
          v?.attribute_value_name || "",
        );
        fd.append(
          `attributes_details[${i}][attribute_values][${j}][attribute_value_code]`,
          v?.attribute_value_code || "",
        );
      });
    });

    fd.append("condition", "new"); // UI hides; backend keeps enum

    if (weightGrams !== "" && weightGrams !== null && weightGrams !== undefined)
      fd.append("product_weight_grams", weightGrams);
    if (vatOverride !== "" && vatOverride !== null && vatOverride !== undefined)
      fd.append("vat_percentage_override", vatOverride);
    if (warehouseId) fd.append("warehouse_id", warehouseId);

    fd.append("product_type", productType || "simple");

    appendPhaseFHJsonFields(fd, {
      product_dimensions:
        dimensions && (dimensions.length || dimensions.width || dimensions.height)
          ? dimensions
          : null,
      tier_prices: (tierPrices || []).filter(
        (r) => r.min_qty !== "" && r.price !== "",
      ),
      group_prices: (groupPrices || []).filter((r) => r.price !== ""),
      custom_fields: (customFields || []).filter(
        (r) => r.label?.trim() && r.value?.trim(),
      ),
      // bundle_items only when productType=combo (Update mode)
      bundle_items:
        productType === "combo"
          ? (bundleItems || []).filter(
              (r) => r.product_id && Number(r.quantity) > 0,
            )
          : [],
    });

    // Cleanup empty placeholder values (BUT keep explicit "video_link" empty
    // since we want backend to know we cleared it).
    for (const [k, v] of fd.entries()) {
      if (k === "video_link") continue;
      if (v === "undefined" || v === "null" || v === undefined || v === null || v === "") {
        fd.delete(k);
      }
    }
    return fd;
  };

  const onSubmit = (publish) =>
    handleSubmit(async (form) => {
      if (!category_id) {
        toast.error("Please select a category.");
        return;
      }
      if (!description) {
        toast.error("Description is required.");
        return;
      }
      if (!thumbnailPreview && !thumbnailVideoPreview && !(videoMode === "link" && videoLink)) {
        toast.error("Main image or video is required.");
        return;
      }
      if (!showProductVariation) {
        if (!validateSimpleNumeric(form)) return;
      } else {
        if (inputValueData.length === 0) {
          toast.error("Add at least one variation row (toggle a variation axis).");
          return;
        }
        if (!validateVariationRows()) return;
      }
      if (productType === "combo" && bundleItems.filter((b) => b.product_id).length === 0) {
        toast.error("Combo must include at least one bundle item.");
        return;
      }

      setSubmitting(true);
      try {
        const fd = buildFormData(form, publish);
        // Backend PATCH lives at /product (NOT /product/:id) and reads the id
        // from FormData body field `_id`. Append it before send for update mode.
        if (isUpdate && initialData?._id) {
          fd.append("_id", initialData._id);
        }
        const url = `${BASE_URL}/product`;
        const method = isUpdate ? "PATCH" : "POST";
        const res = await fetch(url, {
          method,
          credentials: "include",
          body: fd,
        });
        const result = await res.json();
        if (result?.statusCode === 200 && result?.success === true) {
          toast.success(
            result?.message || (isUpdate ? "Product updated" : "Product created"),
            { autoClose: 1500 },
          );
          const savedId = result?.data?._id || initialData?._id;
          setPostSaveProductId(savedId);
          if (onSaved) onSaved(savedId);
        } else {
          toast.error(result?.message || "Something went wrong");
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        toast.error("Network error while saving the product.");
      } finally {
        setSubmitting(false);
      }
    })();

  const brandDefault = useMemo(
    () => (brand_id ? { _id: brand_id, brand_name } : null),
    [brand_id, brand_name],
  );

  // Product type options — Combo only available on Update (a brand-new product
  // can't bundle items because it doesn't exist yet, and bundle items must
  // reference existing products).
  const productTypeOptions = isUpdate
    ? [
        { value: "simple", label: "Simple (single SKU)" },
        { value: "variable", label: "Variable (e.g. size / color)" },
        { value: "combo", label: "Combo / Bundle" },
      ]
    : [
        { value: "simple", label: "Simple (single SKU)" },
        { value: "variable", label: "Variable (e.g. size / color)" },
      ];

  if (brandLoading) return <LoaderOverlay />;

  return (
    <form className="space-y-6 pb-28">
      {/* ─── BASIC INFO ─────────────────────────────────────────────────── */}
      <Section title="Basic Info" alwaysOpen>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
          <div>
            <label htmlFor="product_name" className="font-medium">
              Product Name<span className="text-red-500">*</span>
            </label>
            <input
              id="product_name"
              type="text"
              placeholder="Enter Product Name"
              {...register("product_name", { required: "Product Name is required" })}
              className="block w-full p-2.5 mt-2 text-gray-800 bg-white border border-gray-300 rounded-lg outline-primaryColor"
            />
            {errors.product_name && (
              <p className="text-red-600 text-sm">{errors.product_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="font-medium">
              Category<span className="text-red-500">*</span>
            </label>
            <CategoryTreePicker
              value={category_id}
              onChange={(node) => {
                if (!node) {
                  setCategory_id("");
                  setCategory_name("");
                  setCategoryPath([]);
                  return;
                }
                setCategory_id(node._id);
                setCategory_name(node.category_name);
                setCategoryPath([...(node.category_path ?? []), node._id]);
              }}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="brand_id" className="font-medium">Brand</label>
            <Select
              inputId="brand_id"
              isClearable
              defaultValue={brandDefault}
              options={brandData}
              getOptionLabel={(x) => x?.brand_name}
              getOptionValue={(x) => x?._id}
              onChange={(opt) => {
                setBrand_id(opt?._id ?? "");
                setBrand_name(opt?.brand_name ?? "");
              }}
            />
          </div>

          <div>
            <label htmlFor="product_sku" className="font-medium">
              SKU <small className="text-gray-400">(optional)</small>
            </label>
            <input
              id="product_sku"
              type="text"
              placeholder="auto if blank"
              {...register("product_sku")}
              className="block w-full p-2.5 mt-2 bg-white border border-gray-300 rounded-lg outline-primaryColor"
            />
          </div>

          <div>
            <label htmlFor="barcode" className="font-medium">
              Barcode <small className="text-gray-400">(optional)</small>
            </label>
            <div className="flex items-stretch gap-2 mt-2">
              <input
                id="barcode"
                type="text"
                {...register("barcode")}
                className="block w-full p-2.5 bg-white border border-gray-300 rounded-lg outline-primaryColor"
              />
              <button
                type="button"
                onClick={() => setValue("barcode", generateBarcode(), { shouldDirty: true })}
                className="px-3 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg text-sm flex items-center gap-1.5 whitespace-nowrap"
                title="Auto-generate barcode"
              >
                <RiRefreshLine /> Generate
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="unit" className="font-medium">Unit</label>
            <input
              id="unit"
              type="text"
              placeholder="e.g. Pc, Box, kg"
              {...register("unit")}
              className="block w-full p-2.5 mt-2 bg-white border border-gray-300 rounded-lg outline-primaryColor"
            />
          </div>

          <div>
            <label className="font-medium">Trending</label>
            <Select
              isClearable={false}
              defaultValue={
                trending_product
                  ? { value: true, label: "Yes" }
                  : { value: false, label: "No" }
              }
              options={[
                { value: true, label: "Yes" },
                { value: false, label: "No" },
              ]}
              onChange={(opt) => setTrendingProduct(opt?.value)}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="font-medium text-gray-800">
            Description<span className="text-red-500">*</span>
          </label>
          <ReactQuill
            className="mt-2 bg-white"
            theme="snow"
            value={description}
            onChange={setDescription}
            placeholder="Enter product description"
          />
        </div>

        {/* ── Media ── */}
        <div className="border-t pt-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-700">Media</h2>

          {/* Main image */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Main Image<span className="text-red-500">*</span>
            </h3>
            <div className="border-dashed border bg-white border-blue-400 rounded-lg text-center">
              {thumbnailPreview ? (
                <div className="relative inline-block my-2">
                  <img
                    src={thumbnailPreview}
                    alt="thumbnail"
                    className="w-48 h-48 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={removeThumbnail}
                    className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full"
                  >
                    <MdCancel size={20} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center cursor-pointer p-6">
                  <RiImageAddLine className="text-7xl text-gray-400" />
                  <span className="text-gray-500">Upload main image</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleThumbnailChange}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Video — Upload OR Link (single mode) */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Main Video</h3>
            <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden text-sm mb-3">
              <button
                type="button"
                onClick={() => switchVideoMode("upload")}
                className={`px-4 py-2 ${
                  videoMode === "upload"
                    ? "bg-primaryColor text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Upload file
              </button>
              <button
                type="button"
                onClick={() => switchVideoMode("link")}
                className={`px-4 py-2 border-l border-gray-300 ${
                  videoMode === "link"
                    ? "bg-primaryColor text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Paste YouTube / Vimeo link
              </button>
            </div>

            {videoMode === "upload" ? (
              <div className="border-dashed border bg-white border-blue-400 rounded-lg text-center">
                {thumbnailVideoPreview ? (
                  <div className="relative inline-block my-2">
                    <video controls src={thumbnailVideoPreview} className="w-48 h-full" />
                    <button
                      type="button"
                      onClick={removeThumbnailVideo}
                      className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full"
                    >
                      <MdCancel size={20} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center cursor-pointer p-6">
                    <RiVideoAddLine className="text-7xl text-gray-400" />
                    <span className="text-gray-500">Upload video</span>
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={handleThumbnailVideoChange}
                    />
                  </label>
                )}
              </div>
            ) : (
              <input
                type="text"
                value={videoLink}
                onChange={(e) => setVideoLink(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=…"
                className="block w-full p-2.5 bg-white border border-gray-300 rounded-lg outline-primaryColor"
              />
            )}
          </div>

          {/* Other images */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Additional Images</h3>
            <div className="text-center">
              <div className="flex flex-wrap gap-4 justify-center my-3">
                {imagePreviews.map((preview, idx) => (
                  <div key={idx} className="relative border shadow rounded-md">
                    <img
                      src={preview}
                      alt={`preview-${idx}`}
                      className="w-24 h-24 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeOtherImage(idx)}
                      className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full"
                    >
                      <MdCancel />
                    </button>
                  </div>
                ))}
                <label className="w-24 h-24 flex items-center justify-center cursor-pointer bg-white border-dashed border border-blue-400 text-gray-500 rounded-md">
                  <PiImagesThin className="text-3xl" />
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleOtherImagesChange}
                  />
                </label>
              </div>
              <p className="text-gray-400 text-xs">
                JPG, PNG, WebP, GIF — multiple files allowed.
              </p>
            </div>
          </div>

          {/* Size chart */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Size Chart <small className="text-gray-400">(optional)</small>
            </h3>
            <div className="border-dashed border bg-white border-blue-400 rounded-lg text-center">
              {sizeChartPreview ? (
                <div className="relative inline-block my-2">
                  <img
                    src={sizeChartPreview}
                    alt="size chart"
                    className="w-48 h-48 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={removeSizeChart}
                    className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full"
                  >
                    <MdCancel size={20} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center cursor-pointer p-6">
                  <RiImageAddLine className="text-7xl text-gray-400" />
                  <span className="text-gray-500">Upload size chart</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleSizeChartChange}
                  />
                </label>
              )}
            </div>
          </div>
        </div>
      </Section>

      {/* ─── PRODUCT TYPE ──────────────────────────────────────────────── */}
      <Section title="Product Type" alwaysOpen>
        <div className="space-y-3">
          <p className="text-sm text-gray-600">How is this product sold?</p>
          <div className="flex flex-wrap gap-3">
            {productTypeOptions.map((opt) => (
              <label
                key={opt.value}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer ${
                  productType === opt.value
                    ? "border-primaryColor bg-primaryColor/5"
                    : "border-gray-300 bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="product_type"
                  value={opt.value}
                  checked={productType === opt.value}
                  onChange={(e) => {
                    setProductType(e.target.value);
                    if (e.target.value === "variable") setShowProductVariation(true);
                    else if (e.target.value === "simple") setShowProductVariation(false);
                  }}
                />
                <span className="text-sm">{opt.label}</span>
              </label>
            ))}
          </div>
          {!isUpdate && (
            <p className="text-[11px] text-gray-400">
              💡 Combo / Bundle is available on the <strong>Edit Product</strong>{" "}
              page only — bundle items must reference existing products, so create
              this product first, then edit it to add bundle items.
            </p>
          )}
        </div>

        {/* Combo bundle UI — only in update mode (radio-restricted) */}
        {isUpdate && productType === "combo" && (
          <div className="border-t pt-4 mt-4">
            <BundleItemsBlock
              bundleItems={bundleItems}
              setBundleItems={setBundleItems}
              currentProductId={initialData?._id}
            />
          </div>
        )}
      </Section>

      {/* ─── PRICING & STOCK ────────────────────────────────────────────── */}
      <Section
        title="Pricing & Stock"
        alwaysOpen
        infoContent={pricingStockInfo}
        infoTitle="Pricing & Stock — Attributes, Variations, Matrix"
      >
        {!showProductVariation ? (
          <StepOnePrice stepOneData={initialData} register={register} errors={errors} />
        ) : (
          <StepOneBaseContext.Provider value={{ basePrice: watchedBasePrice }}>
            <StepOneVariation
              inputValueData={inputValueData}
              setFormData={setFormData}
              selectedAttributes={selectedAttributes}
              selectedAttributeValues={selectedAttributeValues}
              setSelectedAttributes={setSelectedAttributes}
              setSelectedAttributeValues={setSelectedAttributeValues}
              setDataToSubmit={setDataToSubmit}
              dataToSubmit={dataToSubmit}
              axisById={axisById}
              setAxisById={setAxisById}
              mainImage={watchedMainImage}
              otherImages={watchedOtherImages}
              baseBuyingPrice={watch("product_buying_price")}
              baseDiscountPrice={watch("product_discount_price")}
              initialShowInFilterById={initialShowInFilterById}
              basePriceSlot={
                <section className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 my-4">
                  <p className="text-sm font-semibold text-gray-700 mb-3">
                    Variation base values{" "}
                    <span className="text-[11px] font-normal text-gray-400">
                      (each row in the matrix starts from these defaults)
                    </span>
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="product_price" className="font-medium text-sm">
                        Base price<span className="text-red-500">*</span>
                      </label>
                      <input
                        id="product_price"
                        type="number"
                        min={0}
                        {...register("product_price", { required: true })}
                        placeholder="e.g. 1000"
                        className="block w-full p-2.5 mt-2 bg-white border border-gray-300 rounded-lg outline-primaryColor"
                      />
                      {errors.product_price && (
                        <p className="text-red-600 text-xs">Base price is required</p>
                      )}
                      <p className="text-[11px] text-gray-400 mt-1">
                        Matrix &quot;Final price&quot; = base + per-row delta.
                      </p>
                    </div>
                    <div>
                      <label
                        htmlFor="product_discount_price"
                        className="font-medium text-sm"
                      >
                        Base discount price
                      </label>
                      <input
                        id="product_discount_price"
                        type="number"
                        min={0}
                        {...register("product_discount_price")}
                        placeholder="leave blank if none"
                        className="block w-full p-2.5 mt-2 bg-white border border-gray-300 rounded-lg outline-primaryColor"
                      />
                      <p className="text-[11px] text-gray-400 mt-1">
                        Optional product-level discount shown on PDP before variation pick.
                      </p>
                    </div>
                    <div>
                      <label
                        htmlFor="product_buying_price"
                        className="font-medium text-sm"
                      >
                        Base buying price
                      </label>
                      <input
                        id="product_buying_price"
                        type="number"
                        min={0}
                        {...register("product_buying_price")}
                        placeholder="your cost"
                        className="block w-full p-2.5 mt-2 bg-white border border-gray-300 rounded-lg outline-primaryColor"
                      />
                      <p className="text-[11px] text-gray-400 mt-1">
                        Auto-fills the matrix &quot;Buying price&quot; column for new rows.
                      </p>
                    </div>
                  </div>
                </section>
              }
            />
          </StepOneBaseContext.Provider>
        )}
      </Section>

      {/* ─── ADVANCED — LOGISTICS ──────────────────────────────────────── */}
      <Section
        title="Advanced — Logistics"
        subtitle="Weight, dimensions, warehouse, warranty / return notes. Optional."
        open={advLogOpen}
        setOpen={setAdvLogOpen}
        infoContent={logisticsInfo}
        infoTitle="Advanced — Logistics, Tax & Warranty"
      >
        <StepOneAdvanced
          embedded
          variant="logistics"
          hideVideoLink
          hideCondition
          videoLink={videoLink}
          setVideoLink={setVideoLink}
          condition="new"
          setCondition={() => {}}
          weightGrams={weightGrams}
          setWeightGrams={setWeightGrams}
          vatOverride={vatOverride}
          setVatOverride={setVatOverride}
          warehouseId={warehouseId}
          setWarehouseId={setWarehouseId}
          dimensions={dimensions}
          setDimensions={setDimensions}
          tierPrices={tierPrices}
          setTierPrices={setTierPrices}
          groupPrices={groupPrices}
          setGroupPrices={setGroupPrices}
        />
        {/* Extra warranty / return inputs (kept with logistics for grouping) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div>
            <label htmlFor="product_warrenty" className="font-medium text-sm">
              Warranty note
            </label>
            <input
              id="product_warrenty"
              type="text"
              placeholder="e.g. 1 year manufacturer warranty"
              {...register("product_warrenty")}
              className="block w-full p-2.5 mt-2 bg-white border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label htmlFor="product_return" className="font-medium text-sm">
              Return policy note
            </label>
            <input
              id="product_return"
              type="text"
              placeholder="e.g. Return within 7 days"
              {...register("product_return")}
              className="block w-full p-2.5 mt-2 bg-white border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      </Section>

      {/* ─── ADVANCED — BULK & GROUP PRICING ───────────────────────────── */}
      <Section
        title="Advanced — Bulk & Group Pricing"
        subtitle="Tier pricing (qty-based discount) + per-customer-group pricing. Optional."
        open={advBulkOpen}
        setOpen={setAdvBulkOpen}
        infoContent={bulkPricingInfo}
        infoTitle="Advanced — Bulk & Group Pricing"
      >
        <StepOneAdvanced
          embedded
          variant="bulk"
          videoLink=""
          setVideoLink={() => {}}
          condition="new"
          setCondition={() => {}}
          weightGrams={weightGrams}
          setWeightGrams={setWeightGrams}
          vatOverride={vatOverride}
          setVatOverride={setVatOverride}
          warehouseId={warehouseId}
          setWarehouseId={setWarehouseId}
          dimensions={dimensions}
          setDimensions={setDimensions}
          tierPrices={tierPrices}
          setTierPrices={setTierPrices}
          groupPrices={groupPrices}
          setGroupPrices={setGroupPrices}
        />
      </Section>

      {/* ─── ADVANCED — CUSTOM SPEC ROWS ───────────────────────────────── */}
      <Section
        title="Advanced — Custom Spec Rows"
        subtitle="Free-form rows shown on the PDP beyond the attribute spec table."
        open={advCustomOpen}
        setOpen={setAdvCustomOpen}
        infoContent={customSpecRowsInfo}
        infoTitle="Advanced — Custom Spec Rows"
      >
        <CustomFieldsBlock customFields={customFields} setCustomFields={setCustomFields} />
      </Section>

      {/* ─── ADVANCED — SEO ─────────────────────────────────────────────── */}
      <Section
        title="Advanced — SEO"
        subtitle="Meta tags + keywords for search engines."
        open={advSeoOpen}
        setOpen={setAdvSeoOpen}
        infoContent={seoInfo}
        infoTitle="Advanced — SEO"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="meta_title" className="font-medium">Meta title</label>
            <input
              id="meta_title"
              type="text"
              {...register("meta_title")}
              className="block w-full p-2.5 mt-2 bg-white border border-gray-300 rounded-lg"
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="meta_description" className="font-medium">Meta description</label>
            <textarea
              id="meta_description"
              rows={3}
              {...register("meta_description")}
              className="block w-full p-2.5 mt-2 bg-white border border-gray-300 rounded-lg"
            />
          </div>
          <div className="md:col-span-2">
            <label className="font-medium">Meta keywords</label>
            {keywords.length > 0 && (
              <div className="flex flex-wrap gap-1 bg-white mt-2 rounded-lg py-1 items-center">
                {keywords.map((kw, i) => (
                  <span
                    key={i}
                    className="bg-gray-200 text-black py-1 px-2 mx-1 rounded-full flex items-center"
                  >
                    <span>{kw.keyword}</span>
                    <button
                      type="button"
                      onClick={() => removeKeyword(kw.keyword)}
                      className="ml-2 px-1 bg-gray-400 text-white rounded-full text-xs"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
            <input
              type="text"
              value={inputKeyword}
              onChange={(e) => setInputKeyword(e.target.value)}
              onKeyDown={handleKeywordKey}
              placeholder="Type and press Enter to add"
              className="block w-full p-2.5 mt-2 bg-white border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      </Section>

      {/* ─── POST-SAVE CTA (Add mode only) ──────────────────────────────── */}
      {!isUpdate && postSaveProductId && (
        <div className="border-2 border-primaryColor bg-primaryColor/5 rounded-lg p-5 text-center space-y-3">
          <h3 className="text-lg font-semibold text-textColor">
            ✅ Product saved!
          </h3>
          <p className="text-sm text-gray-600">
            Now configure the themed PDP — theme, hero copy, benefits, FAQ, nutrition,
            floating images.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => navigate(`/product/page-content/${postSaveProductId}`)}
              className="px-5 py-2.5 bg-primaryColor text-white rounded-lg hover:opacity-90 font-semibold"
            >
              ✨ Configure Hero Content →
            </button>
            <button
              type="button"
              onClick={() => navigate("/product/product-list")}
              className="px-5 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              Back to product list
            </button>
          </div>
        </div>
      )}

      {/* ─── STICKY SAVE BAR ───────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] z-40">
        <div className="max-w-screen-2xl mx-auto px-4 py-3 flex justify-end items-center gap-3 flex-wrap">
          {isUpdate && (
            <span className="text-xs text-gray-500 mr-auto">
              Editing: <strong>{initialData?.product_name}</strong>
            </span>
          )}
          {submitting ? (
            <MiniSpinner />
          ) : (
            <>
              <button
                type="button"
                onClick={() => onSubmit(false)}
                className="px-5 py-2.5 bg-yellowColor text-white rounded-lg font-semibold hover:opacity-90"
              >
                {isUpdate ? "Save as Draft" : "Save Draft"}
              </button>
              <button
                type="button"
                onClick={() => onSubmit(true)}
                className="px-5 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:opacity-90"
              >
                Save & Publish
              </button>
            </>
          )}
        </div>
      </div>
    </form>
  );
};

export default ProductForm;
