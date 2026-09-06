import { useEffect, useMemo, useState } from "react";
import {
  ShoppingBag,
  Search,
  Package,
  Clock3,
  CheckCircle2,
  Truck,
  XCircle,
  Eye,
  X,
  MapPin,
  IndianRupee,
  CalendarDays,
  Loader2,
  AlertCircle,
} from "lucide-react";

import DashboardLayout from "../../layouts/DashboardLayout";
import { getLoggedInUser } from "../../utils/auth";
import {
  getOrders,
  updateOrderStatus,
} from "../../services/api";

const FILTERS = [
  ["all", "All"],
  ["pending", "Pending"],
  ["confirmed", "Confirmed"],
  ["processing", "Processing"],
  ["completed", "Completed"],
  ["cancelled", "Cancelled"],
];

export default function Orders() {
  const user = getLoggedInUser("farmer");

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] =
    useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [selectedOrder, setSelectedOrder] =
    useState(null);

  const [error, setError] = useState("");

  const farmerId =
    user?.id || user?._id || "";

  async function loadOrders() {
    try {
      setLoading(true);
      setError("");

      const response = await getOrders({
        farmerId,
      });

      setOrders(response.orders || []);
    } catch (err) {
      console.error("Farmer orders error:", err);

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

  const filteredOrders = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !query ||
        order.id
          ?.toLowerCase()
          .includes(query) ||
        order.cropName
          ?.toLowerCase()
          .includes(query) ||
        order.buyerName
          ?.toLowerCase()
          .includes(query) ||
        order.location
          ?.toLowerCase()
          .includes(query);

      const matchesFilter =
        filter === "all" ||
        order.status === filter;

      return (
        matchesSearch && matchesFilter
      );
    });
  }, [orders, search, filter]);

  const stats = useMemo(() => {
    const pending = orders.filter(
      (order) =>
        order.status === "pending"
    ).length;

    const confirmed = orders.filter(
      (order) =>
        order.status === "confirmed" ||
        order.status === "processing"
    ).length;

    const completed = orders.filter(
      (order) =>
        order.status === "completed"
    ).length;

    const totalValue = orders.reduce(
      (sum, order) =>
        sum +
        Number(order.totalAmount || 0),
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

  async function changeStatus(
    order,
    status
  ) {
    try {
      setActionLoading(order.id);
      setError("");

      const response =
        await updateOrderStatus(
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
      console.error(
        "Status update error:",
        err
      );

      setError(
        err.message ||
          "Unable to update order."
      );
    } finally {
      setActionLoading("");
    }
  }

  return (
    <DashboardLayout>
      <div className="orders-page space-y-6 pb-8">

        {/* HERO */}
        <section className="sf-card overflow-hidden bg-gradient-to-br from-[#123d27] via-[#176b3d] to-[#18864b] p-6 text-white sm:p-8">

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold">
                <ShoppingBag size={14} />
                CROP ORDERS
              </div>

              <h1 className="text-2xl font-black sm:text-3xl">
                Buyer Orders
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
                Manage purchase orders received
                from buyers and track every delivery
                from confirmation to completion.
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 px-5 py-4">
              <p className="text-xs font-bold text-white/60">
                ORDER VALUE
              </p>

              <p className="mt-1 text-2xl font-black">
                ₹
                {stats.totalValue.toLocaleString()}
              </p>
            </div>

          </div>
        </section>

        {/* ERROR */}
        {error && (
          <div className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle
              size={18}
              className="shrink-0"
            />
            {error}
          </div>
        )}

        {/* STATS */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <Stat
            icon={<ShoppingBag size={19} />}
            label="Total Orders"
            value={stats.total}
          />

          <Stat
            icon={<Clock3 size={19} />}
            label="Pending"
            value={stats.pending}
          />

          <Stat
            icon={<Truck size={19} />}
            label="In Progress"
            value={stats.confirmed}
          />

          <Stat
            icon={<CheckCircle2 size={19} />}
            label="Completed"
            value={stats.completed}
          />

        </section>

        {/* SEARCH */}
        <section className="sf-card p-4">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div className="relative w-full lg:max-w-md">

              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search order, crop or buyer..."
                className="sf-input pl-11"
              />

            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">

              {FILTERS.map(
                ([value, label]) => (
                  <button
                    key={value}
                    onClick={() =>
                      setFilter(value)
                    }
                    className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-bold ${
                      filter === value
                        ? "bg-[#18864b] text-white"
                        : "bg-[#f1f5f0] text-slate-600"
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
          <div className="sf-card flex min-h-[320px] items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-slate-500">
              <Loader2
                size={28}
                className="sf-spin text-[#18864b]"
              />
              <span className="text-sm font-semibold">
                Loading buyer orders...
              </span>
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <EmptyState />
        ) : (
          <section className="space-y-4">

            {filteredOrders.map(
              (order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  busy={
                    actionLoading ===
                    order.id
                  }
                  onView={() =>
                    setSelectedOrder(
                      order
                    )
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
                    changeStatus(
                      order,
                      "cancelled"
                    )
                  }
                />
              )
            )}

          </section>
        )}
      </div>

      {/* DETAILS */}
      {selectedOrder && (
        <DetailsModal
          order={selectedOrder}
          busy={
            actionLoading ===
            selectedOrder.id
          }
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
            changeStatus(
              selectedOrder,
              "cancelled"
            )
          }
        />
      )}
    </DashboardLayout>
  );
}

function Stat({
  icon,
  label,
  value,
}) {
  return (
    <div className="sf-card sf-card-hover p-5">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf6ed] text-[#18864b]">
        {icon}
      </div>

      <p className="text-sm font-semibold text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-black text-slate-800">
        {value}
      </p>
    </div>
  );
}

function OrderCard({
  order,
  busy,
  onView,
  onConfirm,
  onProcess,
  onComplete,
  onCancel,
}) {
  return (
    <article className="sf-card sf-card-hover p-5 sm:p-6">

      <div className="flex flex-col gap-5 xl:flex-row xl:items-center">

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

            <p className="mt-1 text-xs font-bold text-slate-400">
              {order.id}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Buyer:{" "}
              <span className="font-bold text-slate-700">
                {order.buyerName ||
                  "Buyer"}
              </span>
            </p>

          </div>

        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

          <Metric
            label="Quantity"
            value={`${Number(
              order.quantity || 0
            ).toLocaleString()} kg`}
          />

          <Metric
            label="Price"
            value={`₹${Number(
              order.price || 0
            )}/kg`}
          />

          <Metric
            label="Total"
            value={`₹${Number(
              order.totalAmount || 0
            ).toLocaleString()}`}
          />

          <Metric
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

      {order.location && (
        <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4 text-sm text-slate-500">
          <MapPin
            size={16}
            className="text-[#18864b]"
          />
          {order.location}
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">

        <button
          onClick={onView}
          className="sf-button sf-button-secondary"
        >
          <Eye size={16} />
          Details
        </button>

        {order.status ===
          "pending" && (
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

        {order.status ===
          "confirmed" && (
          <button
            onClick={onProcess}
            disabled={busy}
            className="sf-button sf-button-primary"
          >
            <Truck size={16} />
            Start Processing
          </button>
        )}

        {order.status ===
          "processing" && (
          <button
            onClick={onComplete}
            disabled={busy}
            className="sf-button sf-button-primary"
          >
            <CheckCircle2 size={16} />
            Complete
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

      </div>
    </article>
  );
}

function Metric({
  label,
  value,
}) {
  return (
    <div className="min-w-[100px] rounded-xl bg-[#f6f8f5] p-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-black text-slate-800">
        {value}
      </p>
    </div>
  );
}

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

function EmptyState() {
  return (
    <div className="sf-card flex min-h-[340px] flex-col items-center justify-center px-6 text-center">

      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#edf6ed] text-[#18864b]">
        <ShoppingBag size={30} />
      </div>

      <h2 className="text-lg font-extrabold text-slate-800">
        No buyer orders yet
      </h2>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        When buyers purchase your listed crops,
        their orders will appear here.
      </p>

    </div>
  );
}

function DetailsModal({
  order,
  busy,
  onClose,
  onConfirm,
  onProcess,
  onComplete,
  onCancel,
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">

      <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white shadow-2xl">

        <div className="flex items-start justify-between border-b border-slate-100 p-6">

          <div>
            <div className="mb-2 flex gap-2">
              <span className="rounded-lg bg-[#edf6ed] px-2.5 py-1 text-xs font-bold text-[#18864b]">
                BUYER ORDER
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

        <div className="grid gap-3 p-6 sm:grid-cols-2">

          <Info
            icon={<ShoppingBag size={17} />}
            label="Buyer"
            value={
              order.buyerName ||
              "Buyer"
            }
          />

          <Info
            icon={<Package size={17} />}
            label="Quantity"
            value={`${Number(
              order.quantity || 0
            ).toLocaleString()} kg`}
          />

          <Info
            icon={<IndianRupee size={17} />}
            label="Price"
            value={`₹${Number(
              order.price || 0
            )}/kg`}
          />

          <Info
            icon={<IndianRupee size={17} />}
            label="Total"
            value={`₹${Number(
              order.totalAmount || 0
            ).toLocaleString()}`}
          />

          <Info
            icon={<MapPin size={17} />}
            label="Location"
            value={
              order.location ||
              "Not specified"
            }
          />

          <Info
            icon={<CalendarDays size={17} />}
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

        {order.notes && (
          <div className="mx-6 mb-5 rounded-2xl bg-[#f6f8f5] p-4">
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">
              Buyer Notes
            </p>

            <p className="text-sm leading-6 text-slate-600">
              {order.notes}
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-2 border-t border-slate-100 p-6">

          {order.status ===
            "pending" && (
            <button
              onClick={onConfirm}
              disabled={busy}
              className="sf-button sf-button-primary"
            >
              <CheckCircle2 size={16} />
              Confirm
            </button>
          )}

          {order.status ===
            "confirmed" && (
            <button
              onClick={onProcess}
              disabled={busy}
              className="sf-button sf-button-primary"
            >
              <Truck size={16} />
              Processing
            </button>
          )}

          {order.status ===
            "processing" && (
            <button
              onClick={onComplete}
              disabled={busy}
              className="sf-button sf-button-primary"
            >
              <CheckCircle2 size={16} />
              Complete
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
              className="sf-button bg-red-50 text-red-600"
            >
              <XCircle size={16} />
              Cancel
            </button>
          )}

        </div>

      </div>
    </div>
  );
}

function Info({
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