import { useEffect, useMemo, useState } from "react";
import {
  Package,
  ClipboardList,
  ShoppingCart,
  Clock3,
  ArrowRight,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  getRequirements,
  getCrops,
  getOrders,
} from "../../services/api";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getLoggedInUser } from "../../utils/auth";

export default function BuyerDashboard() {
  const navigate = useNavigate();

  const user = getLoggedInUser("buyer");

  const buyerId =
    user?.id ||
    user?._id ||
    user?.buyerId ||
    "";

  const buyerName =
    user?.businessName ||
    user?.name ||
    "Buyer";

  const [requirements, setRequirements] =
    useState([]);

  const [crops, setCrops] = useState([]);

  const [orders, setOrders] = useState([]);

  const [loading, setLoading] =
    useState(true);

  async function loadDashboard() {
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
        "Buyer dashboard error:",
        error
      );

      alert(
        error.message ||
          "Failed to load buyer dashboard"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  // ==================== STATS ====================

  const activeRequirements =
    requirements.filter(
      (item) => item.status === "active"
    );

  const availableCrops = crops.filter(
    (item) =>
      item.status === "active" &&
      Number(item.quantity || 0) > 0
  );

  const pendingOrders = orders.filter(
    (item) => item.status === "pending"
  );

  const confirmedOrders = orders.filter(
    (item) =>
      item.status === "confirmed" ||
      item.status === "processing"
  );

  const totalOrderValue = orders.reduce(
    (sum, order) =>
      sum + Number(order.totalAmount || 0),
    0
  );

  // ==================== RECENT ====================

  const recentRequirements = useMemo(
    () =>
      [...requirements]
        .sort(
          (a, b) =>
            new Date(b.createdAt || 0) -
            new Date(a.createdAt || 0)
        )
        .slice(0, 4),
    [requirements]
  );

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort(
          (a, b) =>
            new Date(b.createdAt || 0) -
            new Date(a.createdAt || 0)
        )
        .slice(0, 4),
    [orders]
  );

  const recentCrops = useMemo(
    () =>
      [...availableCrops]
        .sort(
          (a, b) =>
            new Date(b.createdAt || 0) -
            new Date(a.createdAt || 0)
        )
        .slice(0, 5),
    [availableCrops]
  );

  return (
    <DashboardLayout>
    <div className="space-y-6">
      {/* HEADER */}
<div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f6b3d] via-[#18864b] to-[#42a96c] p-6 text-white shadow-[0_18px_45px_rgba(24,134,75,0.18)] sm:p-8">
  <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
    <div className="min-w-0">
      <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold backdrop-blur-sm">
        <ShoppingCart size={14} />
        BUYER MANAGEMENT
      </div>

      <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
        Welcome, {buyerName}
      </h1>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75 sm:text-[15px]">
        Track your crop requirements, purchases and supplier
        activity in one place.
      </p>
    </div>

    <button
      onClick={loadDashboard}
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
      {/* STATS */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<ClipboardList size={21} />}
          title="Active Requirements"
          value={activeRequirements.length}
          description="Current crop requirements"
        />

        <StatCard
          icon={<Package size={21} />}
          title="Available Crops"
          value={availableCrops.length}
          description="Farmer listings"
        />

        <StatCard
          icon={<Clock3 size={21} />}
          title="Pending Orders"
          value={pendingOrders.length}
          description="Awaiting confirmation"
        />

        <StatCard
          icon={<ShoppingCart size={21} />}
          title="Order Value"
          value={`₹${totalOrderValue.toLocaleString()}`}
          description={`${confirmedOrders.length} active orders`}
        />
      </div>

      {/* QUICK ACTIONS */}

      <div className="grid gap-4 md:grid-cols-3">
        <QuickAction
          icon={<ClipboardList size={22} />}
          title="Post Requirement"
          description="Tell farmers what crops you need."
          button="Create Requirement"
          onClick={() =>
            navigate("/buyer/requirements")
          }
        />

        <QuickAction
          icon={<Package size={22} />}
          title="Find Crops"
          description="Browse crops listed by farmers."
          button="Available Crops"
          onClick={() =>
            navigate("/buyer/crops")
          }
        />

        <QuickAction
          icon={<ShoppingCart size={22} />}
          title="Manage Orders"
          description="Track your crop purchases."
          button="View Orders"
          onClick={() =>
            navigate("/buyer/orders")
          }
        />
      </div>

      {/* MAIN DATA */}

      <div className="grid gap-6 xl:grid-cols-2">
        {/* RECENT REQUIREMENTS */}

        <div className="sf-card overflow-hidden">
          <div className="flex items-center justify-between border-b p-5">
            <div>
              <h2 className="text-lg font-bold text-[#16351f]">
                Recent Requirements
              </h2>

              <p className="mt-1 text-xs text-[#7b8981]">
                Your latest crop requirements
              </p>
            </div>

            <button
              onClick={() =>
                navigate("/buyer/requirements")
              }
              className="inline-flex items-center gap-1 text-sm font-semibold text-[#18864b]"
            >
              View all
              <ArrowRight size={15} />
            </button>
          </div>

          {loading ? (
            <Loading />
          ) : recentRequirements.length ===
            0 ? (
            <EmptyState
              icon={<ClipboardList size={22} />}
              text="No requirements created yet."
              button="Create Requirement"
              onClick={() =>
                navigate("/buyer/requirements")
              }
            />
          ) : (
            <div className="divide-y">
              {recentRequirements.map(
                (item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 p-5"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[#17351f]">
                        {item.cropName}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {Number(
                          item.quantity || 0
                        ).toLocaleString()}{" "}
                        kg
                      </p>
                    </div>

                    <StatusBadge
                      status={item.status}
                    />
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* RECENT ORDERS */}

        <div className="sf-card overflow-hidden">
          <div className="flex items-center justify-between border-b p-5">
            <div>
              <h2 className="text-lg font-bold text-[#16351f]">
                Recent Orders
              </h2>

              <p className="mt-1 text-xs text-[#7b8981]">
                Latest purchases
              </p>
            </div>

            <button
              onClick={() =>
                navigate("/buyer/orders")
              }
              className="inline-flex items-center gap-1 text-sm font-semibold text-[#18864b]"
            >
              View all
              <ArrowRight size={15} />
            </button>
          </div>

          {loading ? (
            <Loading />
          ) : recentOrders.length === 0 ? (
            <EmptyState
              icon={<ShoppingCart size={22} />}
              text="No orders placed yet."
              button="Browse Crops"
              onClick={() =>
                navigate("/buyer/crops")
              }
            />
          ) : (
            <div className="divide-y">
              {recentOrders.map(
                (order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between gap-4 p-5"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[#17351f]">
                        {order.cropName}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {Number(
                          order.quantity || 0
                        ).toLocaleString()}{" "}
                        kg • ₹
                        {Number(
                          order.totalAmount ||
                            0
                        ).toLocaleString()}
                      </p>
                    </div>

                    <StatusBadge
                      status={order.status}
                    />
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* AVAILABLE CROPS */}

      <div className="sf-card overflow-hidden">
        <div className="flex items-center justify-between border-b p-5">
          <div>
            <h2 className="text-lg font-bold text-[#16351f]">
              Available Farmer Crops
            </h2>

            <p className="mt-1 text-xs text-[#7b8981]">
              Latest crops available for purchase
            </p>
          </div>

          <button
            onClick={() =>
              navigate("/buyer/crops")
            }
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#18864b]"
          >
            Browse all
            <ArrowRight size={15} />
          </button>
        </div>

        {loading ? (
          <Loading />
        ) : recentCrops.length === 0 ? (
          <EmptyState
            icon={<Package size={22} />}
            text="No farmer crops are currently available."
          />
        ) : (
          <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {recentCrops.map((crop) => (
              <div
                key={crop.id}
                className="rounded-2xl border border-gray-100 bg-[#fbfdf9] p-4"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f5ec] text-[#18864b]">
                  <Package size={18} />
                </div>

                <h3 className="mt-3 font-bold text-[#17351f]">
                  {crop.cropName}
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  Farmer:{" "}
                  {crop.farmerName ||
                    "Farmer"}
                </p>

                <p className="mt-3 text-sm font-semibold text-[#17351f]">
                  {Number(
                    crop.quantity || 0
                  ).toLocaleString()}{" "}
                  {crop.unit || "kg"}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  ₹
                  {Number(
                    crop.expectedPrice ||
                      0
                  ).toLocaleString()}
                  /{crop.unit || "kg"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BUYER STATUS */}

      <div className="sf-card p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp
                size={19}
                className="text-[#18864b]"
              />

              <h2 className="font-bold text-[#17351f]">
                Buyer Activity
              </h2>
            </div>

            <p className="mt-1 text-sm text-gray-500">
              Your requirements, crops and orders
              are connected to the backend.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-green-50 px-3 py-2 text-sm font-semibold text-green-700">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            System Active
          </div>
        </div>
      </div>
    </div>
    </DashboardLayout>
  );
}

// ==================== COMPONENTS ====================

function StatCard({
  icon,
  title,
  value,
  description,
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
            {description}
          </p>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e8f5ec] text-[#18864b] shadow-sm transition-all duration-300 group-hover:bg-[#18864b] group-hover:text-white">
          {icon}
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  icon,
  title,
  description,
  button,
  onClick,
}) {
  return (
    <div className="group sf-card relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(24,134,75,0.10)]">
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[#f0f9f2] transition-transform duration-300 group-hover:scale-125" />

      <div className="relative flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e8f5ec] text-[#18864b] shadow-sm transition-all duration-300 group-hover:bg-[#18864b] group-hover:text-white">
          {icon}
        </div>

        <div className="min-w-0">
          <h3 className="text-base font-bold text-[#16351f]">
            {title}
          </h3>

          <p className="mt-1 text-sm leading-6 text-[#718078]">
            {description}
          </p>

          <button
            onClick={onClick}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[#18864b] transition hover:gap-2.5"
          >
            {button}
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    pending:
      "bg-amber-50 text-amber-700",
    confirmed:
      "bg-green-50 text-green-700",
    processing:
      "bg-blue-50 text-blue-700",
    completed:
      "bg-emerald-50 text-emerald-700",
    cancelled:
      "bg-gray-100 text-gray-600",
    declined:
      "bg-red-50 text-red-700",
    active:
      "bg-green-50 text-green-700",
  };

  return (
    <span
      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
        styles[status] ||
        "bg-gray-100 text-gray-600"
      }`}
    >
      {status || "active"}
    </span>
  );
}

function Loading() {
  return (
    <div className="flex min-h-[180px] items-center justify-center text-sm text-gray-500">
      Loading...
    </div>
  );
}

function EmptyState({
  icon,
  text,
  button,
  onClick,
}) {
  return (
    <div className="flex min-h-[180px] flex-col items-center justify-center px-5 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
        {icon}
      </div>

      <p className="mt-3 text-sm text-gray-500">
        {text}
      </p>

      {button && (
        <button
          onClick={onClick}
          className="mt-4 text-sm font-semibold text-[#18864b]"
        >
          {button}
        </button>
      )}
    </div>
  );
}