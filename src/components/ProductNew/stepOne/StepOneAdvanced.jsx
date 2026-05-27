/**
 * StepOneAdvanced — Phase F + H product fields.
 *
 * Owned state (all lifted from StepOne so handleDataPost can include them):
 *   - video_link, condition, product_weight_grams, vat_percentage_override,
 *     warehouse_id  → simple scalars
 *   - product_dimensions { length, width, height } → object
 *   - tier_prices [{ min_qty, price }] → array
 *   - group_prices [{ group, price }] → array
 *
 * Designed to look like a "collapsible" advanced block so the main form
 * stays readable for shops that don't use these fields. Toggle defaults
 * open if any field has data (e.g. on Update).
 */

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FaPlus, FaTrash, FaChevronDown, FaChevronRight } from "react-icons/fa";
import Select from "react-select";
import { BASE_URL } from "../../../utils/baseURL";

const EMPTY_TIER = { min_qty: "", price: "" };
const EMPTY_GROUP = { group: "wholesale", price: "" };

const StepOneAdvanced = ({
  // basic scalars
  videoLink,
  setVideoLink,
  condition,
  setCondition,
  weightGrams,
  setWeightGrams,
  vatOverride,
  setVatOverride,
  warehouseId,
  setWarehouseId,
  // object
  dimensions,
  setDimensions,
  // arrays
  tierPrices,
  setTierPrices,
  groupPrices,
  setGroupPrices,
}) => {
  const [open, setOpen] = useState(false);

  // Auto-open if any field on mount has a value (e.g. ProductUpdate prefill).
  useEffect(() => {
    const has =
      videoLink ||
      (condition && condition !== "new") ||
      weightGrams ||
      vatOverride ||
      warehouseId ||
      (dimensions &&
        (dimensions.length || dimensions.width || dimensions.height)) ||
      (Array.isArray(tierPrices) && tierPrices.length) ||
      (Array.isArray(groupPrices) && groupPrices.length);
    if (has) setOpen(true);
    // intentionally run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Warehouse list — only fetched once the section is open.
  const { data: warehousesResp = {} } = useQuery({
    queryKey: ["/api/v1/warehouse?limit=200"],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/warehouse?page=1&limit=200`, {
        credentials: "include",
      });
      if (!res.ok) return { data: [] };
      return res.json();
    },
    enabled: open,
  });

  const warehouseOptions = useMemo(
    () =>
      (warehousesResp?.data || []).map((w) => ({
        value: w._id,
        label: `${w.name}${w.code ? ` — ${w.code}` : ""}${
          w.is_default ? " (default)" : ""
        }`,
      })),
    [warehousesResp],
  );
  const selectedWarehouse =
    warehouseOptions.find((o) => o.value === warehouseId) || null;

  // ── dimension helpers
  const setDim = (k, v) =>
    setDimensions({ ...(dimensions || {}), [k]: v });

  // ── tier helpers
  const addTier = () =>
    setTierPrices([...(tierPrices || []), { ...EMPTY_TIER }]);
  const updateTier = (i, k, v) =>
    setTierPrices(
      (tierPrices || []).map((r, idx) => (idx === i ? { ...r, [k]: v } : r)),
    );
  const removeTier = (i) =>
    setTierPrices((tierPrices || []).filter((_, idx) => idx !== i));

  // ── group helpers
  const addGroup = () =>
    setGroupPrices([...(groupPrices || []), { ...EMPTY_GROUP }]);
  const updateGroup = (i, k, v) =>
    setGroupPrices(
      (groupPrices || []).map((r, idx) => (idx === i ? { ...r, [k]: v } : r)),
    );
  const removeGroup = (i) =>
    setGroupPrices((groupPrices || []).filter((_, idx) => idx !== i));

  return (
    <section className="shadow-md bg-gray-50 rounded-lg p-4 sm:p-6 md:p-8">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between"
      >
        <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-textColor">
          Advanced — Logistics, Tax & Pricing
        </h1>
        <span className="text-gray-500">
          {open ? <FaChevronDown size={18} /> : <FaChevronRight size={18} />}
        </span>
      </button>
      <p className="text-xs text-gray-500 mt-1">
        Optional. Phase F + H fields — leave blank to use site-wide defaults.
      </p>

      {open && (
        <div className="mt-6 space-y-8">
          {/* ── Logistics & Tax (A2a) ─────────────────────────────── */}
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
              Logistics & Tax
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-6">
              {/* Video link */}
              <div>
                <label className="font-medium text-sm">Video link (YouTube/Vimeo)</label>
                <input
                  type="text"
                  value={videoLink || ""}
                  onChange={(e) => setVideoLink(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=…"
                  className="block w-full p-2.5 mt-2 text-gray-800 bg-white border border-gray-300 rounded-lg"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Additional to the main_video upload — embeds alongside it on PDP.
                </p>
              </div>

              {/* Condition */}
              <div>
                <label className="font-medium text-sm">Condition</label>
                <select
                  value={condition || "new"}
                  onChange={(e) => setCondition(e.target.value)}
                  className="block w-full p-2.5 mt-2 bg-white border border-gray-300 rounded-lg"
                >
                  <option value="new">New</option>
                  <option value="used">Used</option>
                  <option value="refurbished">Refurbished</option>
                </select>
              </div>

              {/* Weight */}
              <div>
                <label className="font-medium text-sm">Weight (grams)</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={weightGrams ?? ""}
                  onChange={(e) => setWeightGrams(e.target.value)}
                  placeholder="500"
                  className="block w-full p-2.5 mt-2 bg-white border border-gray-300 rounded-lg"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Used by courier weight calc. Variations may override.
                </p>
              </div>

              {/* VAT override */}
              <div>
                <label className="font-medium text-sm">VAT override (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step="0.01"
                  value={vatOverride ?? ""}
                  onChange={(e) => setVatOverride(e.target.value)}
                  placeholder="(uses site default)"
                  className="block w-full p-2.5 mt-2 bg-white border border-gray-300 rounded-lg"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Beats site VAT when greater than 0. Leave blank/0 to inherit.
                </p>
              </div>

              {/* Dimensions */}
              <div className="md:col-span-2">
                <label className="font-medium text-sm">Dimensions (cm)</label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {[
                    ["length", "L"],
                    ["width", "W"],
                    ["height", "H"],
                  ].map(([k, lbl]) => (
                    <div key={k}>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={dimensions?.[k] ?? ""}
                        onChange={(e) => setDim(k, e.target.value)}
                        placeholder={lbl}
                        className="block w-full p-2.5 bg-white border border-gray-300 rounded-lg"
                      />
                      <p className="text-[10px] text-gray-400 mt-1 text-center">{lbl}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Warehouse */}
              <div className="md:col-span-2">
                <label className="font-medium text-sm">Warehouse</label>
                <Select
                  isClearable
                  options={warehouseOptions}
                  value={selectedWarehouse}
                  onChange={(opt) => setWarehouseId(opt?.value || "")}
                  placeholder="(uses default warehouse)"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Where this product is stocked. Manage warehouses under{" "}
                  <code>Warehouses</code> in the sidebar.
                </p>
              </div>
            </div>
          </div>

          {/* ── Bulk & Group Pricing (A2b) ────────────────────────── */}
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
              Bulk & Group Pricing
            </h2>

            {/* Tier prices */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Tier prices</p>
                  <p className="text-[11px] text-gray-400">
                    Bulk discount — when buyer's qty ≥ min_qty, the lowest matching
                    tier wins.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addTier}
                  className="px-3 py-1.5 text-xs bg-primaryColor text-white rounded-lg hover:bg-blue-500 flex items-center gap-1.5"
                >
                  <FaPlus size={10} /> Add tier
                </button>
              </div>

              {(!tierPrices || tierPrices.length === 0) && (
                <p className="text-xs text-gray-400 italic">No tiers yet.</p>
              )}

              <div className="space-y-2">
                {(tierPrices || []).map((r, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-12 gap-3 items-end bg-white p-3 rounded border border-gray-200"
                  >
                    <div className="col-span-5">
                      <label className="text-[11px] font-medium text-gray-600">
                        Min qty
                      </label>
                      <input
                        type="number"
                        min={1}
                        step={1}
                        value={r.min_qty}
                        onChange={(e) => updateTier(i, "min_qty", e.target.value)}
                        placeholder="5"
                        className="w-full p-2 mt-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div className="col-span-6">
                      <label className="text-[11px] font-medium text-gray-600">
                        Price at this tier
                      </label>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={r.price}
                        onChange={(e) => updateTier(i, "price", e.target.value)}
                        placeholder="250"
                        className="w-full p-2 mt-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div className="col-span-1 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => removeTier(i)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Remove tier"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Group prices */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Group prices</p>
                  <p className="text-[11px] text-gray-400">
                    Wholesale / VIP pricing — applied only when the buyer's{" "}
                    <code>customer_group</code> matches.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addGroup}
                  className="px-3 py-1.5 text-xs bg-primaryColor text-white rounded-lg hover:bg-blue-500 flex items-center gap-1.5"
                >
                  <FaPlus size={10} /> Add group price
                </button>
              </div>

              {(!groupPrices || groupPrices.length === 0) && (
                <p className="text-xs text-gray-400 italic">No group prices yet.</p>
              )}

              <div className="space-y-2">
                {(groupPrices || []).map((r, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-12 gap-3 items-end bg-white p-3 rounded border border-gray-200"
                  >
                    <div className="col-span-5">
                      <label className="text-[11px] font-medium text-gray-600">
                        Group
                      </label>
                      <select
                        value={r.group}
                        onChange={(e) => updateGroup(i, "group", e.target.value)}
                        className="w-full p-2 mt-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="wholesale">Wholesale</option>
                        <option value="vip">VIP</option>
                      </select>
                    </div>
                    <div className="col-span-6">
                      <label className="text-[11px] font-medium text-gray-600">
                        Price for this group
                      </label>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={r.price}
                        onChange={(e) => updateGroup(i, "price", e.target.value)}
                        placeholder="300"
                        className="w-full p-2 mt-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div className="col-span-1 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => removeGroup(i)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Remove row"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default StepOneAdvanced;
