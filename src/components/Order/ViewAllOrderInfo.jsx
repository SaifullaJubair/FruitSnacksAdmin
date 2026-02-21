import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { BASE_URL } from "../../utils/baseURL";
import { LoaderOverlay } from "../common/loader/LoderOverley";
import { DateFormate } from "../../utils/DateFormate/DateFormate";
import { useState } from "react";
import { toast } from "react-toastify";
import { FiRefreshCw, FiExternalLink } from "react-icons/fi";
import { FaTruck, FaCheckCircle, FaTimesCircle, FaClock } from "react-icons/fa";

const STEADFAST_STATUS_COLOR = {
  delivered: "bg-green-100 text-green-700 border-green-200",
  partial_delivered: "bg-yellow-100 text-yellow-700 border-yellow-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
  in_review: "bg-blue-100 text-blue-700 border-blue-200",
  pending: "bg-orange-100 text-orange-700 border-orange-200",
  hold: "bg-purple-100 text-purple-700 border-purple-200",
  delivered_approval_pending: "bg-green-50 text-green-600 border-green-100",
  partial_delivered_approval_pending:
    "bg-yellow-50 text-yellow-600 border-yellow-100",
  cancelled_approval_pending: "bg-red-50 text-red-600 border-red-100",
  unknown_approval_pending: "bg-gray-50 text-gray-500 border-gray-100",
  unknown: "bg-gray-100 text-gray-600 border-gray-200",
};

const PATHAO_STATUS_COLOR = {
  Delivered: "bg-green-100 text-green-700 border-green-200",
  "Partial Delivery": "bg-yellow-100 text-yellow-700 border-yellow-200",
  Cancelled: "bg-red-100 text-red-700 border-red-200",
  "In Transit": "bg-purple-100 text-purple-700 border-purple-200",
  "Out for Delivery": "bg-orange-100 text-orange-700 border-orange-200",
  Return: "bg-red-50 text-red-500 border-red-100",
  "Delivery Failed": "bg-red-50 text-red-500 border-red-100",
  "On Hold": "bg-purple-50 text-purple-500 border-purple-100",
  "Pickup Requested": "bg-blue-100 text-blue-700 border-blue-200",
};

const ORDER_STATUS_COLOR = {
  pending: "bg-orange-100 text-orange-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancel: "bg-red-100 text-red-700",
  return: "bg-yellow-100 text-yellow-700",
};

const ViewAllOrderInfo = () => {
  const { id } = useParams();
  const [syncing, setSyncing] = useState(false);

  const {
    data: orders,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [`/api/v1/order/${id}`],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/order/${id}`, {
        credentials: "include",
      });
      return res.json();
    },
  });

  if (isLoading) return <LoaderOverlay />;

  const order = orders?.data?.order;
  const orderProducts = orders?.data?.order_products;
  const isSteadfast = order?.courier_type === "steadfast";
  const isPathao = order?.courier_type === "pathao";

  const handleSync = async () => {
    try {
      setSyncing(true);
      const url = isSteadfast
        ? `${BASE_URL}/courier/steadfast/sync/${id}`
        : `${BASE_URL}/courier/pathao/sync/${id}`;
      const res = await fetch(url, { method: "PATCH", credentials: "include" });
      const data = await res.json();
      if (data?.success) {
        toast.success(`Synced! → ${data?.data?.order_status}`);
        refetch();
      } else throw new Error(data?.message);
    } catch (err) {
      toast.error(err.message || "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <section className="max-w-6xl mx-auto space-y-4 pb-10">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between bg-[#fff9ee] px-5 py-3 shadow rounded">
        <div>
          <p className="text-lg font-semibold text-gray-800">Order Details</p>
          <p className="text-xs text-gray-400">Invoice: {order?.invoice_id}</p>
        </div>
        <div className="flex items-center gap-3 mt-2 sm:mt-0">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${ORDER_STATUS_COLOR[order?.order_status] || "bg-gray-100 text-gray-600"}`}
          >
            {order?.order_status}
          </span>
          {order?.courier_type && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 capitalize">
              {order?.courier_type}
            </span>
          )}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#fff9ee] p-4 shadow rounded">
          <p className="text-xs font-semibold uppercase text-gray-400 mb-1">
            Billing To
          </p>
          <p className="font-semibold text-gray-800">
            {order?.customer_id?.user_name}
          </p>
          <p className="text-sm text-gray-500">
            {order?.customer_id?.user_phone}
          </p>
          <p className="text-xs text-gray-400 mt-1">{order?.billing_address}</p>
          <p className="text-xs text-gray-400">
            {order?.billing_state}, {order?.billing_city}
          </p>
        </div>
        <div className="bg-[#fff9ee] p-4 shadow rounded">
          <p className="text-xs font-semibold uppercase text-gray-400 mb-1">
            Invoice
          </p>
          <p className="font-bold text-gray-800 text-lg">{order?.invoice_id}</p>
          <p className="text-xs text-gray-400 mt-1">
            {DateFormate(order?.createdAt)}
          </p>
        </div>
        <div className="bg-[#fff9ee] p-4 shadow rounded">
          <p className="text-xs font-semibold uppercase text-gray-400 mb-1">
            Shipping
          </p>
          <p className="font-semibold text-gray-800">
            {order?.shipping_location}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Cost: ৳{order?.shipping_cost}
          </p>
        </div>
        <div className="bg-[#fff9ee] p-4 shadow rounded">
          <p className="text-xs font-semibold uppercase text-gray-400 mb-1">
            Grand Total
          </p>
          <p className="font-bold text-2xl text-gray-800">
            ৳{order?.grand_total_amount}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Sub: ৳{order?.sub_total_amount} | Discount: ৳
            {order?.discount_amount}
          </p>
        </div>
      </div>

      {/* Steadfast Info */}
      {isSteadfast && (
        <div className="bg-white border border-orange-100 shadow rounded p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FaTruck className="text-orange-500" size={18} />
              <h3 className="font-semibold text-gray-700">
                Steadfast Courier Info
              </h3>
            </div>
            {order?.steadfast_consignment_id && (
              <button
                onClick={handleSync}
                disabled={syncing}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 disabled:opacity-50 transition"
              >
                <FiRefreshCw
                  size={12}
                  className={syncing ? "animate-spin" : ""}
                />
                {syncing ? "Syncing..." : "Sync Status"}
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-400 font-medium mb-1">
                Steadfast Status
              </p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${STEADFAST_STATUS_COLOR[order?.steadfast_status] || "bg-gray-100 text-gray-600 border-gray-200"}`}
              >
                {order?.steadfast_status || "-"}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium mb-1">
                Consignment ID
              </p>
              <p className="text-sm font-mono font-semibold text-gray-700">
                {order?.steadfast_consignment_id || "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium mb-1">
                Tracking Code
              </p>
              <p className="text-sm font-mono font-semibold text-gray-700">
                {order?.steadfast_tracking_code || "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium mb-1">Portal</p>
              <a
                href="https://portal.packzy.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
              >
                Steadfast Portal <FiExternalLink size={11} />
              </a>
            </div>
          </div>
          {order?.steadfast_tracking_message && (
            <div className="mt-4 bg-orange-50 border border-orange-100 rounded p-3">
              <p className="text-xs text-gray-500 font-medium mb-1">
                Last Tracking Message
              </p>
              <p className="text-sm text-gray-700">
                {order?.steadfast_tracking_message}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Pathao Info */}
      {isPathao && (
        <div className="bg-white border border-blue-100 shadow rounded p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FaTruck className="text-blue-500" size={18} />
              <h3 className="font-semibold text-gray-700">
                Pathao Courier Info
              </h3>
            </div>
            {order?.consignment_id && (
              <button
                onClick={handleSync}
                disabled={syncing}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 disabled:opacity-50 transition"
              >
                <FiRefreshCw
                  size={12}
                  className={syncing ? "animate-spin" : ""}
                />
                {syncing ? "Syncing..." : "Sync Status"}
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-400 font-medium mb-1">
                Pathao Status
              </p>
              {order?.pathao_status ? (
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${PATHAO_STATUS_COLOR[order?.pathao_status] || "bg-gray-100 text-gray-600 border-gray-200"}`}
                >
                  {order?.pathao_status}
                </span>
              ) : (
                <span className="text-xs text-gray-400">Not synced yet</span>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium mb-1">
                Consignment ID
              </p>
              <p className="text-sm font-mono font-semibold text-gray-700">
                {order?.consignment_id || "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium mb-1">
                Tracking Code
              </p>
              <p className="text-sm font-mono font-semibold text-gray-700">
                {order?.tracking_code || "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium mb-1">
                City / Zone
              </p>
              <p className="text-xs text-gray-600 mb-1">
                {order?.pathao_city_name || "-"} /{" "}
                {order?.pathao_zone_name || "-"}
              </p>
              <a
                href="https://merchant.pathao.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
              >
                Pathao Portal <FiExternalLink size={11} />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="bg-white shadow rounded p-5">
        <h3 className="font-semibold text-gray-700 mb-4">Order Timeline</h3>
        <div className="flex flex-wrap gap-3">
          {[
            {
              label: "Pending",
              time: order?.pending_time,
              icon: <FaClock size={13} />,
            },
            {
              label: "Processing",
              time: order?.processing_time,
              icon: <FaClock size={13} />,
            },
            {
              label: "Shipped",
              time: order?.shipped_time,
              icon: <FaTruck size={13} />,
            },
            {
              label: "Delivered",
              time: order?.delivered_time,
              icon: <FaCheckCircle size={13} />,
            },
            {
              label: "Cancelled",
              time: order?.cancel_time,
              icon: <FaTimesCircle size={13} />,
            },
            {
              label: "Returned",
              time: order?.return_time,
              icon: <FaTimesCircle size={13} />,
            },
          ]
            .filter((s) => s.time)
            .map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-gray-50 border rounded-lg px-4 py-2"
              >
                <span className="text-gray-400">{s.icon}</span>
                <div>
                  <p className="font-medium text-gray-700 text-xs">{s.label}</p>
                  <p className="text-gray-400 text-xs">{s.time}</p>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Products */}
      <div className="bg-[#fff9ee] shadow rounded overflow-hidden">
        <div className="px-5 py-3 border-b">
          <h3 className="font-semibold text-gray-700">Ordered Products</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-white border-b">
              <tr className="text-gray-500 text-center">
                {["SL", "Image", "Product", "Unit Price", "Qty", "Total"].map(
                  (h) => (
                    <th key={h} className="p-4 whitespace-nowrap">
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orderProducts?.map((product, idx) => (
                <tr
                  key={idx}
                  className={`text-center ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                >
                  <td className="p-4">{idx + 1}</td>
                  <td className="p-4 flex justify-center">
                    <img
                      src={
                        product?.variation_id?.variation_image ||
                        product?.product_id?.main_image
                      }
                      className="w-16 h-14 rounded border object-cover"
                      alt=""
                    />
                  </td>
                  <td className="p-4 text-left min-w-[200px]">
                    <p className="font-medium text-gray-800">
                      {product?.product_id?.product_name}
                    </p>
                    {product?.variation_id && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        Variation: {product?.variation_id?.variation_name}
                      </p>
                    )}
                  </td>
                  <td className="p-4 font-medium text-gray-700">
                    ৳{product?.product_unit_final_price}
                  </td>
                  <td className="p-4 text-gray-700">
                    {product?.product_quantity}
                  </td>
                  <td className="p-4 font-semibold text-gray-800">
                    ৳{product?.product_grand_total_price}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end p-5">
          <div className="w-full max-w-xs space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Sub Total</span>
              <span>৳{order?.sub_total_amount}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Discount</span>
              <span>- ৳{order?.discount_amount}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Shipping</span>
              <span>৳{order?.shipping_cost}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-800 border-t pt-2 text-base">
              <span>Grand Total</span>
              <span>৳{order?.grand_total_amount}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ViewAllOrderInfo;
