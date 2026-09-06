import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Sprout,
  Warehouse,
  ShoppingCart,
  CalendarCheck,
  IndianRupee,
  TrendingUp,
  Activity,
  RefreshCw,
  Loader2,
  AlertCircle,
} from "lucide-react";

import {
  getUsers,
  getCrops,
  getStorages,
  getBookings,
  getOrders,
} from "../../services/api";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export default function AdminAnalytics() {
  const [users, setUsers] = useState([]);
  const [crops, setCrops] = useState([]);
  const [storages, setStorages] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAnalytics() {
    try {
      setLoading(true);
      setError("");

      const [
        usersResponse,
        cropsResponse,
        storageResponse,
        bookingsResponse,
        ordersResponse,
      ] = await Promise.all([
        getUsers(),
        getCrops(),
        getStorages(),
        getBookings(),
        getOrders(),
      ]);

      setUsers(usersResponse.users || []);
      setCrops(cropsResponse.crops || []);
      setStorages(
        storageResponse.storages || []
      );
      setBookings(
        bookingsResponse.bookings || []
      );
      setOrders(
        ordersResponse.orders || []
      );
    } catch (err) {
      setError(
        err.message ||
          "Failed to load analytics"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics();
  }, []);

  const analytics = useMemo(() => {
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

    const totalOrderValue = orders.reduce(
      (sum, order) =>
        sum +
        Number(order.totalAmount || 0),
      0
    );

    const completedOrders = orders.filter(
      (order) => order.status === "completed"
    );

    const pendingOrders = orders.filter(
      (order) =>
        order.status === "pending"
    );

    const confirmedBookings =
      bookings.filter(
        (booking) =>
          booking.status === "confirmed"
      );

    const pendingBookings =
      bookings.filter(
        (booking) =>
          booking.status === "pending"
      );

    const totalCropQuantity =
      crops.reduce(
        (sum, crop) =>
          sum + Number(crop.quantity || 0),
        0
      );

    return {
      totalUsers: users.length,
      farmers: farmers.length,
      buyers: buyers.length,
      storageOwners: storageOwners.length,
      activeUsers: activeUsers.length,

      crops: crops.length,
      totalCropQuantity,

      storages: storages.length,
      totalCapacity,
      availableCapacity,

      bookings: bookings.length,
      confirmedBookings:
        confirmedBookings.length,
      pendingBookings:
        pendingBookings.length,

      orders: orders.length,
      completedOrders:
        completedOrders.length,
      pendingOrders:
        pendingOrders.length,

      totalOrderValue,
    };
  }, [
    users,
    crops,
    storages,
    bookings,
    orders,
  ]);

  const userData = [
    {
      name: "Farmers",
      value: analytics.farmers,
    },
    {
      name: "Buyers",
      value: analytics.buyers,
    },
    {
      name: "Storage Owners",
      value: analytics.storageOwners,
    },
  ];

  const orderStatusData = [
    {
      name: "Pending",
      value: analytics.pendingOrders,
    },
    {
      name: "Completed",
      value: analytics.completedOrders,
    },
    {
      name: "Other",
      value:
        Math.max(
          0,
          analytics.orders -
            analytics.pendingOrders -
            analytics.completedOrders
        ),
    },
  ];

  const platformData = [
    {
      name: "Users",
      value: analytics.totalUsers,
    },
    {
      name: "Crops",
      value: analytics.crops,
    },
    {
      name: "Storages",
      value: analytics.storages,
    },
    {
      name: "Bookings",
      value: analytics.bookings,
    },
    {
      name: "Orders",
      value: analytics.orders,
    },
  ];

  const cropData = useMemo(() => {
    const grouped = {};

    crops.forEach((crop) => {
      const name =
        crop.cropName || "Unknown";

      grouped[name] =
        (grouped[name] || 0) +
        Number(crop.quantity || 0);
    });

    return Object.entries(grouped)
      .map(([name, quantity]) => ({
        name,
        quantity,
      }))
      .sort(
        (a, b) =>
          b.quantity - a.quantity
      )
      .slice(0, 8);
  }, [crops]);

  const monthlyOrderData = useMemo(() => {
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

    const result = months.map(
      (month, index) => ({
        month,
        orders: 0,
        revenue: 0,
        monthIndex: index,
      })
    );

    orders.forEach((order) => {
      if (!order.createdAt) return;

      const date = new Date(
        order.createdAt
      );

      if (
        date.getFullYear() !==
        currentYear
      ) {
        return;
      }

      const monthIndex =
        date.getMonth();

      result[monthIndex].orders += 1;

      result[monthIndex].revenue +=
        Number(
          order.totalAmount || 0
        );
    });

    return result;
  }, [orders]);

  function formatNumber(value) {
    return Number(value || 0).toLocaleString(
      "en-IN"
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <Loader2
            size={24}
            className="animate-spin"
          />
          Loading analytics...
        </div>
      </div>
    );
  }

  return (
    <div className="admin-analytics-page space-y-6 pb-10">
     {/* HEADER */}
<div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f6b3d] via-[#18864b] to-[#42a96c] p-6 text-white shadow-[0_18px_45px_rgba(24,134,75,0.18)] sm:p-8">
  <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
    <div className="min-w-0">
      <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold backdrop-blur-sm">
        <Activity size={14} />
        ADMIN ANALYTICS
      </div>

      <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
        Platform Analytics
      </h1>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75 sm:text-[15px]">
        Live insights from users, crops, storage, bookings and
        orders across the Smart Farmer platform.
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
      {/* ERROR */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle
            size={19}
            className="mt-0.5 shrink-0"
          />

          <div>
            <p className="font-semibold">
              Analytics error
            </p>

            <p className="mt-1">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* KPI CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          icon={<Users size={21} />}
          label="Total Users"
          value={formatNumber(
            analytics.totalUsers
          )}
          note={`${formatNumber(
            analytics.activeUsers
          )} active`}
        />

        <Kpi
          icon={<Sprout size={21} />}
          label="Crop Listings"
          value={formatNumber(
            analytics.crops
          )}
          note={`${formatNumber(
            analytics.totalCropQuantity
          )} kg listed`}
        />

        <Kpi
          icon={<Warehouse size={21} />}
          label="Storage Capacity"
          value={`${formatNumber(
            analytics.totalCapacity
          )} kg`}
          note={`${formatNumber(
            analytics.availableCapacity
          )} kg available`}
        />

        <Kpi
          icon={<IndianRupee size={21} />}
          label="Order Value"
          value={`₹${formatNumber(
            analytics.totalOrderValue
          )}`}
          note={`${analytics.orders} total orders`}
        />
      </div>

      {/* USER + ORDER CHARTS */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* USER DISTRIBUTION */}
        <ChartCard
          icon={<Users size={19} />}
          title="User Distribution"
          description="Platform users by role."
        >
          {analytics.totalUsers === 0 ? (
            <EmptyState />
          ) : (
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <PieChart>
                <Pie
                  data={userData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                >
                  {userData.map(
                    (entry, index) => (
                      <Cell
                        key={`user-${index}`}
                      />
                    )
                  )}
                </Pie>

                <Tooltip />

                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* ORDER STATUS */}
        <ChartCard
          icon={<ShoppingCart size={19} />}
          title="Order Status"
          description="Current order lifecycle."
        >
          {analytics.orders === 0 ? (
            <EmptyState />
          ) : (
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <PieChart>
                <Pie
                  data={orderStatusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                >
                  {orderStatusData.map(
                    (entry, index) => (
                      <Cell
                        key={`order-${index}`}
                      />
                    )
                  )}
                </Pie>

                <Tooltip />

                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
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
            Total records across major platform
            modules.
          </p>
        </div>

        <div className="h-[320px]">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart
              data={platformData}
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

      {/* CROP ANALYTICS */}
      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard
          icon={<Sprout size={19} />}
          title="Top Crops by Quantity"
          description="Most listed crops by quantity."
        >
          {cropData.length === 0 ? (
            <EmptyState />
          ) : (
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={cropData}
                layout="vertical"
                margin={{
                  top: 5,
                  right: 15,
                  left: 15,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  type="number"
                  tick={{
                    fontSize: 12,
                  }}
                />

                <YAxis
                  type="category"
                  dataKey="name"
                  width={70}
                  tick={{
                    fontSize: 12,
                  }}
                />

                <Tooltip />

                <Bar
                  dataKey="quantity"
                  radius={[
                    0,
                    7,
                    7,
                    0,
                  ]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* STORAGE */}
        <div className="sf-card p-5 sm:p-6">
          <div className="mb-5">
            <div className="flex items-center gap-2">
              <Warehouse
                size={19}
                className="text-[#18864b]"
              />

              <h2 className="font-bold text-[#16351f]">
                Storage Utilization
              </h2>
            </div>

            <p className="mt-1 text-sm text-gray-500">
              Available versus total capacity.
            </p>
          </div>

          <div className="flex items-center justify-center py-6">
            <CapacityRing
              available={
                analytics.availableCapacity
              }
              total={
                analytics.totalCapacity
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <MetricBox
              label="Total"
              value={`${formatNumber(
                analytics.totalCapacity
              )} kg`}
            />

            <MetricBox
              label="Available"
              value={`${formatNumber(
                analytics.availableCapacity
              )} kg`}
            />
          </div>
        </div>
      </div>

      {/* MONTHLY ORDERS */}
      <div className="sf-card p-5 sm:p-6">
        <div className="mb-5">
          <div className="flex items-center gap-2">
            <TrendingUp
              size={19}
              className="text-[#18864b]"
            />

            <h2 className="font-bold text-[#16351f]">
              Monthly Order Activity
            </h2>
          </div>

          <p className="mt-1 text-sm text-gray-500">
            Orders and order value for the current
            year.
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="h-[320px]">
            <EmptyState />
          </div>
        ) : (
          <div className="h-[320px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart
                data={monthlyOrderData}
                margin={{
                  top: 10,
                  right: 10,
                  left: -15,
                  bottom: 0,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="month"
                  tick={{
                    fontSize: 12,
                  }}
                />

                <YAxis
                  yAxisId="left"
                  allowDecimals={false}
                  tick={{
                    fontSize: 12,
                  }}
                />

                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{
                    fontSize: 12,
                  }}
                />

                <Tooltip />

                <Legend />

                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="orders"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />

                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* OPERATIONS SUMMARY */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <OperationCard
          icon={<CalendarCheck size={20} />}
          label="Bookings"
          value={analytics.bookings}
          detail={`${analytics.pendingBookings} pending`}
        />

        <OperationCard
          icon={<CalendarCheck size={20} />}
          label="Confirmed Bookings"
          value={analytics.confirmedBookings}
          detail="Storage confirmed"
        />

        <OperationCard
          icon={<ShoppingCart size={20} />}
          label="Pending Orders"
          value={analytics.pendingOrders}
          detail="Awaiting processing"
        />

        <OperationCard
          icon={<ShoppingCart size={20} />}
          label="Completed Orders"
          value={analytics.completedOrders}
          detail="Successfully completed"
        />
      </div>
    </div>
  );
}

function Kpi({
  icon,
  label,
  value,
  note,
}) {
  return (
    <div className="group sf-card relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(24,134,75,0.10)]">
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#f0f9f2] transition-transform duration-300 group-hover:scale-125" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-[#718078]">
            {label}
          </p>

          <p className="mt-2 text-2xl font-black tracking-tight text-[#16351f]">
            {value}
          </p>

          <p className="mt-1 text-xs font-medium text-[#8a978f]">
            {note}
          </p>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e8f5ec] text-[#18864b] shadow-sm transition-all duration-300 group-hover:bg-[#18864b] group-hover:text-white">
          {icon}
        </div>
      </div>
    </div>
  );
}

function ChartCard({
  icon,
  title,
  description,
  children,
}) {
  return (
    <div className="sf-card overflow-hidden p-5 sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e8f5ec] text-[#18864b]">
          {icon}
        </div>

        <div className="min-w-0">
          <h2 className="text-lg font-bold text-[#16351f]">
            {title}
          </h2>

          <p className="mt-1 text-sm text-[#7b8981]">
            {description}
          </p>
        </div>
      </div>

      <div className="h-[320px] min-w-0">
        {children}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full items-center justify-center text-sm text-gray-400">
      No data available yet.
    </div>
  );
}

function MetricBox({
  label,
  value,
}) {
  return (
    <div className="rounded-2xl bg-gray-50 p-4 text-center">
      <p className="text-xs text-gray-400">
        {label}
      </p>

      <p className="mt-1 font-bold text-[#16351f]">
        {value}
      </p>
    </div>
  );
}

function OperationCard({
  icon,
  label,
  value,
  detail,
}) {
  return (
    <div className="sf-card p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f5ec] text-[#18864b]">
          {icon}
        </div>

        <div>
          <p className="text-xs text-gray-400">
            {label}
          </p>

          <p className="text-xl font-bold text-[#16351f]">
            {value}
          </p>
        </div>
      </div>

      <p className="mt-3 text-xs text-gray-400">
        {detail}
      </p>
    </div>
  );
}

function CapacityRing({
  available,
  total,
}) {
  const percentage =
    total > 0
      ? Math.round(
          (available / total) * 100
        )
      : 0;

  const radius = 68;
  const circumference =
    2 * Math.PI * radius;

  const offset =
    circumference -
    (percentage / 100) *
      circumference;

  return (
    <div className="relative h-44 w-44">
      <svg
        className="h-full w-full -rotate-90"
        viewBox="0 0 160 160"
      >
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          strokeWidth="14"
          className="stroke-gray-100"
        />

        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          strokeWidth="14"
          strokeLinecap="round"
          className="stroke-[#18864b]"
          strokeDasharray={
            circumference
          }
          strokeDashoffset={offset}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-3xl font-bold text-[#16351f]">
          {percentage}%
        </p>

        <p className="text-xs text-gray-400">
          available
        </p>
      </div>
    </div>
  );
}