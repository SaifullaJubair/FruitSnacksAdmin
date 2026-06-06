import { useContext, useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthProvider";
import { BASE_URL } from "../../utils/baseURL";
import {
  FiSearch,
  FiX,
  FiPlus,
  FiMinus,
  FiShoppingCart,
  FiUser,
  FiTruck,
  FiTag,
} from "react-icons/fi";
import { MdStorefront } from "react-icons/md";

function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

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
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [walkInName, setWalkInName] = useState("");
  const [walkInPhone, setWalkInPhone] = useState("");
  const [isWalkIn, setIsWalkIn] = useState(true);

  // ── Delivery ────────────────────────────────────────────────────
  const [deliveryType, setDeliveryType] = useState("delivery");
  const [shippingLocation, setShippingLocation] = useState("inside_dhaka");
  const [billingCountry] = useState("Bangladesh");
  const [billingCity, setBillingCity] = useState("");
  const [billingState, setBillingState] = useState("");
  const [billingAddress, setBillingAddress] = useState("");

  // ── Discount ────────────────────────────────────────────────────
  const [manualDiscount, setManualDiscount] = useState(0);
  const [discountReason, setDiscountReason] = useState("");

  // ── Submit state ────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);

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
      `${BASE_URL}/product/dashboard?page=1&limit=10&searchTerm=${encodeURIComponent(debouncedProduct)}`,
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
  const handleAddProduct = useCallback((product) => {
    const hasVariations =
      product?.product_type === "variation" && product?.variations?.length > 0;

    if (hasVariations) {
      const firstVar = product.variations[0];
      setLines((prev) => [
        ...prev,
        {
          _lineId: Date.now() + Math.random(),
          product_id: product._id,
          product_name: product.product_name,
          product_thumbnail: product.main_image,
          product_type: "variation",
          variations: product.variations,
          variation_id: firstVar?._id,
          variation_label: firstVar?.variation_name || "Default",
          unit_price:
            firstVar?.variation_sale_price ||
            firstVar?.variation_price ||
            product.product_sale_price ||
            product.product_price,
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
          product_thumbnail: product.main_image,
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
  }, []);

  const updateLineQty = (lineId, delta) => {
    setLines((prev) =>
      prev.map((l) =>
        l._lineId === lineId
          ? { ...l, product_quantity: Math.max(1, l.product_quantity + delta) }
          : l,
      ),
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
          unit_price:
            chosen?.variation_sale_price ||
            chosen?.variation_price ||
            l.unit_price,
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
      need_user_create: true,
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
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blueColor-600 rounded-lg">
          <MdStorefront size={22} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">POS — Create Order</h1>
          <p className="text-xs text-gray-500">Search products, fill details & confirm</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* ── LEFT PANEL (2/3 width) ── */}
          <div className="xl:col-span-2 space-y-4">

            {/* Product Search */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-3">
                <FiShoppingCart size={16} className="text-blueColor-600" />
                <h2 className="font-semibold text-gray-700 text-sm">Products</h2>
              </div>

              <div ref={productRef} className="relative">
                <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blueColor-500 focus-within:border-blueColor-500 bg-white">
                  <FiSearch size={15} className="text-gray-400 shrink-0" />
                  <input
                    type="text"
                    value={productQuery}
                    onChange={(e) => setProductQuery(e.target.value)}
                    onFocus={() =>
                      productResults.length > 0 && setShowProductDrop(true)
                    }
                    placeholder="Search product by name or SKU..."
                    className="flex-1 text-sm outline-none bg-transparent"
                  />
                  {productSearching && (
                    <span className="text-xs text-gray-400 shrink-0">
                      Searching...
                    </span>
                  )}
                  {productQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setProductQuery("");
                        setProductResults([]);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <FiX size={14} />
                    </button>
                  )}
                </div>

                {showProductDrop && productResults.length > 0 && (
                  <ul className="absolute z-30 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-64 overflow-y-auto">
                    {productResults.map((p) => (
                      <li
                        key={p._id}
                        onClick={() => handleAddProduct(p)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-blueColor-50 cursor-pointer transition-colors"
                      >
                        {p.main_image ? (
                          <img
                            src={p.main_image}
                            alt=""
                            className="w-9 h-9 object-cover rounded-lg border border-gray-100 shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                            <FiShoppingCart size={14} className="text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {p.product_name}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            ৳{(p.product_sale_price || p.product_price)?.toLocaleString()}
                            {p.product_type === "variation" && (
                              <span className="ml-2 bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded text-[10px] font-medium">
                                variations
                              </span>
                            )}
                          </p>
                        </div>
                        <FiPlus size={14} className="text-blueColor-500 shrink-0" />
                      </li>
                    ))}
                  </ul>
                )}

                {showProductDrop &&
                  productResults.length === 0 &&
                  !productSearching &&
                  debouncedProduct.trim() && (
                    <div className="absolute z-30 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 px-4 py-3 text-sm text-gray-500">
                      No products found for &quot;{debouncedProduct}&quot;
                    </div>
                  )}
              </div>

              {/* Cart lines */}
              {lines.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {lines.map((line) => (
                    <div
                      key={line._lineId}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      {line.product_thumbnail ? (
                        <img
                          src={line.product_thumbnail}
                          alt=""
                          className="w-10 h-10 object-cover rounded-lg border border-gray-100 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center shrink-0">
                          <FiShoppingCart size={14} className="text-gray-400" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {line.product_name}
                        </p>
                        {line.product_type === "variation" &&
                          line.variations.length > 0 && (
                            <select
                              value={line.variation_id || ""}
                              onChange={(e) =>
                                updateLineVariation(
                                  line._lineId,
                                  e.target.value,
                                )
                              }
                              className="mt-1 text-xs border border-gray-300 rounded px-2 py-0.5 bg-white"
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

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => updateLineQty(line._lineId, -1)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
                        >
                          <FiMinus size={12} />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">
                          {line.product_quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateLineQty(line._lineId, 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
                        >
                          <FiPlus size={12} />
                        </button>
                      </div>

                      <div className="text-right shrink-0 w-20">
                        <p className="text-sm font-bold text-blueColor-700">
                          ৳{(line.unit_price * line.product_quantity).toLocaleString()}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          ৳{line.unit_price} ea.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeLine(line._lineId)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                      >
                        <FiX size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 flex flex-col items-center justify-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                  <FiShoppingCart size={28} className="mb-2 opacity-40" />
                  <p className="text-sm">Search and add products above</p>
                </div>
              )}
            </div>

            {/* Customer */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-3">
                <FiUser size={16} className="text-blueColor-600" />
                <h2 className="font-semibold text-gray-700 text-sm">Customer</h2>
              </div>

              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsWalkIn(true);
                    setSelectedCustomer(null);
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    isWalkIn
                      ? "bg-blueColor-600 text-white border-blueColor-600"
                      : "bg-white text-gray-600 border-gray-300 hover:border-blueColor-400"
                  }`}
                >
                  Walk-in
                </button>
                <button
                  type="button"
                  onClick={() => setIsWalkIn(false)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    !isWalkIn
                      ? "bg-blueColor-600 text-white border-blueColor-600"
                      : "bg-white text-gray-600 border-gray-300 hover:border-blueColor-400"
                  }`}
                >
                  Search Existing
                </button>
              </div>

              {isWalkIn ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">
                      Name (optional)
                    </label>
                    <input
                      type="text"
                      value={walkInName}
                      onChange={(e) => setWalkInName(e.target.value)}
                      placeholder="Walk-in Customer"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blueColor-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blueColor-500"
                    />
                  </div>
                </div>
              ) : (
                <div ref={customerRef} className="relative">
                  <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blueColor-500 bg-white">
                    <FiSearch size={15} className="text-gray-400 shrink-0" />
                    <input
                      type="text"
                      value={customerQuery}
                      onChange={(e) => {
                        setCustomerQuery(e.target.value);
                        setSelectedCustomer(null);
                      }}
                      onFocus={() =>
                        customerResults.length > 0 &&
                        setShowCustomerDrop(true)
                      }
                      placeholder="Search by name or phone..."
                      className="flex-1 text-sm outline-none bg-transparent"
                    />
                    {customerSearching && (
                      <span className="text-xs text-gray-400">Searching...</span>
                    )}
                  </div>
                  {showCustomerDrop && customerResults.length > 0 && (
                    <ul className="absolute z-30 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto">
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
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-blueColor-50 cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-full bg-blueColor-100 flex items-center justify-center shrink-0">
                            <FiUser size={14} className="text-blueColor-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {c.user_name}
                            </p>
                            <p className="text-xs text-gray-500">{c.user_phone}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                  {selectedCustomer && (
                    <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                      <span className="text-green-500">✓</span>
                      <span className="font-medium">
                        {selectedCustomer.user_name}
                      </span>
                      <span className="text-green-600/70">
                        {selectedCustomer.user_phone}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Delivery */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-3">
                <FiTruck size={16} className="text-blueColor-600" />
                <h2 className="font-semibold text-gray-700 text-sm">Delivery</h2>
              </div>

              <div className="flex gap-2 mb-4">
                {["delivery", "pickup"].map((dt) => (
                  <button
                    key={dt}
                    type="button"
                    onClick={() => setDeliveryType(dt)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      deliveryType === dt
                        ? "bg-blueColor-600 text-white border-blueColor-600"
                        : "bg-white text-gray-600 border-gray-300 hover:border-blueColor-400"
                    }`}
                  >
                    {dt === "delivery" ? "Home Delivery" : "In-Store Pickup (Free)"}
                  </button>
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
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blueColor-500 bg-white"
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
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blueColor-500"
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
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blueColor-500"
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
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blueColor-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Discount */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-3">
                <FiTag size={16} className="text-blueColor-600" />
                <h2 className="font-semibold text-gray-700 text-sm">
                  Manual Discount
                </h2>
              </div>
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blueColor-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">
                    Reason (optional)
                  </label>
                  <input
                    type="text"
                    value={discountReason}
                    onChange={(e) => setDiscountReason(e.target.value)}
                    placeholder="Staff discount, loyalty reward..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blueColor-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT PANEL — Sticky Order Summary ── */}
          <div className="xl:col-span-1">
            <div className="xl:sticky xl:top-6 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-blueColor-600">
                <h2 className="font-semibold text-white text-sm">
                  Order Summary
                </h2>
                <p className="text-blueColor-200 text-xs mt-0.5">
                  {lines.length} item{lines.length !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="p-4 space-y-2">
                {lines.length > 0 ? (
                  lines.map((l) => (
                    <div
                      key={l._lineId}
                      className="flex justify-between items-start text-xs text-gray-600"
                    >
                      <span className="flex-1 pr-2 truncate">
                        {l.product_name}
                        {l.variation_label && (
                          <span className="text-gray-400">
                            {" "}
                            · {l.variation_label}
                          </span>
                        )}{" "}
                        × {l.product_quantity}
                      </span>
                      <span className="font-semibold text-gray-800 shrink-0">
                        ৳{(l.unit_price * l.product_quantity).toLocaleString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 text-center py-2">
                    No products added yet
                  </p>
                )}

                <div className="border-t border-dashed border-gray-200 pt-2 space-y-1.5">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium">
                      ৳{subTotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Shipping</span>
                    <span className="font-medium">
                      {deliveryType === "pickup" ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        `৳${shippingCost}`
                      )}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-xs text-green-600">
                      <span>Discount</span>
                      <span className="font-medium">
                        − ৳{discount.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center border-t border-gray-200 pt-3">
                  <span className="text-sm font-bold text-gray-800">
                    Grand Total
                  </span>
                  <span className="text-lg font-extrabold text-blueColor-700">
                    ৳{grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="px-4 pb-4 space-y-2">
                <button
                  type="submit"
                  disabled={submitting || lines.length === 0}
                  className="w-full py-2.5 rounded-xl bg-blueColor-600 hover:bg-blueColor-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold transition-colors shadow-md"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8z"
                        />
                      </svg>
                      Creating Order...
                    </span>
                  ) : (
                    "Confirm Order"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/order")}
                  className="w-full py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateOrderPage;
