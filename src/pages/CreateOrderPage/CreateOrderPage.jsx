import { useContext, useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthProvider";
import { BASE_URL } from "../../utils/baseURL";
import useGetCategory from "../../hooks/useGetCategory";
import POSReceipt from "./POSReceipt";
import {
  FiSearch, FiX, FiPlus, FiMinus, FiShoppingCart,
  FiUser, FiTruck, FiTag, FiPrinter, FiChevronLeft, FiChevronRight,
} from "react-icons/fi";
import { MdStorefront } from "react-icons/md";

// ── Debounce ───────────────────────────────────────────────────────
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

const PAYMENT_METHODS = [
  { key: "cash", label: "Cash" },
  { key: "bkash", label: "bKash" },
  { key: "nagad", label: "Nagad" },
  { key: "card", label: "Card" },
  { key: "bank", label: "Bank" },
];

const PER_PAGE_OPTIONS = [20, 50, 100];

// ── Skeleton card ──────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="border border-gray-200 rounded-xl p-3 animate-pulse">
    <div className="w-full h-32 bg-gray-200 rounded-lg mb-2" />
    <div className="h-3 bg-gray-200 rounded w-3/4 mb-1" />
    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
    <div className="h-7 bg-gray-200 rounded" />
  </div>
);

const CreateOrderPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const receiptRef = useRef(null);

  // ── Product grid filters ────────────────────────────────────────
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  // reset page when filters change
  useEffect(() => { setPage(1); }, [debouncedSearch, categoryFilter, brandFilter, stockFilter, perPage]);

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
  const [billingCity, setBillingCity] = useState("");
  const [billingState, setBillingState] = useState("");
  const [billingAddress, setBillingAddress] = useState("");

  // ── Discount + payment ──────────────────────────────────────────
  const [manualDiscount, setManualDiscount] = useState(0);
  const [discountReason, setDiscountReason] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paidAmount, setPaidAmount] = useState(0);

  // ── Submit ──────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [lastInvoiceId, setLastInvoiceId] = useState(null);

  if (!user?.role_id?.order_create_admin) {
    return (
      <div className="flex items-center justify-center h-40 text-red-500 font-medium">
        Access Denied — You need &quot;Create Order (POS)&quot; permission.
      </div>
    );
  }

  // ── Product grid query ──────────────────────────────────────────
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const productParams = new URLSearchParams({
    page: String(page),
    limit: String(perPage),
    ...(debouncedSearch && { searchTerm: debouncedSearch }),
    ...(categoryFilter && { category_id: categoryFilter }),
    ...(brandFilter && { brand_id: brandFilter }),
    ...(stockFilter !== "all" && { stock_filter: stockFilter }),
  });

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { data: productData, isLoading: productsLoading } = useQuery({
    queryKey: ["pos-products", page, perPage, debouncedSearch, categoryFilter, brandFilter, stockFilter],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/product/dashboard?${productParams}`, { credentials: "include" });
      return res.json();
    },
    staleTime: 30_000,
  });
  const products = productData?.data || [];
  const totalProducts = productData?.totalData || 0;
  const totalPages = Math.ceil(totalProducts / perPage);

  // ── Category + Brand queries ────────────────────────────────────
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { data: categoryData } = useGetCategory();
  const categories = (categoryData?.data || []).filter((c) => !c.parent_id);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { data: brandData } = useQuery({
    queryKey: ["pos-brands"],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/brand`, { credentials: "include" });
      return res.json();
    },
    staleTime: 300_000,
  });
  const brands = brandData?.data || [];

  // ── Customer search ─────────────────────────────────────────────
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (!debouncedCustomer.trim()) { setCustomerResults([]); return; }
    setCustomerSearching(true);
    fetch(`${BASE_URL}/user?page=1&limit=8&searchTerm=${encodeURIComponent(debouncedCustomer)}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { setCustomerResults(d?.data || []); setShowCustomerDrop(true); })
      .catch(() => {})
      .finally(() => setCustomerSearching(false));
  }, [debouncedCustomer]);

  // ── Click outside customer drop ─────────────────────────────────
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const handler = (e) => {
      if (customerRef.current && !customerRef.current.contains(e.target)) setShowCustomerDrop(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Add product to cart ─────────────────────────────────────────
  const handleAddProduct = useCallback((product) => {
    const hasVariations = product?.product_type === "variation" && product?.variations?.length > 0;
    const firstVar = hasVariations ? product.variations[0] : null;
    const unitPrice = firstVar
      ? (firstVar.variation_sale_price || firstVar.variation_price || product.product_sale_price || product.product_price)
      : (product.product_sale_price || product.product_price);

    setLines((prev) => {
      // increment qty if same product+variation already in cart
      const existIdx = prev.findIndex(
        (l) => l.product_id === product._id && l.variation_id === (firstVar?._id || null),
      );
      if (existIdx >= 0) {
        return prev.map((l, i) =>
          i === existIdx ? { ...l, product_quantity: l.product_quantity + 1 } : l,
        );
      }
      return [
        ...prev,
        {
          _lineId: Date.now() + Math.random(),
          product_id: product._id,
          product_name: product.product_name,
          product_thumbnail: product.main_image,
          product_type: hasVariations ? "variation" : "simple",
          variations: product.variations || [],
          variation_id: firstVar?._id || null,
          variation_label: firstVar?.variation_name || "",
          unit_price: unitPrice,
          product_quantity: 1,
        },
      ];
    });
  }, []);

  const updateLineQty = (lineId, delta) =>
    setLines((prev) =>
      prev.map((l) =>
        l._lineId === lineId ? { ...l, product_quantity: Math.max(1, l.product_quantity + delta) } : l,
      ),
    );

  const updateLineVariation = (lineId, varId) =>
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

  const removeLine = (lineId) => setLines((prev) => prev.filter((l) => l._lineId !== lineId));

  // ── Totals ──────────────────────────────────────────────────────
  const subTotal = lines.reduce((s, l) => s + l.unit_price * l.product_quantity, 0);
  const shippingCost = deliveryType === "pickup" ? 0 : shippingLocation === "inside_dhaka" ? SHIPPING_INSIDE : SHIPPING_OUTSIDE;
  const discount = Math.max(0, Number(manualDiscount) || 0);
  const grandTotal = Math.max(0, subTotal + shippingCost - discount);
  const returnAmount = Math.max(0, (Number(paidAmount) || 0) - grandTotal);

  // ── Print ───────────────────────────────────────────────────────
  const handlePrint = () => {
    if (lines.length === 0) { toast.error("Add products before printing."); return; }
    window.print();
  };

  // ── Submit ──────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (lines.length === 0) { toast.error("Please add at least one product."); return; }
    const customerName = isWalkIn ? walkInName || "Walk-in Customer" : selectedCustomer?.user_name || "Customer";
    const customerPhone = isWalkIn ? walkInPhone : selectedCustomer?.user_phone;
    if (!customerPhone?.trim()) { toast.error("Customer phone number is required."); return; }
    if (deliveryType === "delivery" && !billingAddress.trim()) { toast.error("Delivery address is required."); return; }

    const orderPayload = {
      order_source: "admin",
      need_user_create: true,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_id: isWalkIn ? undefined : selectedCustomer?._id,
      billing_country: "Bangladesh",
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
      payment_method_note: paymentMethod,
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
        setLastInvoiceId(data?.data?.invoice_id);
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

  // ── Customer info for receipt ───────────────────────────────────
  const receiptCustomer = {
    name: isWalkIn ? walkInName || "Walk-in Customer" : selectedCustomer?.user_name,
    phone: isWalkIn ? walkInPhone : selectedCustomer?.user_phone,
  };
  const receiptDelivery = { address: deliveryType === "pickup" ? "Pickup" : billingAddress };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Print receipt (hidden on screen) ── */}
      <POSReceipt
        ref={receiptRef}
        lines={lines}
        customer={receiptCustomer}
        delivery={receiptDelivery}
        discount={discount}
        shippingCost={shippingCost}
        grandTotal={grandTotal}
        invoiceId={lastInvoiceId}
        shopName={user?.admin_name}
      />

      <div className="p-4 md:p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blueColor-600 rounded-lg">
              <MdStorefront size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">POS — Create Order</h1>
              <p className="text-xs text-gray-500">{totalProducts} products available</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50"
          >
            <FiPrinter size={14} /> Print
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

            {/* ── LEFT PANEL ── */}
            <div className="xl:col-span-2 space-y-4">

              {/* Filters row */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3">
                <div className="flex flex-wrap gap-2 mb-2">
                  {/* Search */}
                  <div className="flex-1 min-w-[180px] flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blueColor-500 bg-white">
                    <FiSearch size={14} className="text-gray-400 shrink-0" />
                    <input
                      type="text"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      placeholder="Search products..."
                      className="flex-1 text-sm outline-none bg-transparent"
                    />
                    {searchInput && (
                      <button type="button" onClick={() => setSearchInput("")} className="text-gray-400 hover:text-gray-600">
                        <FiX size={13} />
                      </button>
                    )}
                  </div>

                  {/* Category */}
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blueColor-500"
                  >
                    <option value="">All Categories</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>{c.category_name}</option>
                    ))}
                  </select>

                  {/* Brand */}
                  <select
                    value={brandFilter}
                    onChange={(e) => setBrandFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blueColor-500"
                  >
                    <option value="">All Brands</option>
                    {brands.map((b) => (
                      <option key={b._id} value={b._id}>{b.brand_name}</option>
                    ))}
                  </select>

                  {/* Stock */}
                  <select
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blueColor-500"
                  >
                    <option value="all">All Stock</option>
                    <option value="in_stock">In Stock</option>
                    <option value="low_stock">Low Stock (≤10)</option>
                  </select>

                  {/* Per page */}
                  <select
                    value={perPage}
                    onChange={(e) => setPerPage(Number(e.target.value))}
                    className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blueColor-500"
                  >
                    {PER_PAGE_OPTIONS.map((n) => (
                      <option key={n} value={n}>{n} / page</option>
                    ))}
                  </select>
                </div>

                {/* Product grid */}
                {productsLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-1">
                    {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
                  </div>
                ) : products.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                    <FiShoppingCart size={28} className="mb-2 opacity-40" />
                    <p className="text-sm">No products found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-1">
                    {products.map((p) => {
                      const price = p.product_sale_price || p.product_price;
                      const origPrice = p.product_sale_price ? p.product_price : null;
                      const inCart = lines.some((l) => l.product_id === p._id);
                      return (
                        <div
                          key={p._id}
                          className={`border rounded-xl overflow-hidden transition-all hover:shadow-md cursor-pointer group ${inCart ? "border-blueColor-400 bg-blueColor-50/30" : "border-gray-200 bg-white"}`}
                          onClick={() => handleAddProduct(p)}
                        >
                          <div className="relative">
                            {p.main_image ? (
                              <img src={p.main_image} alt={p.product_name} className="w-full h-28 object-cover" />
                            ) : (
                              <div className="w-full h-28 bg-gray-100 flex items-center justify-center">
                                <FiShoppingCart size={20} className="text-gray-300" />
                              </div>
                            )}
                            {p.product_sale_price && p.product_sale_price < p.product_price && (
                              <span className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                                -{Math.round(((p.product_price - p.product_sale_price) / p.product_price) * 100)}%
                              </span>
                            )}
                            {p.product_quantity <= 0 && (
                              <span className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <span className="bg-white text-red-600 text-[10px] font-bold px-2 py-0.5 rounded">Out of Stock</span>
                              </span>
                            )}
                            {p.product_quantity > 0 && p.product_quantity <= 10 && (
                              <span className="absolute top-1.5 right-1.5 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                                {p.product_quantity} left
                              </span>
                            )}
                          </div>
                          <div className="p-2">
                            <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-tight mb-1">{p.product_name}</p>
                            <div className="flex items-center gap-1 flex-wrap mb-1.5">
                              <span className="text-sm font-bold text-blueColor-700">৳{price?.toLocaleString()}</span>
                              {origPrice && (
                                <span className="text-[10px] text-gray-400 line-through">৳{origPrice?.toLocaleString()}</span>
                              )}
                            </div>
                            {p.product_sku && (
                              <p className="text-[10px] text-gray-400 mb-1.5">SKU: {p.product_sku}</p>
                            )}
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleAddProduct(p); }}
                              className={`w-full py-1 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 ${inCart ? "bg-blueColor-600 text-white" : "border border-blueColor-500 text-blueColor-600 hover:bg-blueColor-600 hover:text-white"}`}
                            >
                              <FiPlus size={11} />
                              {inCart ? "Add More" : "Add"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      {(page - 1) * perPage + 1}–{Math.min(page * perPage, totalProducts)} of {totalProducts}
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-1.5 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
                      >
                        <FiChevronLeft size={14} />
                      </button>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const p = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i;
                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setPage(p)}
                            className={`w-7 h-7 text-xs rounded border transition-all ${page === p ? "bg-blueColor-600 text-white border-blueColor-600" : "border-gray-300 hover:bg-gray-50"}`}
                          >
                            {p}
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="p-1.5 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
                      >
                        <FiChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Cart lines */}
              {lines.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FiShoppingCart size={15} className="text-blueColor-600" />
                      <h2 className="font-semibold text-gray-700 text-sm">Cart ({lines.length} items)</h2>
                    </div>
                    <button type="button" onClick={() => setLines([])} className="text-xs text-red-500 hover:underline">
                      Clear Cart
                    </button>
                  </div>
                  <div className="space-y-2">
                    {lines.map((line) => (
                      <div key={line._lineId} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                        {line.product_thumbnail ? (
                          <img src={line.product_thumbnail} alt="" className="w-10 h-10 object-cover rounded-lg border border-gray-100 shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center shrink-0">
                            <FiShoppingCart size={14} className="text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-800 truncate">{line.product_name}</p>
                          {line.product_type === "variation" && line.variations.length > 0 && (
                            <select
                              value={line.variation_id || ""}
                              onChange={(e) => updateLineVariation(line._lineId, e.target.value)}
                              className="mt-0.5 text-[11px] border border-gray-300 rounded px-1.5 py-0.5 bg-white"
                            >
                              {line.variations.map((v) => (
                                <option key={v._id} value={v._id}>
                                  {v.variation_name} — ৳{v.variation_sale_price || v.variation_price}
                                  {v.variation_quantity > 0 && v.variation_quantity <= 10 ? ` (${v.variation_quantity} left)` : ""}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button type="button" onClick={() => updateLineQty(line._lineId, -1)}
                            className="w-6 h-6 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-100">
                            <FiMinus size={11} />
                          </button>
                          <span className="w-7 text-center text-xs font-bold">{line.product_quantity}</span>
                          <button type="button" onClick={() => updateLineQty(line._lineId, 1)}
                            className="w-6 h-6 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-100">
                            <FiPlus size={11} />
                          </button>
                        </div>
                        <div className="text-right shrink-0 w-16">
                          <p className="text-xs font-bold text-blueColor-700">৳{(line.unit_price * line.product_quantity).toLocaleString()}</p>
                          <p className="text-[10px] text-gray-400">৳{line.unit_price} ea.</p>
                        </div>
                        <button type="button" onClick={() => removeLine(line._lineId)}
                          className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 shrink-0">
                          <FiX size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Customer */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FiUser size={15} className="text-blueColor-600" />
                  <h2 className="font-semibold text-gray-700 text-sm">Customer</h2>
                </div>
                <div className="flex gap-2 mb-3">
                  {["walkin", "existing"].map((t) => (
                    <button key={t} type="button"
                      onClick={() => { setIsWalkIn(t === "walkin"); setSelectedCustomer(null); }}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${(t === "walkin") === isWalkIn ? "bg-blueColor-600 text-white border-blueColor-600" : "bg-white text-gray-600 border-gray-300 hover:border-blueColor-400"}`}>
                      {t === "walkin" ? "Walk-in" : "Search Existing"}
                    </button>
                  ))}
                </div>
                {isWalkIn ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Name (optional)</label>
                      <input type="text" value={walkInName} onChange={(e) => setWalkInName(e.target.value)}
                        placeholder="Walk-in Customer"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blueColor-500" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Phone <span className="text-red-500">*</span></label>
                      <input type="text" value={walkInPhone} onChange={(e) => setWalkInPhone(e.target.value)}
                        placeholder="01XXXXXXXXX"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blueColor-500" />
                    </div>
                  </div>
                ) : (
                  <div ref={customerRef} className="relative">
                    <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blueColor-500 bg-white">
                      <FiSearch size={14} className="text-gray-400 shrink-0" />
                      <input type="text" value={customerQuery}
                        onChange={(e) => { setCustomerQuery(e.target.value); setSelectedCustomer(null); }}
                        onFocus={() => customerResults.length > 0 && setShowCustomerDrop(true)}
                        placeholder="Search by name or phone..."
                        className="flex-1 text-sm outline-none bg-transparent" />
                      {customerSearching && <span className="text-xs text-gray-400">Searching...</span>}
                    </div>
                    {showCustomerDrop && customerResults.length > 0 && (
                      <ul className="absolute z-30 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto">
                        {customerResults.map((c) => (
                          <li key={c._id}
                            onClick={() => { setSelectedCustomer(c); setCustomerQuery(`${c.user_name || ""} — ${c.user_phone}`); setShowCustomerDrop(false); }}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-blueColor-50 cursor-pointer">
                            <div className="w-7 h-7 rounded-full bg-blueColor-100 flex items-center justify-center shrink-0">
                              <FiUser size={13} className="text-blueColor-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-800">{c.user_name}</p>
                              <p className="text-xs text-gray-500">{c.user_phone}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                    {selectedCustomer && (
                      <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                        <span>✓</span>
                        <span className="font-medium">{selectedCustomer.user_name}</span>
                        <span className="text-green-600/70">{selectedCustomer.user_phone}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Delivery */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FiTruck size={15} className="text-blueColor-600" />
                  <h2 className="font-semibold text-gray-700 text-sm">Delivery</h2>
                </div>
                <div className="flex gap-2 mb-4">
                  {["delivery", "pickup"].map((dt) => (
                    <button key={dt} type="button" onClick={() => setDeliveryType(dt)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${deliveryType === dt ? "bg-blueColor-600 text-white border-blueColor-600" : "bg-white text-gray-600 border-gray-300 hover:border-blueColor-400"}`}>
                      {dt === "delivery" ? "Home Delivery" : "In-Store Pickup (Free)"}
                    </button>
                  ))}
                </div>
                {deliveryType === "delivery" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Shipping Zone</label>
                      <select value={shippingLocation} onChange={(e) => setShippingLocation(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blueColor-500 bg-white">
                        <option value="inside_dhaka">Inside Dhaka (৳{SHIPPING_INSIDE})</option>
                        <option value="outside_dhaka">Outside Dhaka (৳{SHIPPING_OUTSIDE})</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Division / City</label>
                      <input type="text" value={billingCity} onChange={(e) => setBillingCity(e.target.value)}
                        placeholder="Dhaka"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blueColor-500" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">District</label>
                      <input type="text" value={billingState} onChange={(e) => setBillingState(e.target.value)}
                        placeholder="Dhaka"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blueColor-500" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Full Address <span className="text-red-500">*</span></label>
                      <input type="text" value={billingAddress} onChange={(e) => setBillingAddress(e.target.value)}
                        placeholder="Road, Area, Flat..."
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blueColor-500" />
                    </div>
                  </div>
                )}
              </div>

              {/* Discount */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FiTag size={15} className="text-blueColor-600" />
                  <h2 className="font-semibold text-gray-700 text-sm">Manual Discount</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Amount (৳)</label>
                    <input type="number" min={0} value={manualDiscount} onChange={(e) => setManualDiscount(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blueColor-500" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Reason (optional)</label>
                    <input type="text" value={discountReason} onChange={(e) => setDiscountReason(e.target.value)}
                      placeholder="Staff discount, loyalty reward..."
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blueColor-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* ── RIGHT PANEL ── */}
            <div className="xl:col-span-1">
              <div className="xl:sticky xl:top-6 space-y-4">

                {/* Order Summary */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-4 py-3 bg-blueColor-600">
                    <h2 className="font-semibold text-white text-sm">Order Summary</h2>
                    <p className="text-blueColor-200 text-xs mt-0.5">{lines.length} item{lines.length !== 1 ? "s" : ""}</p>
                  </div>
                  <div className="p-4 space-y-1.5">
                    {lines.length > 0 ? (
                      lines.map((l) => (
                        <div key={l._lineId} className="flex justify-between items-start text-xs text-gray-600">
                          <span className="flex-1 pr-2 truncate">
                            {l.product_name}
                            {l.variation_label && <span className="text-gray-400"> · {l.variation_label}</span>}
                            {" × "}{l.product_quantity}
                          </span>
                          <span className="font-semibold text-gray-800 shrink-0">৳{(l.unit_price * l.product_quantity).toLocaleString()}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 text-center py-3">No products added yet</p>
                    )}
                    <div className="border-t border-dashed border-gray-200 pt-2 space-y-1.5">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Subtotal</span>
                        <span className="font-medium">৳{subTotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Shipping</span>
                        <span className="font-medium">{deliveryType === "pickup" ? <span className="text-green-600">Free</span> : `৳${shippingCost}`}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-xs text-green-600">
                          <span>Discount</span>
                          <span className="font-medium">− ৳{discount.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between items-center border-t border-gray-200 pt-3">
                      <span className="text-sm font-bold text-gray-800">Grand Total</span>
                      <span className="text-lg font-extrabold text-blueColor-700">৳{grandTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Payment */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                  <h2 className="font-semibold text-gray-700 text-sm mb-3">Payment Method</h2>
                  <div className="grid grid-cols-3 gap-1.5 mb-3">
                    {PAYMENT_METHODS.map((m) => (
                      <button key={m.key} type="button" onClick={() => setPaymentMethod(m.key)}
                        className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${paymentMethod === m.key ? "bg-blueColor-600 text-white border-blueColor-600" : "bg-white text-gray-600 border-gray-300 hover:border-blueColor-400"}`}>
                        {m.label}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Paid Amount (৳)</label>
                      <input type="number" min={0} value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blueColor-500" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Return Amount (৳)</label>
                      <div className={`w-full border rounded-lg px-3 py-2 text-sm font-bold ${returnAmount > 0 ? "border-green-300 bg-green-50 text-green-700" : "border-gray-200 bg-gray-50 text-gray-500"}`}>
                        ৳{returnAmount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <button type="submit" disabled={submitting || lines.length === 0}
                    className="w-full py-2.5 rounded-xl bg-blueColor-600 hover:bg-blueColor-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold transition-colors shadow-md">
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Creating Order...
                      </span>
                    ) : "Confirm Order"}
                  </button>
                  <button type="button" onClick={handlePrint} disabled={lines.length === 0}
                    className="w-full py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm flex items-center justify-center gap-2 disabled:opacity-40">
                    <FiPrinter size={14} /> Print Invoice
                  </button>
                  <button type="button" onClick={() => navigate("/order")}
                    className="w-full py-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm">
                    Cancel
                  </button>
                </div>
              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOrderPage;
