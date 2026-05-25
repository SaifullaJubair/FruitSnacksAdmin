import { useContext, useEffect, useMemo, useState } from "react";
import { StepOneBaseContext } from "./StepOneBaseContext";

// Phase 2 combination matrix.
//
// Auto-generates one row per combination of value picks across the *variant
// axes only*. Each row emits BOTH the new combination shape AND the legacy
// variation fields, so the additive migration (Phase 1 plan) doesn't break
// cart/order/courier until they migrate to the resolver.
//
// Row payload:
//   { combination:[sorted value_ids],          // Phase-1 new shape (D2)
//     variation_price_delta, is_active,        // Phase-1 new shape
//     variation_name, variation_price,         // legacy (computed from base+delta)
//     variation_quantity, variation_sku,       // legacy
//     variation_image, variation_video }
//
// Final price column = base + delta, read-only, recomputes live from the base
// price the admin typed in StepOnePrice (via StepOneBaseContext).

const cartesian = (arrays) => {
  if (arrays.length === 0) return [[]];
  const [first, ...rest] = arrays;
  const tail = cartesian(rest);
  return first.flatMap((item) => tail.map((combo) => [item, ...combo]));
};

const StepOneVariationTable = ({ data, inputValueData, setFormData }) => {
  // Base price = the product-level price entered in StepOnePrice. We read it
  // from a context (falling back to 0 if context is absent) so we can render
  // the final-price calc without prop-drilling through StepOne.
  const ctx = useContext(StepOneBaseContext);
  const basePrice = Number(ctx?.basePrice) || 0;

  const combinations = useMemo(() => {
    const axes = data?.map((attr) => attr?.attribute_values) || [];
    return cartesian(axes);
  }, [data]);

  // Re-seed inputValueData whenever the axis set (or its values) changes.
  const [lastShape, setLastShape] = useState(null);
  useEffect(() => {
    const shape = JSON.stringify(
      data?.map((a) => [a._id, (a.attribute_values || []).map((v) => v._id)]),
    );
    if (shape === lastShape) return;
    const seeded = combinations.map((combo) => {
      // sorted value_ids — D2 invariant for combination lookup stability.
      const value_ids = combo.map((v) => v?._id).sort();
      const variation_name = combo
        .map((v) => v?.attribute_value_name)
        .join(" / ");
      const sku = combo
        .map((v) => v?.attribute_value_name?.toLowerCase())
        .join("-");
      return {
        // NEW shape
        combination: value_ids,
        variation_price_delta: 0,
        is_active: true,
        // LEGACY (additive)
        variation_name,
        variation_price: basePrice,
        variation_discount_price: 0,
        variation_buying_price: 0,
        variation_quantity: 1,
        variation_alert_quantity: 0,
        variation_sku: sku,
        variation_image: null,
        variation_video: null,
      };
    });
    setFormData(seeded);
    setLastShape(shape);
  }, [combinations, data, lastShape, basePrice, setFormData]);

  const updateRow = (idx, field, value) => {
    const next = [...inputValueData];
    next[idx] = { ...next[idx], [field]: value };
    // keep variation_price (legacy) in sync with base+delta so old consumers
    // (cart/order/courier) still see a coherent absolute price.
    if (field === "variation_price_delta") {
      const delta = Number(value) || 0;
      next[idx].variation_price = basePrice + delta;
    }
    setFormData(next);
  };

  // Bulk apply
  const [bulkDelta, setBulkDelta] = useState(0);
  const [bulkQty, setBulkQty] = useState(1);
  const applyBulk = () => {
    const delta = Number(bulkDelta) || 0;
    const qty = Number(bulkQty);
    setFormData(
      inputValueData.map((row) => ({
        ...row,
        variation_price_delta: delta,
        variation_price: basePrice + delta,
        variation_quantity: Number.isFinite(qty) ? qty : row.variation_quantity,
      })),
    );
  };

  return (
    <>
      <div className="mb-4">
        <h3 className="font-semibold my-2">Bulk apply</h3>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col text-sm">
            <span className="text-gray-600 mb-1">Price delta (+/−)</span>
            <input
              type="number"
              value={bulkDelta}
              onChange={(e) => setBulkDelta(e.target.value)}
              className="p-2 border rounded-md outline-primaryColor w-32"
            />
          </label>
          <label className="flex flex-col text-sm">
            <span className="text-gray-600 mb-1">Stock</span>
            <input
              type="number"
              min={0}
              value={bulkQty}
              onChange={(e) => setBulkQty(e.target.value)}
              className="p-2 border rounded-md outline-primaryColor w-32"
            />
          </label>
          <button
            type="button"
            onClick={applyBulk}
            className="px-4 py-2 bg-primaryColor text-white rounded-md hover:opacity-90"
          >
            Apply to all
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200">
        <div className="overflow-x-auto scrollbar-thin scrollbar-hide">
          <table className="w-full divide-y-2 divide-gray-200 bg-white text-sm">
            <thead className="bg-[#fff9ee]">
              <tr className="divide-x divide-gray-300 font-semibold text-center text-gray-900">
                <td className="whitespace-nowrap px-4 py-3">#</td>
                <td className="whitespace-nowrap px-4 py-3">Combination</td>
                <td className="whitespace-nowrap px-4 py-3">Price delta</td>
                <td className="whitespace-nowrap px-4 py-3">Final price</td>
                <td className="whitespace-nowrap px-4 py-3">Buying price</td>
                <td className="whitespace-nowrap px-4 py-3">Stock</td>
                <td className="whitespace-nowrap px-4 py-3">Active</td>
                <td className="whitespace-nowrap px-4 py-3">Image</td>
              </tr>
            </thead>
            <tbody>
              {combinations?.map((combo, idx) => {
                const row = inputValueData?.[idx] || {};
                const finalPrice = basePrice + (Number(row.variation_price_delta) || 0);
                return (
                  <tr
                    key={idx}
                    className={`divide-x divide-gray-200 ${
                      idx % 2 === 0 ? "bg-white" : "bg-tableRowBGColor"
                    }`}
                  >
                    <td className="py-1.5 text-center font-medium text-gray-700">
                      {idx + 1}
                    </td>
                    <td className="py-1.5 text-center font-medium text-gray-700">
                      {combo.map((v) => v?.attribute_value_name).join(" / ")}
                    </td>
                    <td className="py-1.5 text-center">
                      <input
                        type="number"
                        value={row.variation_price_delta ?? 0}
                        onChange={(e) =>
                          updateRow(idx, "variation_price_delta", e.target.value)
                        }
                        className="p-1.5 border rounded-md text-center w-24"
                      />
                    </td>
                    <td className="py-1.5 text-center text-gray-700">
                      ৳ {finalPrice}
                    </td>
                    <td className="py-1.5 text-center">
                      <input
                        type="number"
                        min={0}
                        value={row.variation_buying_price ?? 0}
                        onChange={(e) =>
                          updateRow(idx, "variation_buying_price", e.target.value)
                        }
                        className="p-1.5 border rounded-md text-center w-24"
                      />
                    </td>
                    <td className="py-1.5 text-center">
                      <input
                        type="number"
                        min={0}
                        value={row.variation_quantity ?? 0}
                        onChange={(e) =>
                          updateRow(idx, "variation_quantity", e.target.value)
                        }
                        className="p-1.5 border rounded-md text-center w-20"
                      />
                    </td>
                    <td className="py-1.5 text-center">
                      <label className="inline-flex cursor-pointer">
                        <input
                          type="checkbox"
                          className="hidden peer"
                          checked={row.is_active !== false}
                          onChange={(e) => updateRow(idx, "is_active", e.target.checked)}
                        />
                        <span className="relative">
                          <span className="block w-9 h-4 rounded-full bg-slate-300 peer-checked:bg-bgBtnActive"></span>
                          <span className="absolute -inset-y-1 left-0 w-6 h-6 rounded-full bg-white shadow ring-1 ring-gray-300 peer-checked:left-auto peer-checked:right-0 peer-checked:bg-primaryColor"></span>
                        </span>
                      </label>
                    </td>
                    <td className="py-1.5 text-center">
                      <input
                        type="file"
                        accept="image/*,.gif"
                        className="hidden"
                        id={`var-img-${idx}`}
                        onChange={(e) =>
                          updateRow(idx, "variation_image", e.target.files[0])
                        }
                      />
                      <label
                        htmlFor={`var-img-${idx}`}
                        className="px-2 py-1 border rounded cursor-pointer text-xs"
                      >
                        {row.variation_image?.name
                          ? row.variation_image.name.slice(0, 18) + "…"
                          : "Choose"}
                      </label>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-2">
        Final price = product base price + this row&apos;s delta. Toggle a row off
        to hide that combination without deleting it.
      </p>
    </>
  );
};

export default StepOneVariationTable;
