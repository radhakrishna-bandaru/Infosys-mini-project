import { useEffect, useMemo, useState } from "react";
import {
  Package,
  CalendarCheck,
  Clock3,
  Boxes,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getInventory, getBookings } from "../../services/api";
import { getLoggedInUser } from "../../utils/auth";

export default function StorageDashboard() {
  const navigate = useNavigate();

  const user = getLoggedInUser("storage");

  const storageId =
    user?.id ||
    user?._id ||
    user?.storageId ||
    "storage-1";

  const storageName =
    user?.businessName ||
    user?.name ||
    "Storage Owner";

  const [inventory, setInventory] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [loading, setLoading] = useState(true);

async function loadDashboard() {
  try {
    setLoading(true);

    // =========================
    // 1. BACKEND DATA
    // =========================

    let apiInventory = [];
    let apiBookings = [];

    try {
      const inventoryResponse =
        await getInventory(storageId);

      apiInventory = Array.isArray(
        inventoryResponse?.inventory
      )
        ? inventoryResponse.inventory
        : [];
    } catch (error) {
      console.warn(
        "Inventory API unavailable:",
        error
      );
    }

    try {
      const bookingResponse =
        await getBookings();

      apiBookings = Array.isArray(
        bookingResponse?.bookings
      )
        ? bookingResponse.bookings
        : [];
    } catch (error) {
      console.warn(
        "Bookings API unavailable:",
        error
      );
    }

    // =========================
    // 2. LOCAL INVENTORY
    // =========================

    let localInventory = [];

    try {
      const stored = localStorage.getItem(
        "smartFarmerLocalInventory"
      );

      localInventory = stored
        ? JSON.parse(stored)
        : [];

      if (!Array.isArray(localInventory)) {
        localInventory = [];
      }
    } catch {
      localInventory = [];
    }

    const matchingInventory =
      localInventory.filter((item) => {
        const itemStorageId = String(
          item.storageId ||
            item.storage?._id ||
            item.storage?.id ||
            ""
        );

        const itemStorageName = String(
          item.storageName ||
            item.storage?.name ||
            ""
        )
          .trim()
          .toLowerCase();

        return (
          itemStorageId === String(storageId) ||
          itemStorageName ===
            String(storageName)
              .trim()
              .toLowerCase()
        );
      });

    // =========================
    // 3. LOCAL BOOKINGS
    // =========================

    let localBookings = [];

    try {
      const stored = localStorage.getItem(
        "smartFarmerLocalBookings"
      );

      localBookings = stored
        ? JSON.parse(stored)
        : [];

      if (!Array.isArray(localBookings)) {
        localBookings = [];
      }
    } catch {
      localBookings = [];
    }

    // =========================
    // 4. MERGE INVENTORY
    // =========================

    const mergedInventory = [
      ...apiInventory,

      ...matchingInventory.filter(
        (localItem) =>
          !apiInventory.some(
            (apiItem) =>
              String(apiItem.id) ===
              String(localItem.id)
          )
      ),
    ];

    // =========================
    // 5. MERGE BOOKINGS
    // =========================

    const mergedBookings = [
      ...apiBookings,

      ...localBookings.filter(
        (localBooking) =>
          !apiBookings.some(
            (apiBooking) =>
              String(apiBooking.id) ===
              String(localBooking.id)
          )
      ),
    ];

    setInventory(mergedInventory);
    setBookings(mergedBookings);
  } catch (error) {
    console.error(
      "Storage dashboard error:",
      error
    );
  } finally {
    setLoading(false);
  }
}

  useEffect(() => {
    loadDashboard();
  }, []);

  // ==================== STATS ====================

  const totalQuantity = useMemo(() => {
    return inventory.reduce(
      (sum, item) =>
        sum + Number(item.quantity || 0),
      0
    );
  }, [inventory]);

  const storedItems = inventory.filter(
    (item) => item.status === "stored"
  );

  const pendingBookings = bookings.filter(
    (booking) =>
      booking.status === "pending"
  );

  const confirmedBookings = bookings.filter(
    (booking) =>
      booking.status === "confirmed"
  );

  // ==================== RECENT ====================

  const recentInventory = [...inventory]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0) -
        new Date(a.createdAt || 0)
    )
    .slice(0, 5);

  const recentBookings = [...bookings]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0) -
        new Date(a.createdAt || 0)
    )
    .slice(0, 5);

  return (
    <DashboardLayout>
    <div className="storage-dashboard-page space-y-6 pb-10">
     {/* HEADER */}
<div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f6b3d] via-[#18864b] to-[#42a96c] p-6 text-white shadow-[0_18px_45px_rgba(24,134,75,0.18)] sm:p-8">
  <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
    <div className="min-w-0">
      <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold backdrop-blur-sm">
        <Package size={14} />
        STORAGE MANAGEMENT
      </div>

      <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
        Welcome, {storageName}
      </h1>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75 sm:text-[15px]">
        Monitor your storage operations, inventory and booking
        activity from one place.
      </p>
    </div>

    <button
      type="button"
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
          icon={<Package size={21} />}
          title="Inventory Items"
          value={inventory.length}
          description="Total crop entries"
        />

        <StatCard
          icon={<Boxes size={21} />}
          title="Stored Quantity"
          value={`${totalQuantity.toLocaleString()} kg`}
          description={`${storedItems.length} active items`}
        />

        <StatCard
          icon={<Clock3 size={21} />}
          title="Pending Requests"
          value={pendingBookings.length}
          description="Need your attention"
        />

        <StatCard
          icon={<CalendarCheck size={21} />}
          title="Confirmed Bookings"
          value={confirmedBookings.length}
          description="Active bookings"
        />
      </div>

      {/* QUICK ACTIONS */}

      <div className="grid gap-4 md:grid-cols-2">
        <QuickAction
          icon={<Package size={22} />}
          title="Manage Inventory"
          description="Add, edit or remove stored crops."
          button="Open Inventory"
          onClick={() =>
            navigate("/storage/inventory")
          }
        />

        <QuickAction
          icon={<CalendarCheck size={22} />}
          title="Booking Requests"
          description="Review farmer storage requests."
          button="View Requests"
          onClick={() =>
            navigate("/storage/bookings")
          }
        />
      </div>

      {/* RECENT DATA */}

      <div className="grid gap-6 xl:grid-cols-2">
        {/* RECENT INVENTORY */}

        <div className="sf-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#e8eee9] bg-[#f8fbf8] p-5">
            <div>
              <h2 className="font-bold text-[#17351f]">
                Recent Inventory
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Latest crops added to storage
              </p>
            </div>

            <button
              onClick={() =>
                navigate("/storage/inventory")
              }
              className="inline-flex items-center gap-1 text-sm font-semibold text-[#18864b]"
            >
              View all
              <ArrowRight size={15} />
            </button>
          </div>

          {loading ? (
            <Loading />
          ) : recentInventory.length === 0 ? (
            <EmptyState
              icon={<Package size={22} />}
              text="No inventory added yet."
            />
          ) : (
            <div className="divide-y">
              {recentInventory.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 p-5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e8f5ec] text-[#18864b]">
                      <Package size={18} />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[#17351f]">
                        {item.cropName}
                      </p>

                      <p className="text-xs text-gray-500">
                        {item.id}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="font-semibold text-[#17351f]">
                      {Number(
                        item.quantity || 0
                      ).toLocaleString()}{" "}
                      {item.unit || "kg"}
                    </p>

                    <span className="text-xs text-green-600">
                      {item.status || "stored"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RECENT BOOKINGS */}

        <div className="sf-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#e8eee9] bg-[#f8fbf8] p-5">
            <div>
              <h2 className="font-bold text-[#17351f]">
                Recent Booking Requests
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Latest farmer requests
              </p>
            </div>

            <button
              onClick={() =>
                navigate("/storage/bookings")
              }
              className="inline-flex items-center gap-1 text-sm font-semibold text-[#18864b]"
            >
              View all
              <ArrowRight size={15} />
            </button>
          </div>

          {loading ? (
            <Loading />
          ) : recentBookings.length === 0 ? (
            <EmptyState
              icon={<CalendarCheck size={22} />}
              text="No booking requests yet."
            />
          ) : (
            <div className="divide-y">
              {recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between gap-4 p-5"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[#17351f]">
                      {booking.cropName ||
                        "Storage Booking"}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {booking.farmerName ||
                        "Farmer"}{" "}
                      •{" "}
                      {Number(
                        booking.quantity || 0
                      ).toLocaleString()}{" "}
                      {booking.unit || "kg"}
                    </p>
                  </div>

                  <BookingStatus
                    status={booking.status}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* STORAGE STATUS */}

      <div className="sf-card p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold text-[#17351f]">
              Storage Operations
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Your dashboard is connected to the
              backend JSON data system.
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
    <div className="group sf-card relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(24,134,75,0.10)] sm:p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e8f5ec] text-[#18864b] transition-all duration-300 group-hover:bg-[#18864b] group-hover:text-white">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold text-[#17351f]">
            {title}
          </h3>

          <p className="mt-1 text-sm leading-6 text-[#7b8981]">
            {description}
          </p>

          <button
            type="button"
            onClick={onClick}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[#18864b] transition hover:gap-2"
          >
            {button}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function BookingStatus({ status }) {
  const styles = {
    pending:
      "bg-amber-50 text-amber-700",
    confirmed:
      "bg-green-50 text-green-700",
    declined:
      "bg-red-50 text-red-700",
    cancelled:
      "bg-gray-100 text-gray-600",
    completed:
      "bg-blue-50 text-blue-700",
  };

  return (
    <span
      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
        styles[status] ||
        "bg-gray-100 text-gray-600"
      }`}
    >
      {status || "pending"}
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

function EmptyState({ icon, text }) {
  return (
    <div className="flex min-h-[180px] flex-col items-center justify-center text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
        {icon}
      </div>

      <p className="mt-3 text-sm text-gray-500">
        {text}
      </p>
    </div>
  );
}