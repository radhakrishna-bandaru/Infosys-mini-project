import { useEffect, useMemo, useState } from "react";
import {
  ShoppingCart,
  ClipboardList,
  Package,
  TrendingUp,
  RefreshCw,
} from "lucide-react";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  getRequirements,
  getCrops,
  getOrders,
} from "../../services/api";

import { getLoggedInUser } from "../../utils/auth";

export default function BuyerAnalytics() {
  const user = getLoggedInUser("buyer");

  const buyerId =
    user?.id ||
    user?._id ||
    user?.buyerId ||
    "";

  const [requirements, setRequirements] =
    useState([]);

  const [crops, setCrops] = useState([]);

  const [orders, setOrders] = useState([]);

  const [loading, setLoading] =
    useState(true);

  async function loadAnalytics() {
    try {
      setLoading(true);

      const [
        requirementsResponse,
        cropsResponse,
        ordersResponse,
      ] = await Promise.all([
        getRequirements(buyerId),
        getCrops(),
        getOrders({ buyerId }),
      ]);

      setRequirements(
        requirementsResponse.requirements || []
      );

      setCrops(
        cropsResponse.crops || []
      );

      setOrders(
        ordersResponse.orders || []
      );
    } catch (error) {
      console.error(
        "Buyer analytics error:",
        error
      );

      alert(
        error.message ||
          "Failed to load analytics"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics();
  }, []);

  // ==================== SUMMARY ====================

  const totalOrderValue = orders.reduce(
    (sum, order) =>
      sum + Number(order.totalAmount || 0),
    0
  );

  const totalPurchasedQuantity =
    orders.reduce(
      (sum, order) =>
        sum + Number(order.quantity || 0),
      0
    );

  const completedOrders = orders.filter(
    (order) =>
      order.status === "completed"
  );

  const activeRequirements =
    requirements.filter(
      (item) => item.status === "active"
    );

  // ==================== CROP REQUIREMENTS ====================

  const requirementData = useMemo(() => {
    const map = {};

    requirements.forEach((item) => {
      const crop =
        item.cropName || "Unknown";

      if (!map[crop]) {
        map[crop] = {
          crop,
          quantity: 0,
        };
      }

      map[crop].quantity += Number(
        item.quantity || 0
      );
    });

    return Object.values(map).sort(
      (a, b) =>
        b.quantity - a.quantity
    );
  }, [requirements]);

  // ==================== ORDER STATUS ====================

  const orderStatusData = useMemo(() => {
    const statuses = [
      "pending",
      "confirmed",
      "processing",
      "completed",
      "cancelled",
      "declined",
    ];

    return statuses.map((status) => ({
      status:
        status.charAt(0).toUpperCase() +
        status.slice(1),
      count: orders.filter(
        (order) =>
          order.status === status
      ).length,
    }));
  }, [orders]);

  // ==================== MONTHLY ORDERS ====================

  const monthlyData = useMemo(() => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const year =
      new Date().getFullYear();

    return months.map(
      (month, index) => {
        const monthOrders =
          orders.filter((order) => {
            if (!order.createdAt)
              return false;

            const date = new Date(
              order.createdAt
            );

            return (
              date.getFullYear() ===
                year &&
              date.getMonth() === index
            );
          });

        const value =
          monthOrders.reduce(
            (sum, order) =>
              sum +
              Number(
                order.totalAmount || 0
              ),
            0
          );

        return {
          month,
          orders: monthOrders.length,
          value,
        };
      }
    );
  }, [orders]);

  // ==================== AVAILABLE CROPS ====================

  const cropAvailability = useMemo(() => {
    const map = {};

    crops
      .filter(
        (crop) =>
          crop.status === "active"
      )
      .forEach((crop) => {
        const name =
          crop.cropName || "Unknown";

        if (!map[name]) {
          map[name] = {
            crop: name,
            quantity: 0,
          };
        }

        map[name].quantity += Number(
          crop.quantity || 0
        );
      });

    return Object.values(map)
      .sort(
        (a, b) =>
          b.quantity - a.quantity
      )
      .slice(0, 8);
  }, [crops]);

  return (
    <div className="buyer-requirements-page space-y-6 pb-10">
      {/* HEADER */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
         

          <h1 className="mt-1 text-2xl font-bold text-[#17351f] sm:text-3xl">
            Analytics
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Analyze your purchasing activity,
            requirements and crop availability.
          </p>
        </div>

        <button
          onClick={loadAnalytics}
          disabled={loading}
          className="sf-button sf-button-secondary inline-flex items-center justify-center gap-2"
        >
          <RefreshCw
            size={17}
            className={
              loading
                ? "animate-spin"
                : ""
            }
          />

          Refresh
        </button>
      </div>

      {/* SUMMARY */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          icon={<ShoppingCart size={21} />}
          title="Total Orders"
          value={orders.length}
          subtitle={`${completedOrders.length} completed`}
        />

        <Metric
          icon={<Package size={21} />}
          title="Purchased Quantity"
          value={`${totalPurchasedQuantity.toLocaleString()} kg`}
          subtitle="Across all orders"
        />

        <Metric
          icon={<TrendingUp size={21} />}
          title="Order Value"
          value={`₹${totalOrderValue.toLocaleString()}`}
          subtitle="Total purchase value"
        />

        <Metric
          icon={<ClipboardList size={21} />}
          title="Active Requirements"
          value={activeRequirements.length}
          subtitle="Current requirements"
        />
      </div>

      {/* FIRST CHART ROW */}

      <div className="grid gap-6 xl:grid-cols-2">
        {/* REQUIREMENTS */}

        <div className="sf-card overflow-hidden p-5 sm:p-6">
          <div className="mb-5">
            <h2 className="font-bold text-[#17351f]">
              Crop Requirements
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Quantity requested across your
              requirements.
            </p>
          </div>

          {loading ? (
            <ChartLoading />
          ) : requirementData.length ===
            0 ? (
            <ChartEmpty text="No requirement data available." />
          ) : (
            <div className="h-[280px]">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={requirementData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 0,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="crop"
                    tick={{ fontSize: 12 }}
                  />

                  <YAxis
                    tick={{ fontSize: 12 }}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="quantity"
                    name="Required Quantity (kg)"
                    radius={[
                      6,
                      6,
                      0,
                      0,
                    ]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* ORDER STATUS */}

        <div className="sf-card overflow-hidden p-5 sm:p-6">
          <div className="mb-5">
            <h2 className="font-bold text-[#17351f]">
              Order Status
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Current status of your purchase orders.
            </p>
          </div>

          {loading ? (
            <ChartLoading />
          ) : (
            <div className="h-[280px]">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={orderStatusData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 0,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="status"
                    tick={{ fontSize: 11 }}
                  />

                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12 }}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="count"
                    name="Orders"
                    radius={[
                      6,
                      6,
                      0,
                      0,
                    ]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* MONTHLY PERFORMANCE */}

      <div className="sf-card overflow-hidden p-5 sm:p-6">
        <div className="mb-5">
          <h2 className="font-bold text-[#17351f]">
            Monthly Purchase Activity
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Orders and purchase value during the
            current year.
          </p>
        </div>

        {loading ? (
          <ChartLoading />
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart
                data={monthlyData}
                margin={{
                  top: 10,
                  right: 10,
                  left: 0,
                  bottom: 10,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                />

                <YAxis
                  tick={{ fontSize: 12 }}
                />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="orders"
                  name="Orders"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                />

                <Line
                  type="monotone"
                  dataKey="value"
                  name="Purchase Value (₹)"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* AVAILABLE CROP SUPPLY */}

      <div className="sf-card overflow-hidden">
        <div className="border-b p-5">
          <h2 className="font-bold text-[#17351f]">
            Available Crop Supply
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Current active crop listings from farmers.
          </p>
        </div>

        {cropAvailability.length ===
        0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            No active crop listings available.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[550px]">
              <thead>
                <tr className="border-b bg-[#f8faf7] text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-5 py-4">
                    Crop
                  </th>

                  <th className="px-5 py-4">
                    Available Quantity
                  </th>

                  <th className="px-5 py-4">
                    Supply Share
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {cropAvailability.map(
                  (item) => {
                    const totalSupply =
                      cropAvailability.reduce(
                        (sum, crop) =>
                          sum +
                          crop.quantity,
                        0
                      );

                    const percentage =
                      totalSupply > 0
                        ? (
                            (item.quantity /
                              totalSupply) *
                            100
                          ).toFixed(1)
                        : 0;

                    return (
                      <tr
                        key={item.crop}
                        className="hover:bg-[#fbfdf9]"
                      >
                        <td className="px-5 py-4 font-semibold text-[#17351f]">
                          {item.crop}
                        </td>

                        <td className="px-5 py-4 text-sm font-semibold text-gray-700">
                          {item.quantity.toLocaleString()}{" "}
                          kg
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-2 w-28 overflow-hidden rounded-full bg-gray-100">
                              <div
                                className="h-full rounded-full bg-[#18864b]"
                                style={{
                                  width: `${percentage}%`,
                                }}
                              />
                            </div>

                            <span className="text-xs font-semibold text-gray-600">
                              {percentage}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DATA STATUS */}

      <div className="sf-card p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold text-[#17351f]">
              Analytics Data
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Analytics are calculated from live
              requirements, crop listings and orders.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-green-50 px-3 py-2 text-sm font-semibold text-green-700">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            Backend Connected
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== COMPONENTS ====================

function Metric({ icon, title, value, subtitle }) {
  return (
    <div className="group sf-card relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(24,134,75,0.10)]">

      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#f0f9f2] transition-transform duration-300 group-hover:scale-125" />

      <div className="relative flex items-start justify-between gap-4">

        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-[#718078]">
            {title}
          </p>

          <p className="mt-2 text-2xl font-black text-[#16351f]">
            {value}
          </p>

          <p className="mt-1 text-xs font-medium text-[#8a978f]">
            {subtitle}
          </p>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e8f5ec] text-[#18864b] shadow-sm transition-all duration-300 group-hover:bg-[#18864b] group-hover:text-white">
          {icon}
        </div>

      </div>
    </div>
  );
}

function ChartLoading() {
  return (
    <div className="flex h-[320px] items-center justify-center text-sm text-gray-500">
      Loading analytics...
    </div>
  );
}

function ChartEmpty({ text }) {
  return (
    <div className="flex h-[280px] flex-col items-center justify-center text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef8f0] text-[#18864b]">
        <Package size={22} />
      </div>

      <p className="text-sm font-semibold text-[#66756c]">
        {text}
      </p>
    </div>
  );
}