import { useContext, useEffect, useMemo, useRef, useState } from "react";
import Select from "react-select";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { FiPlus } from "react-icons/fi";
import StepOneVariationTable from "./StepOneVariationTable";
import { BASE_URL } from "../../../utils/baseURL";
import { LoaderOverlay } from "../../common/loader/LoderOverley";
import { generateSlug } from "../../../utils/generateSlug";
import ToggleSwitch from "../sections/ToggleSwitch";
import UpdateAttribute from "../../Attribute/UpdateAttribute";
import { AuthContext } from "../../../context/AuthProvider";

// Phase 2 unified attribute block.
//
// Strict structure inside, tick-and-fill outside:
// 1. Admin picks attributes from a multi-select (no typing — values come from
//    the `attributes` collection).
// 2. For each picked attribute, admin ticks which values apply. Inline "+ Add"
//    PATCHes the attribute on the backend so a new value can be created without
//    leaving the form.
// 3. A per-attribute "Variation axis?" toggle decides which attributes also
//    drive variation combinations (others are spec-only — filter+PDP table only).
//
// Emits THREE shapes on dataToSubmit (single object) so the parent StepOne can
// hand them straight to the backend:
//   - product_attributes[] {attribute_id, value_ids[]}      (Phase-1 model)
//   - variant_axes[]      {attribute_id, is_mandatory:true} (Phase-1 model)
//   - attributes_details[] {attribute_name, attribute_values[]} (legacy snapshot)
//
// The variation combination matrix at the bottom is auto-generated from the
// variant_axes only — spec-only attributes do NOT multiply combinations.

const StepOneVariation = ({
  inputValueData,
  setFormData,
  selectedAttributes,
  setSelectedAttributes,
  selectedAttributeValues,
  setSelectedAttributeValues,
  dataToSubmit,
  setDataToSubmit,
  // Media pool from the parent ProductForm (passed straight through to
  // StepOneVariationTable so each row's "Choose image" modal can reference
  // the product's main_image + other_images without re-uploading).
  mainImage,
  otherImages,
  // Axis toggle map — LIFTED to ProductForm so update-mode can rehydrate from
  // initialData.variant_axes before this component mounts. Falls back to a
  // local state when parent doesn't provide it (add-mode default behaviour).
  axisById: axisByIdProp,
  setAxisById: setAxisByIdProp,
  // Optional JSX slot rendered AFTER the attribute block but BEFORE the matrix
  // — ProductForm uses this to inject the "Variation base price / discount /
  // buying" trio in the visual flow attribute → values → axis → base → matrix.
  basePriceSlot = null,
  // Used by matrix table to seed new rows AND live-propagate to existing rows
  // when the admin edits the product-level base field.
  baseBuyingPrice = "",
  baseDiscountPrice = "",
  // Update-mode rehydration: { attribute_id: boolean } map of saved
  // show_in_filter values. Applied ONCE when present so the toggles reflect
  // what's in the DB.
  initialShowInFilterById = null,
}) => {
  // Lifted-or-local pattern: if parent passes the pair, use them; else manage
  // ourselves (legacy / standalone usage).
  const [axisByIdLocal, setAxisByIdLocal] = useState({});
  const axisById = axisByIdProp ?? axisByIdLocal;
  const setAxisById = setAxisByIdProp ?? setAxisByIdLocal;

  // Batch 2 E6 — per-attribute "Show in filter sidebar?" override. Keyed by
  // attribute_id. Default true (every attribute is filterable unless owner
  // explicitly turns it off). Stored in dataToSubmit.product_attributes[].
  const [showInFilterById, setShowInFilterById] = useState({});
  const showInFilterHydratedRef = useRef(false);
  useEffect(() => {
    if (showInFilterHydratedRef.current) return;
    if (initialShowInFilterById && Object.keys(initialShowInFilterById).length > 0) {
      setShowInFilterById(initialShowInFilterById);
      showInFilterHydratedRef.current = true;
    }
  }, [initialShowInFilterById]);
  const toggleShowInFilter = (attributeId) => {
    setShowInFilterById((prev) => ({
      ...prev,
      [attributeId]: prev[attributeId] === false ? true : false,
    }));
  };

  // Inline "+ Add value" — opens the FULL UpdateAttribute modal so the admin
  // gets all-in-one: add new values, edit existing names / hex codes, toggle
  // status, delete unused ones. (Previously a separate mini-modal existed for
  // quick-add; consolidated since the full editor covers everything.)
  const [editAttrFor, setEditAttrFor] = useState(null);
  const { user } = useContext(AuthContext);

  const { data: attributesRes = {}, isLoading, refetch } = useQuery({
    queryKey: ["/api/v1/attribute"],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/attribute`, { credentials: "include" });
      return res.json();
    },
  });

  const attributes = attributesRes?.data ?? [];

  // attribute multi-select change — preserve already-ticked values when an
  // attribute is re-picked. NEW attributes default to axis=ON because the
  // user already chose product_type=variable, so they almost always want the
  // matrix. Admin can still toggle OFF for spec-only attributes.
  const handleAttributeChange = (selectedOptions) => {
    const next = selectedOptions || [];
    const previousIds = new Set((selectedAttributes || []).map((a) => a?._id));
    const nextValues = next.map((attr) => {
      const existing = selectedAttributes?.findIndex(
        (a) => a?._id === attr?._id,
      );
      return existing >= 0 ? selectedAttributeValues[existing] : [];
    });
    setSelectedAttributes(next);
    setSelectedAttributeValues(nextValues);
    // Auto-enable axis for any newly-added attribute.
    setAxisById((prev) => {
      const updated = { ...prev };
      next.forEach((attr) => {
        if (!previousIds.has(attr?._id) && updated[attr?._id] === undefined) {
          updated[attr?._id] = true;
        }
      });
      return updated;
    });
  };

  const handleValueChange = (index, selectedOptions) => {
    const next = [...selectedAttributeValues];
    next[index] = selectedOptions || [];
    setSelectedAttributeValues(next);
  };

  const toggleAxis = (attributeId) => {
    const currentlyOn = !!axisById[attributeId];
    // Warn before turning OFF if a matrix already exists — turning off this
    // axis will collapse the row set and any data on rows that no longer
    // match will be lost. (Existing variation row data IS preserved by the
    // matching-key reuse logic; admin still deserves a heads-up.)
    if (currentlyOn && (inputValueData || []).length > 1) {
      const onCount = Object.values(axisById).filter(Boolean).length;
      if (onCount > 1) {
        const ok = window.confirm(
          "Turning this axis OFF will shrink the variation matrix. " +
            "Rows that don't match a remaining combination will be DROPPED. Continue?",
        );
        if (!ok) return;
      }
    }
    // IMPORTANT: only flip axisById. selectedAttributeValues stays intact so
    // the attribute remains a spec-only entry (still saved into product_attributes
    // + attributes_details, still appears on PDP spec table + filter sidebar).
    setAxisById((prev) => ({ ...prev, [attributeId]: !prev[attributeId] }));
  };

  // Don't show already-picked attributes in the picker.
  const availableOptions = useMemo(() => {
    const taken = new Set(selectedAttributes?.map((a) => a?._id));
    return attributes.filter((a) => !taken.has(a?._id));
  }, [attributes, selectedAttributes]);

  // (Inline mini "+Add value" handler removed — the UI now uses the full
  // UpdateAttribute modal which does the PATCH itself.)


  // ── Build dataToSubmit whenever selection or axis toggles change ─────────
  useEffect(() => {
    const product_attributes = selectedAttributes.map((attr, i) => ({
      attribute_id: attr?._id,
      value_ids: (selectedAttributeValues[i] || []).map((v) => v?._id),
      // Default true unless the owner explicitly turned this attribute OFF
      // for the storefront filter sidebar. (Backend schema default also true.)
      show_in_filter: showInFilterById[attr?._id] !== false,
    }));

    const variant_axes = selectedAttributes
      .filter((attr) => axisById[attr?._id])
      .map((attr) => ({ attribute_id: attr?._id, is_mandatory: true }));

    // Legacy free-text snapshot for backward-compat (admin search/list etc.)
    const attributes_details = selectedAttributes.map((attr, i) => ({
      _id: attr?._id,
      attribute_name: attr?.attribute_name,
      attribute_values: selectedAttributeValues[i] || [],
    }));

    setDataToSubmit({
      product_attributes,
      variant_axes,
      attributes_details,
    });
  }, [selectedAttributes, selectedAttributeValues, axisById, showInFilterById, setDataToSubmit]);

  if (isLoading) return <LoaderOverlay />;

  // The variation table needs ONLY the variant-axis attributes (so spec-only
  // attrs don't multiply combinations). Pass the legacy attributes_details
  // shape it already understands — but filtered to axes only.
  const axisOnlyForMatrix = (dataToSubmit?.attributes_details || []).filter(
    (a) => axisById[a._id],
  );

  return (
    <div>
      <section className="max-w-4xl mx-auto shadow-md bg-gray-50  px-2 py-4 sm:py-6 rounded-lg  sm:px-6  mb-10 ">
        <p className="text-2xl md:text-3xl font-semibold text-gray-700 mb-6">
          Attributes &amp; Variation
        </p>

        {/* Attribute picker — multi-keep-open so admin doesn't have to reopen
            the dropdown for every pick. blurInputOnSelect=false keeps the
            input focused. */}
        <div className="flex items-center gap-3 flex-wrap ">
          <p className="font-semibold text-gray-700">Attribute</p>
          <div className="flex-1">
            <Select
              id="attribute_id"
              name="attribute_id"
              required
              aria-label="Pick attributes"
              options={availableOptions}
              getOptionLabel={(x) => x?.attribute_name}
              getOptionValue={(x) => x?._id}
              isClearable
              isMulti
              closeMenuOnSelect={false}
              blurInputOnSelect={false}
              hideSelectedOptions={false}
              onChange={handleAttributeChange}
              value={selectedAttributes}
            />
          </div>
        </div>

        <p className="text-gray-600 text-sm mt-4">
          Tick the values that apply, and turn on the toggle for the attributes
          that should also create variations (price/stock per combination).
          Others stay as spec-only (shown on the PDP table + filter sidebar).
        </p>

        <div className="space-y-6 mt-4">
          {selectedAttributes?.length > 0 &&
            selectedAttributes?.map((attr, index) => {
              const isAxis = !!axisById[attr?._id];
              return (
                <div
                  key={attr?._id}
                  className={`bg-white rounded border p-3 ${
                    isAxis ? "border-primaryColor/40" : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-700">
                        {attr?.attribute_name}
                      </p>
                      {!isAxis && (
                        <span
                          className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full"
                          title="Spec-only — shows on PDP spec table + filter sidebar, no separate variations"
                        >
                          Spec-only
                        </span>
                      )}
                      {isAxis && (
                        <span
                          className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full"
                          title="Variation axis — each value creates its own purchasable variation"
                        >
                          Axis
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setEditAttrFor(attr)}
                        className="text-sm text-primaryColor hover:opacity-80 flex items-center gap-1"
                        title="Add new values OR edit existing ones (name, hex code, status)"
                      >
                        <FiPlus /> Add value
                      </button>
                      <ToggleSwitch
                        checked={isAxis}
                        onChange={() => toggleAxis(attr?._id)}
                        label="Variation axis"
                        size="sm"
                      />
                      <ToggleSwitch
                        checked={showInFilterById[attr?._id] !== false}
                        onChange={() => toggleShowInFilter(attr?._id)}
                        label="Show in filter"
                        size="sm"
                      />
                    </div>
                  </div>
                  <Select
                    aria-label={`${attr?.attribute_name} values`}
                    options={attr?.attribute_values || []}
                    getOptionLabel={(x) => x?.attribute_value_name}
                    getOptionValue={(x) => x?._id}
                    isClearable
                    isMulti
                    closeMenuOnSelect={false}
                    blurInputOnSelect={false}
                    hideSelectedOptions={false}
                    onChange={(opts) => handleValueChange(index, opts)}
                    value={selectedAttributeValues[index]}
                    // Render an hex-color swatch beside the value name when the
                    // attribute is colour-like (any value carries a hex code).
                    formatOptionLabel={(v) => (
                      <span className="inline-flex items-center gap-2">
                        {v?.attribute_value_code && (
                          <span
                            className="inline-block w-4 h-4 rounded-full border border-gray-300"
                            style={{ backgroundColor: v.attribute_value_code }}
                            title={v.attribute_value_code}
                          />
                        )}
                        <span>{v?.attribute_value_name}</span>
                        {v?.attribute_value_code && (
                          <span className="text-[10px] text-gray-400 ml-1">
                            {v.attribute_value_code}
                          </span>
                        )}
                      </span>
                    )}
                  />
                </div>
              );
            })}
        </div>

        {/* Inline "Add value" — full UpdateAttribute modal so admin can
            add NEW values, edit existing names / hex codes, toggle status,
            delete unused ones. On save, the attribute query is refetched so
            the new values appear immediately in the dropdown. */}
        {editAttrFor && (
          <UpdateAttribute
            setOpenAttributeUpdateModal={() => setEditAttrFor(null)}
            attributeUpdateValue={editAttrFor}
            refetch={refetch}
            user={user}
            title={`Add / Update Values: ${editAttrFor?.attribute_name || ""}`}
          />
        )}

      </section>

      {/* Base price card injected by ProductForm — sits between attribute
          block and the matrix so the flow reads top-to-bottom:
          attribute → values → axis → base prices → matrix. */}
      {basePriceSlot}

      {/* Variation combination matrix — only over the variant_axes. */}
      {axisOnlyForMatrix.length > 0 && (
        <StepOneVariationTable
          data={axisOnlyForMatrix}
          inputValueData={inputValueData}
          setFormData={setFormData}
          mainImage={mainImage}
          otherImages={otherImages}
          baseBuyingPrice={baseBuyingPrice}
          baseDiscountPrice={baseDiscountPrice}
        />
      )}
    </div>
  );
};

export default StepOneVariation;
