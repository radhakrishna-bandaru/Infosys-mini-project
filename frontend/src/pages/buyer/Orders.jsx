import { useEffect, useMemo, useState } from "react";
import {
  Search,
  ShoppingBag,
  Clock3,
  CheckCircle2,
  Truck,
  XCircle,
  Eye,
  X,
  Loader2,
  AlertCircle,
  MapPin,
  Package,
  IndianRupee,
  CalendarDays,
  Trash2,
} from "lucide-react";

import DashboardLayout from "../../layouts/DashboardLayout";
import { getLoggedInUser } from "../../utils/auth";
import {
  getOrders,
  updateOrderStatus,
  deleteOrder,
} from "../../services/api";

const STATUS_OPTIONS = [
  ["all", "All"],
  ["pending", "Pending"],
  ["confirmed", "Confirmed"],
  ["processing", "Processing"],
  ["completed", "Completed"],
  ["cancelled", "Cancelled"],
  ["declined", "Declined"],
];

export default function Orders() {
  const buyer = getLoggedInUser("buyer");

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [selectedOrder, setSelectedOrder] =
    useState(null);

  const buyerId = buyer?.id || buyer?._id || "";

  // ==================== LOAD ====================

  async function loadOrders() {
    try {
      setLoading(true);
      setError("");

      const response = await getOrders({
        buyerId,
      });

      setOrders(response.orders || []);
    } catch (err) {
      console.error("Orders load error:", err);

      setError(
        err.message || "Unable to load orders."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  // ==================== FILTER ====================

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !query ||
        order.id?.toLowerCase().includes(query) ||
        order.cropName
          ?.toLowerCase()
          .includes(query) ||
        order.farmerName
          ?.toLowerCase()
          .includes(query) ||
        order.location
          ?.toLowerCase()
          .includes(query);

      const matchesStatus =
        filter === "all" ||
        order.status === filter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, filter]);

  // ==================== STATS ====================

  const stats = useMemo(() => {
    const pending = orders.filter(
      (order) => order.status === "pending"
    ).length;

    const confirmed = orders.filter(
      (order) =>
        order.status === "confirmed" ||
        order.status === "processing"
    ).length;

    const completed = orders.filter(
      (order) => order.status === "completed"
    ).length;

    const totalValue = orders.reduce(
      (sum, order) =>
        sum + Number(order.totalAmount || 0),
      0
    );

    return {
      total: orders.length,
      pending,
      confirmed,
      completed,
      totalValue,
    };
  }, [orders]);

  // ==================== STATUS ====================

  async function changeStatus(order, status) {
    try {
      setActionLoading(order.id);
      setError("");

      const response = await updateOrderStatus(
        order.id,
        status
      );

      setOrders((previous) =>
        previous.map((item) =>
          item.id === order.id
            ? response.order
            : item
        )
      );

      setSelectedOrder((previous) =>
        previous?.id === order.id
          ? response.order
          : previous
      );
    } catch (err) {
      console.error("Order status error:", err);

      setError(
        err.message || "Unable to update order."
      );
    } finally {
      setActionLoading("");
    }
  }

  // ==================== CANCEL ====================

  async function cancelOrder(order) {
    const confirmed = window.confirm(
      `Cancel order ${order.id}?`
    );

    if (!confirmed) return;

    await changeStatus(order, "cancelled");
  }

  // ==================== DELETE ====================

  async function removeOrder(order) {
    const confirmed = window.confirm(
      `Delete order ${order.id}?`
    );

    if (!confirmed) return;

    try {
      setActionLoading(order.id);
      setError("");

      await deleteOrder(order.id);

      setOrders((previous) =>
        previous.filter(
          (item) => item.id !== order.id
        )
      );

      setSelectedOrder(null);
    } catch (err) {
      console.error("Delete order error:", err);

      setError(
        err.message || "Unable to delete order."
      );
    } finally {
      setActionLoading("");
    }
  }

  // ==================== UI ====================

  return (
    <DashboardLayout>
<div className="buyer-requirements-page space-y-6 pb-10">
{/* HEADER */}
<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
  <div className="min-w-0">


    <h1 className="mt-1 text-2xl font-bold text-[#17351f] sm:text-3xl">
      My Orders
    </h1>

    <p className="mt-1 text-sm text-gray-500">
      Track your crop purchases and manage procurement orders.
    </p>
  </div>

  <div className="inline-flex w-fit items-center rounded-xl bg-[#eef8f0] px-4 py-2 text-sm font-bold text-[#18864b]">
    ₹{stats.totalValue.toLocaleString()} Total Value
  </div>
</div>
        {/* ERROR */}
        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0"
            />
            <span>{error}</span>
          </div>
        )}

        {/* STATS */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <StatCard
            icon={<ShoppingBag size={19} />}
            label="Total Orders"
            value={stats.total}
          />

          <StatCard
            icon={<Clock3 size={19} />}
            label="Pending"
            value={stats.pending}
          />

          <StatCard
            icon={<Truck size={19} />}
            label="In Progress"
            value={stats.confirmed}
          />

          <StatCard
            icon={<CheckCircle2 size={19} />}
            label="Completed"
            value={stats.completed}
          />

        </section>

        {/* SEARCH + FILTER */}
        <section className="sf-card p-4">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div className="relative w-full lg:max-w-md">
             <Search
  size={18}
  className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400"
/>

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search order, crop, farmer..."
               className="sf-input w-full pl-11 pr-4"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {STATUS_OPTIONS.map(
                ([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setFilter(value)}
                    className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-bold transition ${
                      filter === value
                        ? "bg-[#18864b] text-white"
                        : "bg-[#f1f5f0] text-slate-600 hover:bg-[#e7eee6]"
                    }`}
                  >
                    {label}
                  </button>
                )
              )}
            </div>

          </div>
        </section>

        {/* ORDERS */}
        {loading ? (
          <div className="sf-card flex min-h-[330px] items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-slate-500">
              <Loader2
                size={28}
                className="sf-spin text-[#18864b]"
              />

              <span className="text-sm font-semibold">
                Loading orders...
              </span>
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <EmptyState
            hasFilters={
              Boolean(search) || filter !== "all"
            }
          />
        ) : (
          <section className="space-y-4">

            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                actionLoading={actionLoading}
                onView={() =>
                  setSelectedOrder(order)
                }
                onConfirm={() =>
                  changeStatus(
                    order,
                    "confirmed"
                  )
                }
                onProcess={() =>
                  changeStatus(
                    order,
                    "processing"
                  )
                }
                onComplete={() =>
                  changeStatus(
                    order,
                    "completed"
                  )
                }
                onCancel={() =>
                  cancelOrder(order)
                }
                onDelete={() =>
                  removeOrder(order)
                }
              />
            ))}

          </section>
        )}
      </div>

      {/* DETAILS MODAL */}
      {selectedOrder && (
        <OrderDetails
          order={selectedOrder}
          actionLoading={actionLoading}
          onClose={() =>
            setSelectedOrder(null)
          }
          onConfirm={() =>
            changeStatus(
              selectedOrder,
              "confirmed"
            )
          }
          onProcess={() =>
            changeStatus(
              selectedOrder,
              "processing"
            )
          }
          onComplete={() =>
            changeStatus(
              selectedOrder,
              "completed"
            )
          }
          onCancel={() =>
            cancelOrder(selectedOrder)
          }
          onDelete={() =>
            removeOrder(selectedOrder)
          }
        />
      )}
    </DashboardLayout>
  );
}

// =====================================================
// STAT CARD
// =====================================================

function StatCard({ icon, label, value }) {
  return (
    <div className="group sf-card relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(24,134,75,0.10)]">

      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#f0f9f2] transition-transform duration-300 group-hover:scale-125" />

      <div className="relative flex items-center justify-between gap-4">

        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-[#718078]">
            {label}
          </p>

          <p className="mt-2 text-2xl font-black text-[#16351f]">
            {value}
          </p>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e8f5ec] text-[#18864b] shadow-sm transition-all duration-300 group-hover:bg-[#18864b] group-hover:text-white">
          {icon}
        </div>

      </div>
    </div>
  );
}

// =====================================================
// ORDER CARD
// =====================================================

function OrderCard({
  order,
  actionLoading,
  onView,
  onConfirm,
  onProcess,
  onComplete,
  onCancel,
  onDelete,
}) {
  const busy = actionLoading === order.id;

  return (
    <article className="sf-card sf-card-hover overflow-hidden">

      <div className="p-5 sm:p-6">

        <div className="flex flex-col gap-5 lg:flex-row lg:items-center">

          {/* ORDER INFO */}
          <div className="flex min-w-0 flex-1 items-start gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#edf6ed] text-[#18864b]">
              <Package size={22} />
            </div>

            <div className="min-w-0">

              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-black text-slate-800">
                  {order.cropName}
                </h2>

                <StatusBadge
                  status={order.status}
                />
              </div>

              <p className="mt-1 text-xs font-semibold text-slate-400">
                {order.id}
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Farmer:{" "}
                <span className="font-bold text-slate-700">
                  {order.farmerName ||
                    "Farmer not specified"}
                </span>
              </p>

            </div>

          </div>

          {/* METRICS */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:w-auto">

            <MiniMetric
              label="Quantity"
              value={`${Number(
                order.quantity || 0
              ).toLocaleString()} kg`}
            />

            <MiniMetric
              label="Price"
              value={`₹${Number(
                order.price || 0
              )}/kg`}
            />

            <MiniMetric
              label="Order Value"
              value={`₹${Number(
                order.totalAmount || 0
              ).toLocaleString()}`}
            />

            <MiniMetric
              label="Delivery"
              value={
                order.deliveryDate
                  ? new Date(
                      order.deliveryDate
                    ).toLocaleDateString()
                  : "Flexible"
              }
            />

          </div>

        </div>

        {/* LOCATION */}
        {order.location && (
          <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4 text-sm text-slate-500">
            <MapPin
              size={16}
              className="text-[#18864b]"
            />
            {order.location}
          </div>
        )}

        {/* ACTIONS */}
        <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">

          <button
            onClick={onView}
            className="sf-button sf-button-secondary"
          >
            <Eye size={16} />
            View Details
          </button>

          {order.status === "pending" && (
            <button
              onClick={onConfirm}
              disabled={busy}
              className="sf-button sf-button-primary"
            >
              {busy ? (
                <Loader2
                  size={16}
                  className="sf-spin"
                />
              ) : (
                <CheckCircle2 size={16} />
              )}
              Confirm
            </button>
          )}

          {order.status === "confirmed" && (
            <button
              onClick={onProcess}
              disabled={busy}
              className="sf-button sf-button-primary"
            >
              {busy ? (
                <Loader2
                  size={16}
                  className="sf-spin"
                />
              ) : (
                <Truck size={16} />
              )}
              Start Processing
            </button>
          )}

          {order.status === "processing" && (
            <button
              onClick={onComplete}
              disabled={busy}
              className="sf-button sf-button-primary"
            >
              {busy ? (
                <Loader2
                  size={16}
                  className="sf-spin"
                />
              ) : (
                <CheckCircle2 size={16} />
              )}
              Mark Completed
            </button>
          )}

          {[
            "pending",
            "confirmed",
            "processing",
          ].includes(order.status) && (
            <button
              onClick={onCancel}
              disabled={busy}
              className="sf-button bg-red-50 text-red-600 hover:bg-red-100"
            >
              <XCircle size={16} />
              Cancel
            </button>
          )}

          {[
            "cancelled",
            "declined",
            "completed",
          ].includes(order.status) && (
            <button
              onClick={onDelete}
              disabled={busy}
              className="sf-button bg-red-50 text-red-600 hover:bg-red-100"
            >
              <Trash2 size={16} />
              Delete
            </button>
          )}

        </div>

      </div>
    </article>
  );
}

// =====================================================
// MINI METRIC
// =====================================================

function MiniMetric({
  label,
  value,
}) {
  return (
    <div className="min-w-[100px] rounded-xl bg-[#f6f8f5] px-3 py-2.5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-black text-slate-800">
        {value}
      </p>
    </div>
  );
}

// =====================================================
// STATUS
// =====================================================

function StatusBadge({ status }) {
  const styles = {
    pending:
      "bg-amber-50 text-amber-700",
    confirmed:
      "bg-blue-50 text-blue-700",
    processing:
      "bg-violet-50 text-violet-700",
    completed:
      "bg-emerald-50 text-emerald-700",
    cancelled:
      "bg-red-50 text-red-700",
    declined:
      "bg-slate-100 text-slate-600",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-[11px] font-bold capitalize ${
        styles[status] ||
        "bg-slate-100 text-slate-600"
      }`}
    >
      {status}
    </span>
  );
}

// =====================================================
// EMPTY
// =====================================================

function EmptyState({ hasFilters }) {
  return (
    <div className="sf-card flex min-h-[340px] flex-col items-center justify-center px-6 text-center">

      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#edf6ed] text-[#18864b]">
        <ShoppingBag size={30} />
      </div>

      <h2 className="text-lg font-extrabold text-slate-800">
        No orders found
      </h2>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        {hasFilters
          ? "Try changing your search or status filter."
          : "Orders created from the available crops marketplace will appear here."}
      </p>

    </div>
  );
}

// =====================================================
// DETAILS
// =====================================================

function OrderDetails({
  order,
  actionLoading,
  onClose,
  onConfirm,
  onProcess,
  onComplete,
  onCancel,
  onDelete,
}) {
  const busy = actionLoading === order.id;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">

      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">

        {/* HEADER */}
        <div className="flex items-start justify-between border-b border-slate-100 p-6">

          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-[#edf6ed] px-2.5 py-1 text-xs font-bold text-[#18864b]">
                ORDER
              </span>

              <StatusBadge
                status={order.status}
              />
            </div>

            <h2 className="text-2xl font-black text-slate-800">
              {order.cropName}
            </h2>

            <p className="mt-1 text-xs font-bold text-slate-400">
              {order.id}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
          >
            <X size={20} />
          </button>

        </div>

        {/* DETAILS */}
        <div className="grid gap-3 p-6 sm:grid-cols-2">

          <Detail
            icon={<Package size={17} />}
            label="Quantity"
            value={`${Number(
              order.quantity || 0
            ).toLocaleString()} kg`}
          />

          <Detail
            icon={<IndianRupee size={17} />}
            label="Price"
            value={`₹${Number(
              order.price || 0
            )}/kg`}
          />

          <Detail
            icon={<IndianRupee size={17} />}
            label="Total Amount"
            value={`₹${Number(
              order.totalAmount || 0
            ).toLocaleString()}`}
          />

          <Detail
            icon={<CalendarDays size={17} />}
            label="Delivery Date"
            value={
              order.deliveryDate
                ? new Date(
                    order.deliveryDate
                  ).toLocaleDateString()
                : "Flexible"
            }
          />

          <Detail
            icon={<MapPin size={17} />}
            label="Location"
            value={
              order.location ||
              "Not specified"
            }
          />

          <Detail
            icon={<ShoppingBag size={17} />}
            label="Farmer"
            value={
              order.farmerName ||
              "Not specified"
            }
          />

        </div>

        {order.notes && (
          <div className="mx-6 mb-5 rounded-2xl bg-[#f6f8f5] p-4">
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">
              Notes
            </p>

            <p className="text-sm leading-6 text-slate-600">
              {order.notes}
            </p>
          </div>
        )}

        {/* ACTIONS */}
        <div className="flex flex-wrap gap-2 border-t border-slate-100 p-6">

          {order.status === "pending" && (
            <button
              onClick={onConfirm}
              disabled={busy}
              className="sf-button sf-button-primary"
            >
              {busy && (
                <Loader2
                  size={16}
                  className="sf-spin"
                />
              )}
              Confirm Order
            </button>
          )}

          {order.status === "confirmed" && (
            <button
              onClick={onProcess}
              disabled={busy}
              className="sf-button sf-button-primary"
            >
              {busy && (
                <Loader2
                  size={16}
                  className="sf-spin"
                />
              )}
              <Truck size={16} />
              Start Processing
            </button>
          )}

          {order.status === "processing" && (
            <button
              onClick={onComplete}
              disabled={busy}
              className="sf-button sf-button-primary"
            >
              {busy && (
                <Loader2
                  size={16}
                  className="sf-spin"
                />
              )}
              <CheckCircle2 size={16} />
              Complete Order
            </button>
          )}

          {[
            "pending",
            "confirmed",
            "processing",
          ].includes(order.status) && (
            <button
              onClick={onCancel}
              disabled={busy}
              className="sf-button bg-red-50 text-red-600 hover:bg-red-100"
            >
              <XCircle size={16} />
              Cancel Order
            </button>
          )}

          {[
            "cancelled",
            "declined",
            "completed",
          ].includes(order.status) && (
            <button
              onClick={onDelete}
              disabled={busy}
              className="sf-button bg-red-50 text-red-600 hover:bg-red-100"
            >
              <Trash2 size={16} />
              Delete
            </button>
          )}

        </div>

      </div>
    </div>
  );
}

function Detail({
  icon,
  label,
  value,
}) {
  return (
    <div className="rounded-2xl bg-[#f6f8f5] p-4">

      <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
        {icon}
        {label}
      </div>

      <p className="font-extrabold text-slate-800">
        {value}
      </p>

    </div>
  );
}