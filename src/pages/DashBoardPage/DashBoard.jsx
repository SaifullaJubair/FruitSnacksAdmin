import { BASE_URL } from "../../utils/baseURL";
import { useQuery } from "@tanstack/react-query";
import { LoaderOverlay } from "../../components/common/loader/LoderOverley";
import { Link } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import {
  FiShoppingBag,
  FiUsers,
  FiTrendingUp,
  FiPackage,
  FiTruck,
  FiDollarSign,
  FiRefreshCw,
} from "react-icons/fi";
import { useState } from "react";
import { toast } from "react-toastify";

// ── stat card icons map ──────────────────────────────────────────
const ICON_MAP = {
  0: <FiShoppingBag size={22} />,
  1: <FiUsers size={22} />,
  2: <FiTrendingUp size={22} />,
  3: <FiPackage size={22} />,
  4: <FiDollarSign size={22} />,
  5: <FiTruck size={22} />,
};

const CARD_COLORS = [
  { bg: "bg-blue-50", icon: "bg-blue-500", text: "text-blue-600" },
  { bg: "bg-emerald-50", icon: "bg-emerald-500", text: "text-emerald-600" },
  { bg: "bg-amber-50", icon: "bg-amber-500", text: "text-amber-600" },
  { bg: "bg-rose-50", icon: "bg-rose-500", text: "text-rose-600" },
  { bg: "bg-violet-50", icon: "bg-violet-500", text: "text-violet-600" },
  { bg: "bg-cyan-50", icon: "bg-cyan-500", text: "text-cyan-600" },
];

const DashBoard = () => {
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [steadfastBalance, setSteadfastBalance] = useState(null);

  // ── main dashboard data ──────────────────────────────────────
  const { data: getDashboardData, isLoading } = useQuery({
    queryKey: ["/api/v1/dashboard"],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/dashboard`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Dashboard fetch failed");
      return res.json();
    },
  });

  // ── fetch steadfast balance ──────────────────────────────────
  const handleFetchBalance = async () => {
    try {
      setBalanceLoading(true);
      const res = await fetch(`${BASE_URL}/courier/steadfast/balance`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data?.success) {
        setSteadfastBalance(data?.data?.current_balance ?? data?.data);
      } else {
        throw new Error(data?.message || "Failed");
      }
    } catch (err) {
      toast.error("Steadfast balance fetch failed");
    } finally {
      setBalanceLoading(false);
    }
  };

  if (isLoading) return <LoaderOverlay />;

  const stats = getDashboardData?.data || [];

  // ── dummy chart data (replace with real API later) ───────────
  const salesData = [
    { name: "Jan", sales: 4200, orders: 24 },
    { name: "Feb", sales: 5800, orders: 31 },
    { name: "Mar", sales: 3900, orders: 19 },
    { name: "Apr", sales: 7200, orders: 42 },
    { name: "May", sales: 6100, orders: 38 },
    { name: "Jun", sales: 8400, orders: 55 },
    { name: "Jul", sales: 9100, orders: 61 },
  ];

  const orderStatusData = [
    { name: "Pending", value: 18 },
    { name: "Processing", value: 34 },
    { name: "Shipped", value: 27 },
    { name: "Delivered", value: 89 },
    { name: "Cancelled", value: 9 },
  ];

  return (
    <div className="space-y-6">
      {/* ── header ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Welcome back! Here&apos;s what&apos;s happening.
          </p>
        </div>
        <span className="text-xs text-gray-400">
          {new Date().toLocaleDateString("en-BD", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
      </div>

      {/* ── stat cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((data, index) => {
          const color = CARD_COLORS[index % CARD_COLORS.length];
          return (
            <Link
              to={data?.url_link}
              key={index}
              className={`${color.bg} rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col gap-3`}
            >
              <div
                className={`${color.icon} w-10 h-10 rounded-lg flex items-center justify-center text-white`}
              >
                {ICON_MAP[index] || <FiPackage size={22} />}
              </div>
              <div>
                <p className={`text-2xl font-bold ${color.text}`}>
                  {data?.number}
                </p>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">
                  {data?.title}
                </p>
              </div>
            </Link>
          );
        })}

        {/* ── Steadfast Balance Card ────────────────────────── */}
        <div className="bg-orange-50 rounded-xl p-4 shadow-sm flex flex-col gap-3">
          <div className="bg-orange-500 w-10 h-10 rounded-lg flex items-center justify-center text-white">
            <FiTruck size={22} />
          </div>
          <div>
            {steadfastBalance !== null ? (
              <p className="text-2xl font-bold text-orange-600">
                ৳{steadfastBalance}
              </p>
            ) : (
              <p className="text-sm text-gray-400 font-medium">Not loaded</p>
            )}
            <div className="flex items-center gap-1 mt-0.5">
              <p className="text-xs text-gray-500 font-medium">
                Steadfast Balance
              </p>
              <button
                onClick={handleFetchBalance}
                disabled={balanceLoading}
                title="Refresh balance"
                className="ml-auto text-orange-400 hover:text-orange-600 disabled:opacity-50"
              >
                <FiRefreshCw
                  size={12}
                  className={balanceLoading ? "animate-spin" : ""}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── charts row ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-700">
              Sales Overview
            </h2>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
              Last 7 months
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#3b82f6"
                strokeWidth={2.5}
                fill="url(#salesGrad)"
                name="Sales (৳)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-700">
              Order Status
            </h2>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
              This month
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={orderStatusData} layout="vertical">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f0f0f0"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 11, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
                width={70}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  fontSize: 12,
                }}
              />
              <Bar
                dataKey="value"
                fill="#10b981"
                radius={[0, 4, 4, 0]}
                name="Orders"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── quick links ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Pending Orders",
            to: "/order",
            color: "border-orange-400 text-orange-600 bg-orange-50",
          },
          {
            label: "Steadfast Orders",
            to: "/order?tab=steadfast",
            color: "border-red-400 text-red-600 bg-red-50",
          },
          {
            label: "All Products",
            to: "/product",
            color: "border-blue-400 text-blue-600 bg-blue-50",
          },
          {
            label: "All Customers",
            to: "/customer",
            color: "border-emerald-400 text-emerald-600 bg-emerald-50",
          },
        ].map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`border-l-4 rounded-lg px-4 py-3 text-sm font-medium hover:shadow-sm transition-shadow ${link.color}`}
          >
            {link.label} →
          </Link>
        ))}
      </div>
    </div>
  );
};

export default DashBoard;
