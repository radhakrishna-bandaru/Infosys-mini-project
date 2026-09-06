import { useEffect, useMemo, useState } from "react";
import {
  Package,
  CalendarCheck,
  TrendingUp,
  BarChart3,
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
  getInventory,
  getBookings,
} from "../../services/api";

import { getLoggedInUser } from "../../utils/auth";

export default function StorageAnalytics() {
  const user = getLoggedInUser("storage");

  const storageId =
    user?.id ||
    user?._id ||
    user?.storageId ||
    "storage-1";

  const [inventory, setInventory] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadAnalytics() {
    try {
      setLoading(true);

      const [inventoryResponse, bookingResponse] =
        await Promise.all([
          getInventory(storageId),
          getBookings({ storageId }),
        ]);

      setInventory(
        inventoryResponse.inventory || []
      );

      setBookings(
        bookingResponse.bookings || []
      );
    } catch (error) {
      console.error(
        "Analytics loading error:",
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

  const totalQuantity = inventory.reduce(
    (sum, item) =>
      sum + Number(item.quantity || 0),
    0
  );

  const activeInventory = inventory.filter(
    (item) => item.status === "stored"
  );

  const confirmedBookings = bookings.filter(
    (item) => item.status === "confirmed"
  );

  const completedBookings = bookings.filter(
    (item) => item.status === "completed"
  );

  const pendingBookings = bookings.filter(
    (item) => item.status === "pending"
  );

  // ==================== CROP ANALYTICS ====================

  const cropData = useMemo(() => {
    const map = {};

    inventory.forEach((item) => {
      const crop = item.cropName || "Unknown";

      if (!map[crop]) {
        map[crop] = {
          crop,
          quantity: 0,
          items: 0,
        };
      }

      map[crop].quantity += Number(
        item.quantity || 0
      );

      map[crop].items += 1;
    });

    return Object.values(map).sort(
      (a, b) => b.quantity - a.quantity
    );
  }, [inventory]);

  // ==================== BOOKING ANALYTICS ====================

  const bookingData = useMemo(() => {
    return [
      {
        name: "Pending",
        count: pendingBookings.length,
      },
      {
        name: "Confirmed",
        count: confirmedBookings.length,
      },
      {
        name: "Completed",
        count: completedBookings.length,
      },
      {
        name: "Declined",
        count: bookings.filter(
          (item) => item.status === "declined"
        ).length,
      },
      {
        name: "Cancelled",
        count: bookings.filter(
          (item) => item.status === "cancelled"
        ).length,
      },
    ];
  }, [
    bookings,
    pendingBookings.length,
    confirmedBookings.length,
    completedBookings.length,
  ]);

  // ==================== MONTHLY ACTIVITY ====================

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

    const currentYear =
      new Date().getFullYear();

    return months.map((month, index) => {
      const monthInventory =
        inventory.filter((item) => {
          if (!item.createdAt) return false;

          const date = new Date(
            item.createdAt
          );

          return (
            date.getFullYear() ===
              currentYear &&
            date.getMonth() === index
          );
        });

      const monthBookings =
        bookings.filter((item) => {
          if (!item.createdAt) return false;

          const date = new Date(
            item.createdAt
          );

          return (
            date.getFullYear() ===
              currentYear &&
            date.getMonth() === index
          );
        });

      return {
        month,
        inventory: monthInventory.length,
        bookings: monthBookings.length,
      };
    });
  }, [inventory, bookings]);

  return (
    <div className="storage-analytics-page space-y-6 pb-10">
      {/* HEADER */}
<div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f6b3d] via-[#18864b] to-[#42a96c] p-6 text-white shadow-[0_18px_45px_rgba(24,134,75,0.18)] sm:p-8">
  <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
    <div className="min-w-0">
      <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold backdrop-blur-sm">
        <BarChart3 size={14} />
        STORAGE MANAGEMENT
      </div>

      <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
        Analytics
      </h1>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75 sm:text-[15px]">
        Understand your storage activity, inventory performance
        and booking trends.
      </p>
    </div>

    <button
      type="button"
      onClick={loadAnalytics}
      disabled={loading}
      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-[#176b3d] shadow-lg transition hover:-translate-y-0.5 hover:bg-[#f5fff7] disabled:opacity-60"
    >
      <RefreshCw
        size={17}
        className={loading ? "animate-spin" : ""}
      />
      Refresh Data
    </button>
  </div>

  <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/10" />
  <div className="pointer-events-none absolute -bottom-24 right-24 h-52 w-52 rounded-full bg-white/5" />
</div>
      {/* SUMMARY CARDS */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={<Package size={21} />}
          title="Stored Quantity"
          value={`${totalQuantity.toLocaleString()} kg`}
          subtitle={`${activeInventory.length} active items`}
        />

        <MetricCard
          icon={<CalendarCheck size={21} />}
          title="Total Bookings"
          value={bookings.length}
          subtitle="All booking requests"
        />

        <MetricCard
          icon={<TrendingUp size={21} />}
          title="Confirmed"
          value={confirmedBookings.length}
          subtitle="Active reservations"
        />

        <MetricCard
          icon={<BarChart3 size={21} />}
          title="Completed"
          value={completedBookings.length}
          subtitle="Completed bookings"
        />
      </div>

      {/* CHARTS */}

      <div className="grid gap-6 xl:grid-cols-2">
        {/* CROP QUANTITY */}

        <div className="sf-card p-5 sm:p-6">
          <div className="mb-5 flex items-start gap-3">
            <h2 className="text-lg font-bold text-[#16351f]">
              Crop-wise Storage
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Quantity currently recorded by crop.
            </p>
          </div>

          {loading ? (
            <ChartLoading />
          ) : cropData.length === 0 ? (
            <ChartEmpty text="No inventory data available." />
          ) : (
            <div className="h-[320px]">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={cropData}
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
                    name="Quantity (kg)"
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

        {/* BOOKING STATUS */}

        <div className="sf-card p-5 sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-[#16351f]">
              Booking Status
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Breakdown of storage requests.
            </p>
          </div>

          {loading ? (
            <ChartLoading />
          ) : (
            <div className="h-[320px]">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={bookingData}
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
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                  />

                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12 }}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="count"
                    name="Bookings"
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

      {/* MONTHLY ACTIVITY */}

      <div className="sf-card p-5 sm:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-[#16351f]">
            Monthly Activity
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Inventory additions and booking activity
            during the year.
          </p>
        </div>

        {loading ? (
          <ChartLoading />
        ) : (
          <div className="h-[340px]">
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
                  allowDecimals={false}
                  tick={{ fontSize: 12 }}
                />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="inventory"
                  name="Inventory"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                />

                <Line
                  type="monotone"
                  dataKey="bookings"
                  name="Bookings"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* CROP TABLE */}

      <div className="sf-card overflow-hidden">
        <div className="border-b p-5">
          <h2 className="font-bold text-[#17351f]">
            Inventory Summary
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Current crop-wise inventory breakdown.
          </p>
        </div>

        {cropData.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            No inventory data available.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b bg-[#f8faf7] text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-5 py-4">
                    Crop
                  </th>

                  <th className="px-5 py-4">
                    Inventory Entries
                  </th>

                  <th className="px-5 py-4">
                    Quantity
                  </th>

                  <th className="px-5 py-4">
                    Share
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {cropData.map((item) => {
                  const percentage =
                    totalQuantity > 0
                      ? (
                          (item.quantity /
                            totalQuantity) *
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

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {item.items}
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold text-gray-700">
                        {item.quantity.toLocaleString()} kg
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-100">
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
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== COMPONENTS ====================

function MetricCard({
  icon,
  title,
  value,
  subtitle,
}) {
  return (
    <div className="group sf-card relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(24,134,75,0.10)]">
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#f0f9f2] transition-transform duration-300 group-hover:scale-125" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-[#718078]">
            {title}
          </p>

          <p className="mt-2 text-2xl font-black tracking-tight text-[#16351f]">
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
    <div className="flex h-[320px] flex-col items-center justify-center text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f5ec] text-[#18864b]">
        <BarChart3 size={22} />
      </div>

      <p className="mt-3 text-sm font-semibold text-[#526158]">
        No data yet
      </p>

      <p className="mt-1 text-xs text-[#98a49d]">
        {text}
      </p>
    </div>
  );
}