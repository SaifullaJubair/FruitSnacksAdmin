import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FaRegEye, FaPrint } from "react-icons/fa";
import { AuthContext } from "../../context/AuthProvider";
import useDebounced from "../../hooks/useDebounced";
import { BASE_URL } from "../../utils/baseURL";
import TableLoadingSkeleton from "../../components/common/loadingSkeleton/TableLoadingSkeleton";
import Pagination from "../../components/common/pagination/Pagination";
import MiniSpinner from "../../shared/MiniSpinner/MiniSpinner";
import PrintableInvoice from "../../components/common/printableInvoice/PrintableInvoice";
import { SettingContext } from "../../context/SettingProvider";
import { toast } from "react-toastify";
import Swal from "sweetalert2-optimized";

// ===================== CONSTANTS =====================
const TABS = [
  { label: "Pending", value: "pending" },
  { label: "Steadfast", value: "steadfast" },
  { label: "Pathao", value: "pathao" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
  { label: "All", value: "all" },
];

const STEADFAST_SUB_TABS = [
  { label: "All", value: "all" },
  { label: "In Review", value: "in_review" },
  { label: "Pending", value: "pending" },
  { label: "Hold", value: "hold" },
  { label: "Delivered", value: "delivered" },
  { label: "Partial Delivered", value: "partial_delivered" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Unknown", value: "unknown" },
];

const STEADFAST_STATUS_COLOR = {
  delivered: "bg-green-100 text-green-700",
  partial_delivered: "bg-yellow-100 text-yellow-700",
  cancelled: "bg-red-100 text-red-700",
  in_review: "bg-blue-100 text-blue-700",
  pending: "bg-orange-100 text-orange-700",
  hold: "bg-purple-100 text-purple-700",
  delivered_approval_pending: "bg-green-50 text-green-600",
  partial_delivered_approval_pending: "bg-yellow-50 text-yellow-600",
  cancelled_approval_pending: "bg-red-50 text-red-600",
  unknown_approval_pending: "bg-gray-50 text-gray-500",
  unknown: "bg-gray-100 text-gray-600",
};

const ORDER_STATUS_COLOR = {
  pending: "bg-orange-100 text-orange-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancel: "bg-red-100 text-red-700",
  return: "bg-yellow-100 text-yellow-700",
};

// Steadfast এ cancel করা যাবে না এই status গুলোতে
const STEADFAST_CANCEL_BLOCKED = [
  "delivered_approval_pending",
  "partial_delivered_approval_pending",
  "cancelled_approval_pending",
  "unknown_approval_pending",
  "delivered",
  "partial_delivered",
  "cancelled",
  "unknown",
  "hold",
];

// ===================== MAIN COMPONENT =====================
const OrderPage = () => {
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [steadfastSubTab, setSteadfastSubTab] = useState("all");
  const [buttonLoading, setButtonLoading] = useState(false);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderProducts, setSelectedOrderProducts] = useState([]);
  const [loadingOrderId, setLoadingOrderId] = useState(null);

  const { user, loading } = useContext(AuthContext);
  const { settingData } = useContext(SettingContext);

  const searchText = useDebounced({ searchQuery: searchValue, delay: 500 });
  useEffect(() => {
    setSearchTerm(searchText);
    setPage(1);
  }, [searchText]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
    setSearchValue("");
    setSearchTerm("");
    setSteadfastSubTab("all"); // sub-tab reset
  };

  const handleSteadfastSubTabChange = (tab) => {
    setSteadfastSubTab(tab);
    setPage(1);
  };

  // ===================== BUILD API URL =====================
  const buildApiUrl = () => {
    const base = `${BASE_URL}/order`;
    const common = `page=${page}&limit=${limit}&searchTerm=${searchTerm}`;

    if (activeTab === "steadfast") {
      return `${base}/steadfast?${common}&steadfast_status=${steadfastSubTab}`;
    }
    if (activeTab === "pathao") {
      return `${base}/dashboard?${common}&courier_type=pathao`;
    }
    if (activeTab === "all") {
      return `${base}/dashboard?${common}`;
    }
    if (activeTab === "delivered") {
      return `${base}/dashboard?${common}&order_status=delivered`;
    }
    if (activeTab === "cancelled") {
      return `${base}/dashboard?${common}&order_status=cancel`;
    }
    // pending
    return `${base}/dashboard?${common}&order_status=pending`;
  };

  const {
    data: ordersData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["orders", activeTab, steadfastSubTab, page, limit, searchTerm],
    queryFn: async () => {
      const res = await fetch(buildApiUrl(), { credentials: "include" });
      return res.json();
    },
  });

  const orders = ordersData?.data || [];
  const totalData = ordersData?.totalData || 0;

  // ===================== PRINT =====================
  const handlePrintClick = async (order) => {
    try {
      const res = await fetch(`${BASE_URL}/order/${order._id}`, {
        credentials: "include",
      });
      const result = await res.json();
      if (result?.statusCode === 200) {
        setSelectedOrder(result?.data?.order);
        setSelectedOrderProducts(result?.data?.order_products);
        setPrintModalOpen(true);
      }
    } catch {
      toast.error("Failed to fetch order details for printing");
    }
  };

  // ===================== SEND TO STEADFAST =====================
  const handleSendToSteadfast = async (order) => {
    const confirm = await Swal.fire({
      title: "Steadfast এ পাঠাবেন?",
      text: `Invoice: ${order?.invoice_id}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, send it!",
    });
    if (!confirm.isConfirmed) return;

    try {
      setLoadingOrderId(order._id);

      const res = await fetch(
        `${BASE_URL}/courier/steadfast/send/${order._id}`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        },
      );
      const data = await res.json();
      if (data?.success) {
        Swal.fire(
          "Sent!",
          `Tracking: ${data?.data?.tracking_code || ""}`,
          "success",
        );
        refetch();
      } else {
        throw new Error(data?.message || "Failed!");
      }
    } catch (error) {
      Swal.fire("Error!", error.message, "error");
    } finally {
      setLoadingOrderId(null);
    }
  };

  // ===================== SEND TO PATHAO =====================
  const handleSendToPathao = async (order) => {
    const confirm = await Swal.fire({
      title: "Pathao তে পাঠাবেন?",
      text: `Invoice: ${order?.invoice_id}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, send it!",
    });
    if (!confirm.isConfirmed) return;

    try {
      setLoadingOrderId(order._id);
      const res = await fetch(`${BASE_URL}/courier/pathao/send/${order._id}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data?.success) {
        Swal.fire(
          "Sent!",
          `Consignment: ${data?.data?.consignment_id || ""}`,
          "success",
        );
        refetch();
      } else {
        throw new Error(data?.message || "Failed!");
      }
    } catch (error) {
      Swal.fire("Error!", error.message, "error");
    } finally {
      setLoadingOrderId(null);
    }
  };

  // ===================== CANCEL ORDER =====================
  const handleCancelOrder = async (order) => {
    const isSteadfastSent =
      order?.courier_type === "steadfast" && order?.steadfast_consignment_id;
    const isPathaoSent =
      order?.courier_type === "pathao" && order?.consignment_id;

    // Steadfast blocked status check — frontend এও block করো
    if (
      order?.courier_type === "steadfast" &&
      STEADFAST_CANCEL_BLOCKED.includes(order?.steadfast_status)
    ) {
      Swal.fire(
        "Cannot Cancel!",
        `Order is already "${order?.steadfast_status}" in Steadfast. Please manage from Steadfast portal.`,
        "error",
      );
      return;
    }

    let warningHtml = `<p>Invoice: <strong>${order?.invoice_id}</strong></p>`;
    if (isSteadfastSent) {
      warningHtml += `<p class="text-sm text-gray-500 mt-2">⚠️ এই order Steadfast এ পাঠানো হয়েছে (${order?.steadfast_status}).<br/>DB তে cancel হবে, কিন্তু Steadfast portal এ manually cancel করতে হতে পারে।</p>`;
    } else if (isPathaoSent) {
      warningHtml += `<p class="text-sm text-gray-500 mt-2">⚠️ এই order Pathao তে পাঠানো হয়েছে।<br/>DB তে cancel হবে, কিন্তু Pathao portal এ manually cancel করতে হবে।</p>`;
    }

    const confirm = await Swal.fire({
      title: "Cancel করবেন?",
      html: warningHtml,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, Cancel Order!",
      cancelButtonText: "No",
    });
    if (!confirm.isConfirmed) return;

    try {
      setButtonLoading(true);

      // ✅ Steadfast এর জন্য আলাদা cancel route
      if (order?.courier_type === "steadfast") {
        const res = await fetch(
          `${BASE_URL}/order/steadfast/cancel/${order._id}`,
          {
            method: "PATCH",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          },
        );
        const data = await res.json();
        if (data?.success) {
          // backend থেকে pending এর জন্য warning message আসে
          if (order?.steadfast_status === "pending") {
            Swal.fire({
              title: "DB তে Cancel হয়েছে!",
              html: `⚠️ এখন <a href="https://portal.packzy.com" target="_blank" style="color:blue;text-decoration:underline">Steadfast Portal</a> এ গিয়ে manually cancel করুন।<br/>Consignment ID: <b>${order?.steadfast_consignment_id}</b>`,
              icon: "warning",
            });
          } else {
            toast.success(data?.message || "Order Cancelled!");
          }
          refetch();
        } else {
          throw new Error(data?.message || "Cancel Failed!");
        }
        return;
      }

      // ✅ Normal / Pathao order cancel
      const cancelTime =
        new Date().toISOString().split("T")[0] +
        " " +
        new Date().toLocaleTimeString();

      const res = await fetch(`${BASE_URL}/order`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _id: order._id,
          order_status: "cancel",
          cancel_time: cancelTime,
          order_updated_by: user?._id,
        }),
      });
      const data = await res.json();
      if (data?.statusCode === 200) {
        if (isPathaoSent) {
          Swal.fire({
            title: "DB তে Cancel হয়েছে!",
            html: `⚠️ এখন <a href="https://merchant.pathao.com" target="_blank" style="color:blue;text-decoration:underline">Pathao Portal</a> এ গিয়ে manually cancel করুন।<br/>Consignment ID: <b>${order?.consignment_id}</b>`,
            icon: "warning",
          });
        } else {
          toast.success("Order Cancel হয়েছে!");
        }
        refetch();
      } else {
        throw new Error(data?.message || "Cancel Failed!");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setButtonLoading(false);
    }
  };

  if (!user?.role_id?.order_show) {
    return (
      <div className="flex items-center justify-center h-40 text-red-500 font-medium">
        Access Denied!
      </div>
    );
  }

  // ===================== RENDER TABLE HEAD =====================
  const renderTableHead = () => {
    if (activeTab === "pending") {
      return (
        <tr className="divide-x divide-gray-300 font-semibold text-center text-gray-900">
          <td className="whitespace-nowrap p-4">SL</td>
          <td className="whitespace-nowrap p-4">Print</td>
          <td className="whitespace-nowrap p-4">Invoice</td>
          <td className="whitespace-nowrap p-4">Customer</td>
          <td className="whitespace-nowrap p-4">Phone</td>
          <td className="whitespace-nowrap p-4">Grand Total</td>
          <td className="whitespace-nowrap p-4">Address</td>
          <td className="whitespace-nowrap p-4">Date</td>
          <td className="whitespace-nowrap p-4">Send Courier</td>
          <td className="whitespace-nowrap p-4">Cancel</td>
          <td className="whitespace-nowrap p-4">Details</td>
        </tr>
      );
    }
    if (activeTab === "steadfast") {
      return (
        <tr className="divide-x divide-gray-300 font-semibold text-center text-gray-900">
          <td className="whitespace-nowrap p-4">SL</td>
          <td className="whitespace-nowrap p-4">Invoice</td>
          <td className="whitespace-nowrap p-4">Customer</td>
          <td className="whitespace-nowrap p-4">Phone</td>
          <td className="whitespace-nowrap p-4">Tracking Code</td>
          <td className="whitespace-nowrap p-4">Consignment ID</td>
          <td className="whitespace-nowrap p-4">Steadfast Status</td>
          <td className="whitespace-nowrap p-4">Grand Total</td>
          <td className="whitespace-nowrap p-4">Date</td>
          <td className="whitespace-nowrap p-4">Cancel</td>
          <td className="whitespace-nowrap p-4">Details</td>
        </tr>
      );
    }
    // default (all, delivered, cancelled, pathao)
    return (
      <tr className="divide-x divide-gray-300 font-semibold text-center text-gray-900">
        <td className="whitespace-nowrap p-4">SL</td>
        <td className="whitespace-nowrap p-4">Invoice</td>
        <td className="whitespace-nowrap p-4">Customer</td>
        <td className="whitespace-nowrap p-4">Phone</td>
        <td className="whitespace-nowrap p-4">Order Status</td>
        <td className="whitespace-nowrap p-4">Courier</td>
        <td className="whitespace-nowrap p-4">Grand Total</td>
        <td className="whitespace-nowrap p-4">Date</td>
        <td className="whitespace-nowrap p-4">Details</td>
      </tr>
    );
  };

  // ===================== RENDER TABLE ROW =====================
  const renderTableRow = (order, index) => {
    const rowClass = `divide-x divide-gray-200 ${index % 2 === 0 ? "bg-white" : "bg-tableRowBGColor"}`;

    // ---------- PENDING TAB ----------
    if (activeTab === "pending") {
      return (
        <tr key={order._id} className={rowClass}>
          <td className="whitespace-nowrap p-4">
            {(page - 1) * limit + index + 1}
          </td>
          <td className="whitespace-nowrap p-4">
            <button
              onClick={() => handlePrintClick(order)}
              className="flex items-center justify-center gap-1 text-gray-700 hover:text-blue-700"
            >
              <FaPrint /> Print
            </button>
          </td>
          <td className="whitespace-nowrap p-4">
            <Link
              to={`/all-order-info/${order._id}`}
              className="underline font-medium text-blue-600"
            >
              {order.invoice_id}
            </Link>
          </td>
          <td className="whitespace-nowrap p-4">
            {order?.customer_id?.user_name || "N/A"}
          </td>
          <td className="whitespace-nowrap p-4">{order.customer_phone}</td>
          <td className="whitespace-nowrap p-4">৳{order.grand_total_amount}</td>
          <td className="whitespace-nowrap p-4 max-w-[200px] truncate">
            {order.billing_address}, {order.billing_city}
          </td>
          <td className="whitespace-nowrap p-4 text-xs text-gray-500">
            {new Date(order.createdAt).toLocaleDateString("en-BD")}
          </td>
          <td className="whitespace-nowrap p-4">
            {loadingOrderId === order._id ? (
              <MiniSpinner />
            ) : user?.role_id?.order_update ? (
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => handleSendToPathao(order)}
                  className="h-[36px] rounded-lg px-3 bg-blue-500 hover:bg-blue-400 text-white text-xs font-medium"
                >
                  Send Pathao
                </button>
                <button
                  onClick={() => handleSendToSteadfast(order)}
                  className="h-[36px] rounded-lg px-3 bg-red-500 hover:bg-red-400 text-white text-xs font-medium"
                >
                  Send Steadfast
                </button>
              </div>
            ) : null}
          </td>
          <td className="whitespace-nowrap p-4">
            {user?.role_id?.order_update && (
              <button
                onClick={() => handleCancelOrder(order)}
                disabled={buttonLoading}
                className="h-[36px] rounded-lg px-3 bg-gray-700 hover:bg-gray-600 text-white text-xs font-medium"
              >
                Cancel
              </button>
            )}
          </td>
          <td className="whitespace-nowrap p-4">
            <Link
              to={`/all-order-info/${order._id}`}
              className="flex justify-center text-gray-500 hover:text-gray-900"
            >
              <FaRegEye size={20} />
            </Link>
          </td>
        </tr>
      );
    }

    // ---------- STEADFAST TAB ----------
    if (activeTab === "steadfast") {
      const canCancel =
        user?.role_id?.order_update &&
        !STEADFAST_CANCEL_BLOCKED.includes(order?.steadfast_status);

      return (
        <tr key={order._id} className={rowClass}>
          <td className="whitespace-nowrap p-4">
            {(page - 1) * limit + index + 1}
          </td>
          <td className="whitespace-nowrap p-4">
            <Link
              to={`/all-order-info/${order._id}`}
              className="underline font-medium text-blue-600"
            >
              {order.invoice_id}
            </Link>
          </td>
          <td className="whitespace-nowrap p-4">
            {order?.customer_id?.user_name || "N/A"}
          </td>
          <td className="whitespace-nowrap p-4">{order.customer_phone}</td>
          <td className="whitespace-nowrap p-4 font-mono text-xs">
            {order.steadfast_tracking_code || "-"}
          </td>
          <td className="whitespace-nowrap p-4 text-xs">
            {order.steadfast_consignment_id || "-"}
          </td>
          <td className="whitespace-nowrap p-4">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                STEADFAST_STATUS_COLOR[order.steadfast_status] ||
                "bg-gray-100 text-gray-600"
              }`}
            >
              {order.steadfast_status || "-"}
            </span>
          </td>
          <td className="whitespace-nowrap p-4">৳{order.grand_total_amount}</td>
          <td className="whitespace-nowrap p-4 text-xs text-gray-500">
            {new Date(order.createdAt).toLocaleDateString("en-BD")}
          </td>
          <td className="whitespace-nowrap p-4">
            {canCancel ? (
              buttonLoading ? (
                <MiniSpinner />
              ) : (
                <button
                  onClick={() => handleCancelOrder(order)}
                  disabled={buttonLoading}
                  className="h-[36px] rounded-lg px-3 bg-gray-700 hover:bg-gray-600 text-white text-xs font-medium"
                >
                  Cancel
                </button>
              )
            ) : (
              <span className="text-xs text-gray-400">-</span>
            )}
          </td>
          <td className="whitespace-nowrap p-4">
            <Link
              to={`/all-order-info/${order._id}`}
              className="flex justify-center text-gray-500 hover:text-gray-900"
            >
              <FaRegEye size={20} />
            </Link>
          </td>
        </tr>
      );
    }

    // ---------- DEFAULT ROW (all, delivered, cancelled, pathao) ----------
    return (
      <tr key={order._id} className={rowClass}>
        <td className="whitespace-nowrap p-4">
          {(page - 1) * limit + index + 1}
        </td>
        <td className="whitespace-nowrap p-4">
          <Link
            to={`/all-order-info/${order._id}`}
            className="underline font-medium text-blue-600"
          >
            {order.invoice_id}
          </Link>
        </td>
        <td className="whitespace-nowrap p-4">
          {order?.customer_id?.user_name || "N/A"}
        </td>
        <td className="whitespace-nowrap p-4">{order.customer_phone}</td>
        <td className="whitespace-nowrap p-4">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              ORDER_STATUS_COLOR[order.order_status] ||
              "bg-gray-100 text-gray-600"
            }`}
          >
            {order.order_status}
          </span>
        </td>
        <td className="whitespace-nowrap p-4">
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            {order.courier_type || "N/A"}
          </span>
        </td>
        <td className="whitespace-nowrap p-4">৳{order.grand_total_amount}</td>
        <td className="whitespace-nowrap p-4 text-xs text-gray-500">
          {new Date(order.createdAt).toLocaleDateString("en-BD")}
        </td>
        <td className="whitespace-nowrap p-4">
          <Link
            to={`/all-order-info/${order._id}`}
            className="flex justify-center text-gray-500 hover:text-gray-900"
          >
            <FaRegEye size={20} />
          </Link>
        </td>
      </tr>
    );
  };

  // ===================== RENDER =====================
  return (
    <div className="bg-white rounded py-6 px-4 shadow">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
        <h1 className="text-2xl font-semibold">Order List</h1>
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search by Invoice No..."
          className="w-full sm:w-[300px] px-4 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
        />
      </div>

      {/* Main Tabs */}
      <div className="flex flex-wrap gap-2 mb-3 border-b pb-3">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTabChange(tab.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
              activeTab === tab.value
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Steadfast Sub-Tabs */}
      {activeTab === "steadfast" && (
        <div className="flex flex-wrap gap-2 mb-4 pb-3 border-b">
          {STEADFAST_SUB_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleSteadfastSubTabChange(tab.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200 ${
                steadfastSubTab === tab.value
                  ? "bg-red-500 text-white border-red-500"
                  : "bg-white text-gray-600 border-gray-300 hover:border-red-400"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      {isLoading || loading ? (
        <TableLoadingSkeleton />
      ) : orders.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          No orders found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded">
          <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm border rounded">
            <thead className="bg-[#fff9ee]">{renderTableHead()}</thead>
            <tbody className="divide-y divide-gray-200 text-center">
              {orders.map((order, index) => renderTableRow(order, index))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalData > 10 && (
        <Pagination
          page={page}
          setPage={setPage}
          limit={limit}
          setLimit={setLimit}
          totalData={totalData}
        />
      )}

      {/* Print Modal */}
      {printModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-auto">
            <PrintableInvoice
              order={selectedOrder}
              orderProducts={selectedOrderProducts}
              settingData={settingData}
            />
            <div className="p-4 flex justify-end">
              <button
                onClick={() => setPrintModalOpen(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderPage;
