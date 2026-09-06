import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Sprout,
  ShoppingCart,
  Warehouse,
  Package,
  CalendarCheck,
  IndianRupee,
  Activity,
  RefreshCw,
  Loader2,
  AlertCircle,
  ArrowUpRight,
} from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import {
  getUsers,
  getStorages,
  getCrops,
  getBookings,
  getOrders,
} from "../../services/api";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [storages, setStorages] = useState([]);
  const [crops, setCrops] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const [
        usersResponse,
        storageResponse,
        cropsResponse,
        bookingsResponse,
        ordersResponse,
      ] = await Promise.all([
        getUsers(),
        getStorages(),
        getCrops(),
        getBookings(),
        getOrders(),
      ]);

      setUsers(usersResponse.users || []);
      setStorages(
        storageResponse.storages || []
      );
      setCrops(cropsResponse.crops || []);
      setBookings(
        bookingsResponse.bookings || []
      );
      setOrders(
        ordersResponse.orders || []
      );
    } catch (err) {
      setError(
        err.message ||
          "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const stats = useMemo(() => {
    const farmers = users.filter(
      (user) => user.role === "farmer"
    );

    const buyers = users.filter(
      (user) => user.role === "buyer"
    );

    const storageOwners = users.filter(
      (user) => user.role === "storage"
    );

    const activeUsers = users.filter(
      (user) => user.active !== false
    );

    const totalCapacity = storages.reduce(
      (sum, storage) =>
        sum + Number(storage.capacity || 0),
      0
    );

    const availableCapacity =
      storages.reduce(
        (sum, storage) =>
          sum +
          Number(
            storage.availableCapacity || 0
          ),
        0
      );

    const orderRevenue = orders.reduce(
      (sum, order) =>
        sum +
        Number(order.totalAmount || 0),
      0
    );

    return {
      totalUsers: users.length,
      farmers: farmers.length,
      buyers: buyers.length,
      storageOwners: storageOwners.length,
      activeUsers: activeUsers.length,
      storages: storages.length,
      crops: crops.length,
      bookings: bookings.length,
      orders: orders.length,
      totalCapacity,
      availableCapacity,
      orderRevenue,
    };
  }, [
    users,
    storages,
    crops,
    bookings,
    orders,
  ]);

  const userChartData = [
    {
      name: "Farmers",
      value: stats.farmers,
    },
    {
      name: "Buyers",
      value: stats.buyers,
    },
    {
      name: "Storage Owners",
      value: stats.storageOwners,
    },
  ];

  const activityData = [
    {
      name: "Users",
      value: stats.totalUsers,
    },
    {
      name: "Crops",
      value: stats.crops,
    },
    {
      name: "Storages",
      value: stats.storages,
    },
    {
      name: "Bookings",
      value: stats.bookings,
    },
    {
      name: "Orders",
      value: stats.orders,
    },
  ];

  const recentOrders = [...orders]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0) -
        new Date(a.createdAt || 0)
    )
    .slice(0, 5);

  function formatNumber(value) {
    return Number(value || 0).toLocaleString(
      "en-IN"
    );
  }

  function formatDate(date) {
    if (!date) return "—";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <Loader2
            size={24}
            className="animate-spin"
          />
          Loading admin dashboard...
        </div>
      </div>
      </DashboardLayout>
    );
  }

  return (
    <div className="admin-dashboard-page space-y-6 pb-10">
      {/* HEADER */}
     <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f6b3d] via-[#18864b] to-[#42a96c] p-6 text-white shadow-[0_18px_45px_rgba(24,134,75,0.18)] sm:p-8">
  <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
    <div className="min-w-0">
      <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm">
        <Activity size={14} />
        ADMIN OVERVIEW
      </div>

      <h1 className="text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
        Platform Dashboard
      </h1>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75 sm:text-[15px]">
        Monitor users, crops, storage, bookings and orders
        across the Smart Farmer platform.
      </p>
    </div>

    <button
      type="button"
      onClick={loadDashboard}
      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-[#176b3d] shadow-lg transition hover:-translate-y-0.5 hover:bg-[#f5fff7]"
    >
      <RefreshCw size={17} />
      Refresh Data
    </button>
  </div>

  <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/10" />
  <div className="pointer-events-none absolute -bottom-24 right-24 h-52 w-52 rounded-full bg-white/5" />
</div>

      {/* ERROR */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle
            size={19}
            className="mt-0.5 shrink-0"
          />

          <div>
            <p className="font-semibold">
              Dashboard data error
            </p>

            <p className="mt-1">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* PRIMARY STATS */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<Users size={21} />}
          title="Total Users"
          value={formatNumber(
            stats.totalUsers
          )}
          subtitle={`${formatNumber(
            stats.activeUsers
          )} active`}
        />

        <StatCard
          icon={<Sprout size={21} />}
          title="Crop Listings"
          value={formatNumber(stats.crops)}
          subtitle="Farmer listings"
        />

        <StatCard
          icon={<Warehouse size={21} />}
          title="Storage Facilities"
          value={formatNumber(
            stats.storages
          )}
          subtitle={`${formatNumber(
            stats.totalCapacity
          )} kg capacity`}
        />

        <StatCard
          icon={<ShoppingCart size={21} />}
          title="Orders"
          value={formatNumber(stats.orders)}
          subtitle={`₹${formatNumber(
            stats.orderRevenue
          )} order value`}
        />
      </div>

      {/* SECONDARY STATS */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MiniStat
          icon={<Sprout size={18} />}
          label="Farmers"
          value={stats.farmers}
        />

        <MiniStat
          icon={<Users size={18} />}
          label="Buyers"
          value={stats.buyers}
        />

        <MiniStat
          icon={<CalendarCheck size={18} />}
          label="Bookings"
          value={stats.bookings}
        />

        <MiniStat
          icon={<Package size={18} />}
          label="Available Storage"
          value={`${formatNumber(
            stats.availableCapacity
          )} kg`}
        />
      </div>

      {/* CHARTS */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* USER DISTRIBUTION */}
        <div className="sf-card p-5 sm:p-6">
          <div className="mb-5">
            <div className="flex items-center gap-2">
              <Users
                size={19}
                className="text-[#18864b]"
              />

              <h2 className="font-bold text-[#16351f]">
                User Distribution
              </h2>
            </div>

            <p className="mt-1 text-sm text-gray-500">
              Registered users by platform role.
            </p>
          </div>

          {stats.totalUsers === 0 ? (
            <EmptyChart />
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={userChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="48%"
                    outerRadius={95}
                    innerRadius={55}
                    paddingAngle={3}
                  >
                    {userChartData.map(
                      (entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                        />
                      )
                    )}
                  </Pie>

                  <Tooltip />

                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* PLATFORM ACTIVITY */}
        <div className="sf-card p-5 sm:p-6">
          <div className="mb-5">
            <div className="flex items-center gap-2">
              <Activity
                size={19}
                className="text-[#18864b]"
              />

              <h2 className="font-bold text-[#16351f]">
                Platform Activity
              </h2>
            </div>

            <p className="mt-1 text-sm text-gray-500">
              Current platform records across
              major modules.
            </p>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={activityData}
                margin={{
                  top: 10,
                  right: 10,
                  left: -20,
                  bottom: 0,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="name"
                  tick={{
                    fontSize: 12,
                  }}
                />

                <YAxis
                  allowDecimals={false}
                  tick={{
                    fontSize: 12,
                  }}
                />

                <Tooltip />

                <Bar
                  dataKey="value"
                  radius={[7, 7, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* QUICK OVERVIEW */}
      <div className="grid gap-6 xl:grid-cols-[1fr_1.4fr]">
        {/* STORAGE CAPACITY */}
        <div className="sf-card p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Warehouse
                  size={19}
                  className="text-[#18864b]"
                />

                <h2 className="font-bold text-[#16351f]">
                  Storage Capacity
                </h2>
              </div>

              <p className="mt-1 text-sm text-gray-500">
                Platform-wide storage availability.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-[#16351f]">
                  {formatNumber(
                    stats.availableCapacity
                  )}
                </p>

                <p className="text-sm text-gray-500">
                  kg available
                </p>
              </div>

              <p className="text-sm font-semibold text-[#18864b]">
                of{" "}
                {formatNumber(
                  stats.totalCapacity
                )}{" "}
                kg
              </p>
            </div>

            <div className="mt-4 h-3 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-[#18864b] transition-all"
                style={{
                  width:
                    stats.totalCapacity > 0
                      ? `${Math.min(
                          100,
                          (stats.availableCapacity /
                            stats.totalCapacity) *
                            100
                        )}%`
                      : "0%",
                }}
              />
            </div>

            <div className="mt-3 flex justify-between text-xs text-gray-400">
              <span>
                Available
              </span>

              <span>
                {stats.totalCapacity > 0
                  ? `${Math.round(
                      (stats.availableCapacity /
                        stats.totalCapacity) *
                        100
                    )}%`
                  : "0%"}{" "}
                available
              </span>
            </div>
          </div>
        </div>

        {/* RECENT ORDERS */}
        <div className="sf-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6">
            <div>
              <div className="flex items-center gap-2">
                <ShoppingCart
                  size={19}
                  className="text-[#18864b]"
                />

                <h2 className="font-bold text-[#16351f]">
                  Recent Orders
                </h2>
              </div>

              <p className="mt-1 text-sm text-gray-500">
                Latest buyer transactions.
              </p>
            </div>
          </div>

          {recentOrders.length === 0 ? (
            <div className="p-8">
              <EmptyOrders />
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e8f5ec] text-[#18864b]">
                      <Package size={18} />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#16351f]">
                        {order.cropName ||
                          "Crop Order"}
                      </p>

                      <p className="mt-0.5 truncate text-xs text-gray-400">
                        {order.buyerName ||
                          "Buyer"}{" "}
                        ·{" "}
                        {formatDate(
                          order.createdAt
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-[#16351f]">
                      ₹
                      {formatNumber(
                        order.totalAmount
                      )}
                    </p>

                    <span className="mt-1 inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold capitalize text-gray-600">
                      {order.status ||
                        "pending"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {orders.length > 5 && (
            <div className="border-t border-gray-100 px-5 py-3 text-center sm:px-6">
              <p className="inline-flex items-center gap-1 text-xs font-semibold text-[#18864b]">
                Showing latest 5 orders
                <ArrowUpRight size={13} />
              </p>
            </div>
          )}
        </div>
      </div>

      {/* PLATFORM SUMMARY */}
      <div className="rounded-3xl bg-[#16351f] p-6 text-white sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#9be2b4]">
              SMART FARMER PLATFORM
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Everything is connected.
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
              Farmers can list crops and find
              markets, buyers can place orders,
              and storage owners can manage
              capacity and bookings — all through
              the same backend system.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Summary
              label="Farmers"
              value={stats.farmers}
            />

            <Summary
              label="Buyers"
              value={stats.buyers}
            />

            <Summary
              label="Storages"
              value={stats.storages}
            />

            <Summary
              label="Orders"
              value={stats.orders}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  title,
  value,
  subtitle,
}) {
  return (
    <div className="group sf-card relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(24,134,75,0.10)]">
      <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-[#f0f9f2] transition-transform duration-300 group-hover:scale-125" />

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

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e8f5ec] text-[#18864b] shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:bg-[#18864b] group-hover:text-white">
          {icon}
        </div>
      </div>
    </div>
  );
}

function MiniStat({
  icon,
  label,
  value,
}) {
  return (
    <div className="sf-card flex items-center gap-3 p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-[#18864b]">
        {icon}
      </div>

      <div>
        <p className="text-xs text-gray-400">
          {label}
        </p>

        <p className="font-bold text-[#16351f]">
          {typeof value === "number"
            ? value.toLocaleString("en-IN")
            : value}
        </p>
      </div>
    </div>
  );
}

function Summary({ label, value }) {
  return (
    <div>
      <p className="text-2xl font-bold">
        {value}
      </p>

      <p className="text-xs text-white/60">
        {label}
      </p>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-[300px] items-center justify-center text-sm text-gray-400">
      No user data available.
    </div>
  );
}

function EmptyOrders() {
  return (
    <div className="text-center">
      <ShoppingCart
        size={38}
        className="mx-auto text-gray-300"
      />

      <p className="mt-3 text-sm font-semibold text-gray-600">
        No orders yet
      </p>

      <p className="mt-1 text-xs text-gray-400">
        Orders will appear here when buyers
        place them.
      </p>
    </div>
  );
}