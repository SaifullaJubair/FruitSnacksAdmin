import { useContext, useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthProvider";
import { BASE_URL } from "../../utils/baseURL";

// ── Debounce helper ───────────────────────────────────────────────
function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ── Shipping cost defaults by location ───────────────────────────
const SHIPPING_INSIDE = 60;
const SHIPPING_OUTSIDE = 120;

const CreateOrderPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // ── Product search ──────────────────────────────────────────────
  const [productQuery, setProductQuery] = useState("");
  const debouncedProduct = useDebounce(productQuery);
  const [productResults, setProductResults] = useState([]);
  const [productSearching, setProductSearching] = useState(false);
  const productRef = useRef(null);
  const [showProductDrop, setShowProductDrop] = useState(false);

  // ── Cart lines ──────────────────────────────────────────────────
  const [lines, setLines] = useState([]);

  // ── Customer ────────────────────────────────────────────────────
  const [customerQuery, setCustomerQuery] = useState("");
  const debouncedCustomer = useDebounce(customerQuery);
  const [customerResults, setCustomerResults] = useState([]);
  const [customerSearching, setCustomerSearching] = useState(false);
  const [showCustomerDrop, setShowCustomerDrop] = useState(false);
  const customerRef = useRef(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null); // null = walk-in
  const [walkInName, setWalkInName] = useState("");
  const [walkInPhone, setWalkInPhone] = useState("");
  const [isWalkIn, setIsWalkIn] = useState(true);

  // ── Delivery ────────────────────────────────────────────────────
  const [deliveryType, setDeliveryType] = useState("delivery"); // delivery | pickup
  const [shippingLocation, setShippingLocation] = useState("inside_dhaka");
  const [billingCountry, setBillingCountry] = useState("Bangladesh");
  const [billingCity, setBillingCity] = useState(""); // maps to user_division in BE
  const [billingState, setBillingState] = useState(""); // maps to user_district in BE
  const [billingAddress, setBillingAddress] = useState("");

  // ── Discount ────────────────────────────────────────────────────
  const [manualDiscount, setManualDiscount] = useState(0);
  const [discountReason, setDiscountReason] = useState("");

  // ── Submit state ────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);

  // ── Guard ───────────────────────────────────────────────────────
  if (!user?.role_id?.order_create_admin) {
    return (
      <div className="flex items-center justify-center h-40 text-red-500 font-medium">
        Access Denied — You need &quot;Create Order (POS)&quot; permission.
      </div>
    );
  }

  // ── Product search effect ───────────────────────────────────────
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (!debouncedProduct.trim()) {
      setProductResults([]);
      return;
    }
    setProductSearching(true);
    fetch(
      `${BASE_URL}/product?page=1&limit=10&searchTerm=${encodeURIComponent(debouncedProduct)}`,
      { credentials: "include" },
    )
      .then((r) => r.json())
      .then((d) => {
        setProductResults(d?.data || []);
        setShowProductDrop(true);
      })
      .catch(() => {})
      .finally(() => setProductSearching(false));
  }, [debouncedProduct]);

  // ── Customer search effect ──────────────────────────────────────
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (!debouncedCustomer.trim()) {
      setCustomerResults([]);
      return;
    }
    setCustomerSearching(true);
    fetch(
      `${BASE_URL}/user?page=1&limit=8&searchTerm=${encodeURIComponent(debouncedCustomer)}`,
      { credentials: "include" },
    )
      .then((r) => r.json())
      .then((d) => {
        setCustomerResults(d?.data || []);
        setShowCustomerDrop(true);
      })
      .catch(() => {})
      .finally(() => setCustomerSearching(false));
  }, [debouncedCustomer]);

  // ── Click-outside handlers ──────────────────────────────────────
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const handler = (e) => {
      if (productRef.current && !productRef.current.contains(e.target))
        setShowProductDrop(false);
      if (customerRef.current && !customerRef.current.contains(e.target))
        setShowCustomerDrop(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Add product to cart ─────────────────────────────────────────
  const handleAddProduct = useCallback(
    (product) => {
      const hasVariations =
        product?.product_type === "variation" &&
        product?.variations?.length > 0;

      if (hasVariations) {
        // Add with first variation pre-selected, admin can change
        const firstVar = product.variations[0];
        setLines((prev) => [
          ...prev,
          {
            _lineId: Date.now() + Math.random(),
            product_id: product._id,
            product_name: product.product_name,
            product_thumbnail: product.product_thumbnail,
            product_type: "variation",
            variations: product.variations,
            variation_id: firstVar?._id,
            variation_label: firstVar?.variation_name || "Default",
            unit_price: firstVar?.variation_sale_price || firstVar?.variation_price || product.product_sale_price || product.product_price,
            product_quantity: 1,
          },
        ]);
      } else {
        setLines((prev) => [
          ...prev,
          {
            _lineId: Date.now() + Math.random(),
            product_id: product._id,
            product_name: product.product_name,
            product_thumbnail: product.product_thumbnail,
            product_type: "simple",
            variations: [],
            variation_id: null,
            variation_label: "",
            unit_price: product.product_sale_price || product.product_price,
            product_quantity: 1,
          },
        ]);
      }
      setProductQuery("");
      setProductResults([]);
      setShowProductDrop(false);
    },
    [],
  );

  const updateLineQty = (lineId, qty) => {
    const n = Math.max(1, Number(qty) || 1);
    setLines((prev) =>
      prev.map((l) => (l._lineId === lineId ? { ...l, product_quantity: n } : l)),
    );
  };

  const updateLineVariation = (lineId, varId) => {
    setLines((prev) =>
      prev.map((l) => {
        if (l._lineId !== lineId) return l;
        const chosen = l.variations.find((v) => v._id === varId);
        return {
          ...l,
          variation_id: varId,
          variation_label: chosen?.variation_name || "",
          unit_price: chosen?.variation_sale_price || chosen?.variation_price || l.unit_price,
        };
      }),
    );
  };

  const removeLine = (lineId) =>
    setLines((prev) => prev.filter((l) => l._lineId !== lineId));

  // ── Totals ──────────────────────────────────────────────────────
  const subTotal = lines.reduce(
    (s, l) => s + l.unit_price * l.product_quantity,
    0,
  );
  const shippingCost =
    deliveryType === "pickup"
      ? 0
      : shippingLocation === "inside_dhaka"
        ? SHIPPING_INSIDE
        : SHIPPING_OUTSIDE;
  const discount = Math.max(0, Number(manualDiscount) || 0);
  const grandTotal = Math.max(0, subTotal + shippingCost - discount);

  // ── Submit ──────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (lines.length === 0) {
      toast.error("Please add at least one product.");
      return;
    }

    const customerName = isWalkIn
      ? walkInName || "Walk-in Customer"
      : selectedCustomer?.user_name || "Customer";
    const customerPhone = isWalkIn
      ? walkInPhone
      : selectedCustomer?.user_phone;

    if (!customerPhone?.trim()) {
      toast.error("Customer phone number is required.");
      return;
    }

    if (deliveryType === "delivery" && !billingAddress.trim()) {
      toast.error("Delivery address is required.");
      return;
    }

    const orderPayload = {
      order_source: "admin",
      need_user_create: true, // findOrCreateUser will look up or create
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_id: isWalkIn ? undefined : selectedCustomer?._id,
      billing_country: billingCountry,
      billing_city: billingCity || "Dhaka",
      billing_state: billingState || "Dhaka",
      billing_address: deliveryType === "pickup" ? "Pickup" : billingAddress,
      shipping_location: shippingLocation,
      shipping_cost: shippingCost,
      delivery_type: deliveryType,
      sub_total_amount: subTotal,
      discount_amount: discount,
      admin_manual_discount: discount,
      manual_discount_reason: discountReason,
      grand_total_amount: grandTotal,
      payment_method: "cod",
      order_products: lines.map((l) => ({
        product_id: l.product_id,
        variation_id: l.variation_id || undefined,
        product_quantity: l.product_quantity,
        product_unit_price: l.unit_price,
        product_unit_final_price: l.unit_price,
        product_grand_total_price: l.unit_price * l.product_quantity,
        product_main_price: l.unit_price,
        product_main_discount_price: 0,
      })),
    };

    // If logged-in customer selected, send their _id and skip user-create
    if (!isWalkIn && selectedCustomer?._id) {
      orderPayload.customer_id = selectedCustomer._id;
      orderPayload.need_user_create = false;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`${BASE_URL}/order/create-admin`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });
      const data = await res.json();
      if (data?.success) {
        toast.success(`POS Order Created! Invoice: ${data?.data?.invoice_id}`);
        navigate(`/order?tab=all`);
      } else {
        throw new Error(data?.message || "Order creation failed");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded py-6 px-4 shadow max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Create POS Order</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Product Search ── */}
        <section className="border rounded-lg p-4">
          <h2 className="font-semibold text-gray-700 mb-3">Add Products</h2>
          <div ref={productRef} className="relative">
            <input
              type="text"
              value={productQuery}
              onChange={(e) => setProductQuery(e.target.value)}
              onFocus={() => productResults.length > 0 && setShowProductDrop(true)}
              placeholder="Search product by name..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {productSearching && (
              <span className="absolute right-3 top-2.5 text-xs text-gray-400">
                Searching...
              </span>
            )}
            {showProductDrop && productResults.length > 0 && (
              <ul className="absolute z-20 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                {productResults.map((p) => (
                  <li
                    key={p._id}
                    onClick={() => handleAddProduct(p)}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                  >
                    {p.product_thumbnail && (
                      <img
                        src={p.product_thumbnail}
                        alt=""
                        className="w-8 h-8 object-cover rounded"
                      />
                    )}
                    <div>
                      <div className="font-medium">{p.product_name}</div>
                      <div className="text-gray-500 text-xs">
                        ৳{p.product_sale_price || p.product_price}
                        {p.product_type === "variation" && " · has variations"}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Cart lines */}
          {lines.length > 0 && (
            <div className="mt-4 space-y-2">
              {lines.map((line) => (
                <div
                  key={line._lineId}
                  className="flex flex-wrap items-center gap-3 p-3 bg-gray-50 rounded-lg border"
                >
                  {line.product_thumbnail && (
                    <img
                      src={line.product_thumbnail}
                      alt=""
                      className="w-10 h-10 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {line.product_name}
                    </div>
                    {line.product_type === "variation" &&
                      line.variations.length > 0 && (
                        <select
                          value={line.variation_id || ""}
                          onChange={(e) =>
                            updateLineVariation(line._lineId, e.target.value)
                          }
                          className="mt-1 text-xs border border-gray-300 rounded px-2 py-0.5"
                        >
                          {line.variations.map((v) => (
                            <option key={v._id} value={v._id}>
                              {v.variation_name} — ৳
                              {v.variation_sale_price || v.variation_price}
                            </option>
                          ))}
                        </select>
                      )}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">৳{line.unit_price} ×</span>
                    <input
                      type="number"
                      min={1}
                      value={line.product_quantity}
                      onChange={(e) =>
                        updateLineQty(line._lineId, e.target.value)
                      }
                      className="w-16 border border-gray-300 rounded px-2 py-0.5 text-center"
                    />
                    <span className="font-semibold text-blue-700 w-20 text-right">
                      ৳{(line.unit_price * line.product_quantity).toLocaleString()}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLine(line._lineId)}
                    className="text-red-400 hover:text-red-600 text-lg font-bold"
                    title="Remove"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Customer ── */}
        <section className="border rounded-lg p-4">
          <h2 className="font-semibold text-gray-700 mb-3">Customer</h2>
          <div className="flex gap-3 mb-3">
            <button
              type="button"
              onClick={() => {
                setIsWalkIn(true);
                setSelectedCustomer(null);
              }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${isWalkIn ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300"}`}
            >
              Walk-in
            </button>
            <button
              type="button"
              onClick={() => setIsWalkIn(false)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${!isWalkIn ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300"}`}
            >
              Search Existing Customer
            </button>
          </div>

          {isWalkIn ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  Customer Name (optional)
                </label>
                <input
                  type="text"
                  value={walkInName}
                  onChange={(e) => setWalkInName(e.target.value)}
                  placeholder="Walk-in Customer"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={walkInPhone}
                  onChange={(e) => setWalkInPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          ) : (
            <div ref={customerRef} className="relative">
              <input
                type="text"
                value={customerQuery}
                onChange={(e) => {
                  setCustomerQuery(e.target.value);
                  setSelectedCustomer(null);
                }}
                onFocus={() =>
                  customerResults.length > 0 && setShowCustomerDrop(true)
                }
                placeholder="Search by name or phone..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {customerSearching && (
                <span className="absolute right-3 top-2.5 text-xs text-gray-400">
                  Searching...
                </span>
              )}
              {showCustomerDrop && customerResults.length > 0 && (
                <ul className="absolute z-20 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                  {customerResults.map((c) => (
                    <li
                      key={c._id}
                      onClick={() => {
                        setSelectedCustomer(c);
                        setCustomerQuery(
                          `${c.user_name || ""} — ${c.user_phone}`,
                        );
                        setShowCustomerDrop(false);
                      }}
                      className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                    >
                      <span className="font-medium">{c.user_name}</span>{" "}
                      <span className="text-gray-500">{c.user_phone}</span>
                    </li>
                  ))}
                </ul>
              )}
              {selectedCustomer && (
                <div className="mt-2 px-3 py-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                  ✓ {selectedCustomer.user_name} — {selectedCustomer.user_phone}
                </div>
              )}
            </div>
          )}
        </section>

        {/* ── Delivery ── */}
        <section className="border rounded-lg p-4">
          <h2 className="font-semibold text-gray-700 mb-3">Delivery</h2>
          <div className="flex gap-4 mb-4">
            {["delivery", "pickup"].map((dt) => (
              <label
                key={dt}
                className="flex items-center gap-2 cursor-pointer text-sm font-medium"
              >
                <input
                  type="radio"
                  name="delivery_type"
                  value={dt}
                  checked={deliveryType === dt}
                  onChange={() => setDeliveryType(dt)}
                  className="accent-blue-600"
                />
                {dt === "delivery" ? "Home Delivery" : "In-Store Pickup (৳0)"}
              </label>
            ))}
          </div>

          {deliveryType === "delivery" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  Shipping Zone
                </label>
                <select
                  value={shippingLocation}
                  onChange={(e) => setShippingLocation(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="inside_dhaka">
                    Inside Dhaka (৳{SHIPPING_INSIDE})
                  </option>
                  <option value="outside_dhaka">
                    Outside Dhaka (৳{SHIPPING_OUTSIDE})
                  </option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  Division / City
                </label>
                <input
                  type="text"
                  value={billingCity}
                  onChange={(e) => setBillingCity(e.target.value)}
                  placeholder="Dhaka"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  District
                </label>
                <input
                  type="text"
                  value={billingState}
                  onChange={(e) => setBillingState(e.target.value)}
                  placeholder="Dhaka"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  Full Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                  placeholder="Road, Area, Flat..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </section>

        {/* ── Discount ── */}
        <section className="border rounded-lg p-4">
          <h2 className="font-semibold text-gray-700 mb-3">
            Manual Discount (D11 — no coupon for POS)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Discount Amount (৳)
              </label>
              <input
                type="number"
                min={0}
                value={manualDiscount}
                onChange={(e) => setManualDiscount(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Reason (optional, for audit trail)
              </label>
              <input
                type="text"
                value={discountReason}
                onChange={(e) => setDiscountReason(e.target.value)}
                placeholder="Staff discount, loyalty reward..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </section>

        {/* ── Order Summary ── */}
        <section className="border rounded-lg p-4 bg-gray-50">
          <h2 className="font-semibold text-gray-700 mb-3">Order Summary</h2>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">৳{subTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span className="font-medium">
                {deliveryType === "pickup" ? (
                  <span className="text-green-600">Free (Pickup)</span>
                ) : (
                  `৳${shippingCost}`
                )}
              </span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Manual Discount</span>
                <span>− ৳{discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-2 font-bold text-base">
              <span>Grand Total</span>
              <span className="text-blue-700">৳{grandTotal.toLocaleString()}</span>
            </div>
          </div>
        </section>

        {/* ── Submit ── */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/order")}
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || lines.length === 0}
            className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium"
          >
            {submitting ? "Creating..." : "Create POS Order"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateOrderPage;
