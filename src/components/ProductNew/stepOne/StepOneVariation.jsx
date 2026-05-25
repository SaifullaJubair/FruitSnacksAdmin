import { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { FiPlus } from "react-icons/fi";
import StepOneVariationTable from "./StepOneVariationTable";
import { BASE_URL } from "../../../utils/baseURL";
import { LoaderOverlay } from "../../common/loader/LoderOverley";
import { generateSlug } from "../../../utils/generateSlug";

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
}) => {
  // ── Per-attribute "is this a variation axis?" toggle ─────────────────────
  // Keyed by attribute _id so it survives re-ordering / re-pick.
  const [axisById, setAxisById] = useState({});

  // ── Inline "+ Add value" modal state ─────────────────────────────────────
  // null when closed; { attribute } when open against a specific attribute.
  const [addValueFor, setAddValueFor] = useState(null);
  const [newValueName, setNewValueName] = useState("");
  const [addingValue, setAddingValue] = useState(false);

  const { data: attributesRes = {}, isLoading, refetch } = useQuery({
    queryKey: ["/api/v1/attribute"],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/attribute`, { credentials: "include" });
      return res.json();
    },
  });

  const attributes = attributesRes?.data ?? [];

  // attribute multi-select change — preserve already-ticked values when an
  // attribute is re-picked.
  const handleAttributeChange = (selectedOptions) => {
    const next = selectedOptions || [];
    const nextValues = next.map((attr) => {
      const existing = selectedAttributes?.findIndex(
        (a) => a?._id === attr?._id,
      );
      return existing >= 0 ? selectedAttributeValues[existing] : [];
    });
    setSelectedAttributes(next);
    setSelectedAttributeValues(nextValues);
  };

  const handleValueChange = (index, selectedOptions) => {
    const next = [...selectedAttributeValues];
    next[index] = selectedOptions || [];
    setSelectedAttributeValues(next);
  };

  const toggleAxis = (attributeId) => {
    setAxisById((prev) => ({ ...prev, [attributeId]: !prev[attributeId] }));
  };

  // Don't show already-picked attributes in the picker.
  const availableOptions = useMemo(() => {
    const taken = new Set(selectedAttributes?.map((a) => a?._id));
    return attributes.filter((a) => !taken.has(a?._id));
  }, [attributes, selectedAttributes]);

  // ── Inline +Add value: PATCH the attribute with [...existing, new] ───────
  const handleAddValue = async () => {
    if (!addValueFor || !newValueName.trim()) return;
    const attribute = addValueFor;
    const trimmedName = newValueName.trim();
    const newSlug = generateSlug(trimmedName);

    // duplicate guard (frontend mirror of backend check)
    if (
      attribute.attribute_values?.some(
        (v) =>
          v.attribute_value_slug === newSlug ||
          v.attribute_value_name === trimmedName,
      )
    ) {
      toast.error("This value already exists on the attribute.");
      return;
    }

    setAddingValue(true);
    try {
      const body = {
        _id: attribute._id,
        attribute_name: attribute.attribute_name,
        attribute_slug: attribute.attribute_slug,
        attribute_status: attribute.attribute_status,
        attribute_values: [
          ...(attribute.attribute_values ?? []),
          {
            attribute_value_name: trimmedName,
            attribute_value_slug: newSlug,
            attribute_value_status: "active",
          },
        ],
      };
      const res = await fetch(`${BASE_URL}/attribute`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const result = await res.json();
      if (result?.statusCode === 200 && result?.success === true) {
        toast.success("Value added", { autoClose: 1200 });
        setNewValueName("");
        setAddValueFor(null);
        await refetch();
      } else {
        toast.error(result?.message || "Failed to add value");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setAddingValue(false);
    }
  };

  // ── Build dataToSubmit whenever selection or axis toggles change ─────────
  useEffect(() => {
    const product_attributes = selectedAttributes.map((attr, i) => ({
      attribute_id: attr?._id,
      value_ids: (selectedAttributeValues[i] || []).map((v) => v?._id),
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
  }, [selectedAttributes, selectedAttributeValues, axisById, setDataToSubmit]);

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

        {/* Attribute picker */}
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
                  className="bg-white rounded border border-gray-200 p-3"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                    <p className="font-semibold text-gray-700">
                      {attr?.attribute_name}
                    </p>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setAddValueFor(attr)}
                        className="text-sm text-primaryColor hover:opacity-80 flex items-center gap-1"
                      >
                        <FiPlus /> Add value
                      </button>
                      <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          className="hidden peer"
                          checked={isAxis}
                          onChange={() => toggleAxis(attr?._id)}
                        />
                        <span className="relative">
                          <span className="block w-9 h-4 rounded-full bg-slate-300 peer-checked:bg-bgBtnActive"></span>
                          <span className="absolute -inset-y-1 left-0 w-6 h-6 rounded-full bg-white shadow ring-1 ring-gray-300 peer-checked:left-auto peer-checked:right-0 peer-checked:bg-primaryColor"></span>
                        </span>
                        <span className="text-gray-700">Variation axis</span>
                      </label>
                    </div>
                  </div>
                  <Select
                    aria-label={`${attr?.attribute_name} values`}
                    options={attr?.attribute_values || []}
                    getOptionLabel={(x) => x?.attribute_value_name}
                    getOptionValue={(x) => x?._id}
                    isClearable
                    isMulti
                    onChange={(opts) => handleValueChange(index, opts)}
                    value={selectedAttributeValues[index]}
                  />
                </div>
              );
            })}
        </div>

        {/* Inline "+ Add value" modal */}
        {addValueFor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg shadow-xl w-[420px] p-5">
              <h4 className="text-lg font-semibold text-gray-800 mb-1">
                Add value to: {addValueFor.attribute_name}
              </h4>
              <p className="text-xs text-gray-500 mb-4">
                The new value will be added to the attribute and available across
                all products.
              </p>
              <input
                type="text"
                autoFocus
                value={newValueName}
                onChange={(e) => setNewValueName(e.target.value)}
                placeholder="e.g. 256GB, Red, Large"
                className="w-full p-2.5 border border-gray-300 rounded-lg outline-primaryColor"
              />
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setAddValueFor(null);
                    setNewValueName("");
                  }}
                  className="px-4 py-2 rounded border hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddValue}
                  disabled={addingValue || !newValueName.trim()}
                  className="px-4 py-2 rounded bg-primaryColor text-white disabled:opacity-50"
                >
                  {addingValue ? "Adding…" : "Add"}
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Variation combination matrix — only over the variant_axes. */}
      {axisOnlyForMatrix.length > 0 && (
        <StepOneVariationTable
          data={axisOnlyForMatrix}
          inputValueData={inputValueData}
          setFormData={setFormData}
        />
      )}
    </div>
  );
};

export default StepOneVariation;
