import { useEffect, useMemo, useState } from "react";
import {
  CalendarCheck,
  Check,
  X,
  Search,
  Eye,
  RefreshCw,
  Package,
  MapPin,
} from "lucide-react";

import {
  getBookings,
  updateBookingStatus,
} from "../../services/api";

import { getLoggedInUser } from "../../utils/auth";

export default function StorageBookings() {
  const user = getLoggedInUser("storage");

  const storageId =
    user?.id ||
    user?._id ||
    user?.storageId ||
    "storage-1";

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedBooking, setSelectedBooking] =
    useState(null);

  const [updatingId, setUpdatingId] =
    useState(null);

async function loadBookings() {
  try {
    setLoading(true);

    const currentStorageId = String(storageId);

    const storageNames = [
      user?.businessName,
      user?.name,
      user?.storageName,
    ]
      .filter(Boolean)
      .map((name) => String(name).trim().toLowerCase());

    // =========================
    // 1. API BOOKINGS
    // =========================

    let apiBookings = [];

    try {
      const response = await getBookings({
        storageId: currentStorageId,
      });

      apiBookings = Array.isArray(response?.bookings)
        ? response.bookings
        : [];
    } catch (error) {
      console.warn(
        "Filtered API bookings failed:",
        error
      );
    }

    // If ID-based API search gives nothing,
    // load all bookings and match by storage details.
    if (apiBookings.length === 0) {
      try {
        const response = await getBookings();

        const allBookings = Array.isArray(
          response?.bookings
        )
          ? response.bookings
          : [];

        apiBookings = allBookings.filter((booking) => {
          const bookingStorageId = String(
            booking.storageId ||
              booking.storage?._id ||
              booking.storage?.id ||
              ""
          );

          const bookingStorageName = String(
            booking.storageName ||
              booking.storage?.name ||
              ""
          )
            .trim()
            .toLowerCase();

          return (
            bookingStorageId === currentStorageId ||
            (
              bookingStorageName &&
              storageNames.includes(
                bookingStorageName
              )
            )
          );
        });
      } catch (error) {
        console.warn(
          "All API bookings loading failed:",
          error
        );
      }
    }

    // =========================
    // 2. LOCAL BOOKINGS
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
    } catch (error) {
      console.warn(
        "Local booking loading failed:",
        error
      );

      localBookings = [];
    }

    // =========================
    // 3. MATCH STORAGE
    // =========================

    const matchingLocalBookings =
      localBookings.filter((booking) => {
        const bookingStorageId = String(
          booking.storageId ||
            booking.storage?._id ||
            booking.storage?.id ||
            ""
        );

        const bookingStorageName = String(
          booking.storageName ||
            booking.storage?.name ||
            ""
        )
          .trim()
          .toLowerCase();

        return (
          bookingStorageId === currentStorageId ||
          (
            bookingStorageName &&
            storageNames.includes(
              bookingStorageName
            )
          )
        );
      });

    // =========================
    // 4. MERGE
    // =========================

    const mergedBookings = [
      ...apiBookings,
      ...matchingLocalBookings.filter(
        (localBooking) =>
          !apiBookings.some(
            (apiBooking) =>
              String(apiBooking.id) ===
              String(localBooking.id)
          )
      ),
    ];

    setBookings(mergedBookings);

  } catch (error) {
    console.error(
      "Booking loading error:",
      error
    );

    setBookings([]);
  } finally {
    setLoading(false);
  }
}

  useEffect(() => {
    loadBookings();
  }, []);

  // ==================== STATUS UPDATE ====================

async function changeStatus(id, status) {
  try {
    setUpdatingId(id);

    try {
      await updateBookingStatus(id, status);
    } catch (apiError) {
      console.warn(
        "API status update failed, updating locally:",
        apiError
      );
    }

    // Update UI
    setBookings((previous) =>
      previous.map((booking) =>
        String(booking.id) === String(id)
          ? {
              ...booking,
              status,
              updatedAt: new Date().toISOString(),
            }
          : booking
      )
    );

    // Update localStorage
    try {
      const localBookings = JSON.parse(
        localStorage.getItem(
          "smartFarmerLocalBookings"
        ) || "[]"
      );

      const updatedBookings = localBookings.map(
        (booking) =>
          String(booking.id) === String(id)
            ? {
                ...booking,
                status,
                updatedAt: new Date().toISOString(),
              }
            : booking
      );

      localStorage.setItem(
        "smartFarmerLocalBookings",
        JSON.stringify(updatedBookings)
      );
    } catch (localError) {
      console.error(
        "Local booking status update error:",
        localError
      );
    }

    setSelectedBooking((previous) =>
      previous &&
      String(previous.id) === String(id)
        ? { ...previous, status }
        : previous
    );

  } catch (error) {
    console.error("Booking status error:", error);

    alert(
      error.message ||
        "Failed to update booking"
    );
  } finally {
    setUpdatingId(null);
  }
}

  async function handleDecline(id) {
    const confirmed = window.confirm(
      "Are you sure you want to decline this booking?"
    );

    if (!confirmed) return;

    await changeStatus(id, "declined");
  }

  // ==================== FILTER ====================

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        !search ||
        booking.cropName
          ?.toLowerCase()
          .includes(searchText) ||
        booking.farmerName
          ?.toLowerCase()
          .includes(searchText) ||
        booking.id
          ?.toLowerCase()
          .includes(searchText);

      const matchesStatus =
        statusFilter === "all" ||
        booking.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [bookings, search, statusFilter]);

  // ==================== STATS ====================

  const pendingCount = bookings.filter(
    (item) => item.status === "pending"
  ).length;

  const confirmedCount = bookings.filter(
    (item) => item.status === "confirmed"
  ).length;

  const completedCount = bookings.filter(
    (item) => item.status === "completed"
  ).length;

  const totalQuantity = bookings
    .filter(
      (item) =>
        item.status === "pending" ||
        item.status === "confirmed"
    )
    .reduce(
      (sum, item) =>
        sum + Number(item.quantity || 0),
      0
    );

  return (
    <div className="storage-bookings-page space-y-6 pb-10">
     {/* HEADER */}
<div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f6b3d] via-[#18864b] to-[#42a96c] p-6 text-white shadow-[0_18px_45px_rgba(24,134,75,0.18)] sm:p-8">
  <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
    <div className="min-w-0">
      <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold backdrop-blur-sm">
        <CalendarCheck size={14} />
        STORAGE MANAGEMENT
      </div>

      <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
        Booking Requests
      </h1>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75 sm:text-[15px]">
        Review and manage farmer storage requests and booking
        activity from your facility.
      </p>
    </div>

    <button
      type="button"
      onClick={loadBookings}
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
        <Stat
          title="Pending"
          value={pendingCount}
          icon={<CalendarCheck size={20} />}
        />

        <Stat
          title="Confirmed"
          value={confirmedCount}
          icon={<Check size={20} />}
        />

        <Stat
          title="Completed"
          value={completedCount}
          icon={<Package size={20} />}
        />

        <Stat
          title="Reserved Quantity"
          value={`${totalQuantity.toLocaleString()} kg`}
          icon={<Package size={20} />}
        />
      </div>

     {/* FILTERS */}
<div className="sf-card p-4 sm:p-5">
  <div className="grid gap-3 md:grid-cols-[1fr_210px]">
    <div className="relative min-w-0">
      <Search
        size={19}
        className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[#8a978f]"
      />

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search farmer, crop or booking ID..."
        className="sf-input w-full pl-11"
      />
    </div>

    <select
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value)}
      className="sf-input w-full"
    >
      <option value="all">All Status</option>
      <option value="pending">Pending</option>
      <option value="confirmed">Confirmed</option>
      <option value="declined">Declined</option>
      <option value="completed">Completed</option>
      <option value="cancelled">Cancelled</option>
    </select>
  </div>
</div>
      {/* TABLE */}

      <div className="sf-card overflow-hidden">
        {loading ? (
          <div className="flex min-h-[320px] items-center justify-center text-sm text-gray-500">
            Loading booking requests...
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8f5ec] text-[#18864b]">
              <CalendarCheck size={27} />
            </div>

            <h3 className="mt-4 text-lg font-bold text-[#17351f]">
              No booking requests
            </h3>

            <p className="mt-1 max-w-md text-sm text-gray-500">
              New farmer storage requests will
              appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px]">
              <thead>
                <tr className="border-b bg-[#f8faf7] text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-5 py-4">
                    Farmer
                  </th>

                  <th className="px-5 py-4">
                    Crop
                  </th>

                  <th className="px-5 py-4">
                    Quantity
                  </th>

                  <th className="px-5 py-4">
                    Storage Period
                  </th>

                  <th className="px-5 py-4">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {filteredBookings.map(
                  (booking) => (
                    <tr
                      key={booking.id}
                      className="transition hover:bg-[#fbfdf9]"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-[#17351f]">
                          {booking.farmerName ||
                            "Farmer"}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          {booking.id}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-semibold text-[#17351f]">
                          {booking.cropName ||
                            "Crop"}
                        </p>

                        {booking.location && (
                          <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                            <MapPin size={12} />
                            {booking.location}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-700">
                        <span className="font-semibold">
                          {Number(
                            booking.quantity || 0
                          ).toLocaleString()}
                        </span>{" "}
                        {booking.unit || "kg"}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        <p>
                          {booking.startDate ||
                            booking.entryDate ||
                            "—"}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          to{" "}
                          {booking.endDate ||
                            booking.expectedExitDate ||
                            "—"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge
                          status={
                            booking.status
                          }
                        />
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() =>
                              setSelectedBooking(
                                booking
                              )
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:border-[#18864b] hover:text-[#18864b]"
                            title="View"
                          >
                            <Eye size={16} />
                          </button>

                          {booking.status ===
                            "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  changeStatus(
                                    booking.id,
                                    "confirmed"
                                  )
                                }
                                disabled={
                                  updatingId ===
                                  booking.id
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50"
                                title="Confirm"
                              >
                                <Check
                                  size={17}
                                />
                              </button>

                              <button
                                onClick={() =>
                                  handleDecline(
                                    booking.id
                                  )
                                }
                                disabled={
                                  updatingId ===
                                  booking.id
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50"
                                title="Decline"
                              >
                                <X size={17} />
                              </button>
                            </>
                          )}

                          {booking.status ===
                            "confirmed" && (
                            <button
                              onClick={() =>
                                changeStatus(
                                  booking.id,
                                  "completed"
                                )
                              }
                              disabled={
                                updatingId ===
                                booking.id
                              }
                              className="rounded-xl bg-[#e8f5ec] px-3 py-2 text-xs font-semibold text-[#18864b] hover:bg-[#dcefe2] disabled:opacity-50"
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAILS MODAL */}

      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b p-6">
              <div>
                <h2 className="text-xl font-bold text-[#17351f]">
                  Booking Details
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  {selectedBooking.id}
                </p>
              </div>

              <button
                onClick={() =>
                  setSelectedBooking(null)
                }
                className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-gray-100"
              >
                <X size={19} />
              </button>
            </div>

            <div className="space-y-4 p-6">
              <Detail
                label="Farmer"
                value={
                  selectedBooking.farmerName ||
                  "Farmer"
                }
              />

              <Detail
                label="Crop"
                value={
                  selectedBooking.cropName ||
                  "—"
                }
              />

              <Detail
                label="Quantity"
                value={`${Number(
                  selectedBooking.quantity || 0
                ).toLocaleString()} ${
                  selectedBooking.unit ||
                  "kg"
                }`}
              />

              <Detail
                label="Location"
                value={
                  selectedBooking.location ||
                  "—"
                }
              />

              <Detail
                label="Start Date"
                value={
                  selectedBooking.startDate ||
                  selectedBooking.entryDate ||
                  "—"
                }
              />

              <Detail
                label="End Date"
                value={
                  selectedBooking.endDate ||
                  selectedBooking.expectedExitDate ||
                  "—"
                }
              />

              <Detail
                label="Status"
                value={
                  selectedBooking.status ||
                  "pending"
                }
              />

              {selectedBooking.notes && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Notes
                  </p>

                  <p className="mt-1 text-sm text-gray-700">
                    {selectedBooking.notes}
                  </p>
                </div>
              )}
            </div>

            {selectedBooking.status ===
              "pending" && (
              <div className="flex gap-3 border-t p-6">
                <button
                  onClick={() =>
                    changeStatus(
                      selectedBooking.id,
                      "declined"
                    )
                  }
                  disabled={
                    updatingId ===
                    selectedBooking.id
                  }
                  className="sf-button flex-1 border border-red-200 bg-red-50 text-red-600"
                >
                  Decline
                </button>

                <button
                  onClick={() =>
                    changeStatus(
                      selectedBooking.id,
                      "confirmed"
                    )
                  }
                  disabled={
                    updatingId ===
                    selectedBooking.id
                  }
                  className="sf-button sf-button-primary flex-1"
                >
                  Confirm Booking
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== COMPONENTS ====================

function Stat({ icon, title, value }) {
  return (
    <div className="group sf-card relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(24,134,75,0.10)]">
      <div className="absolute -right-5 -top-5 h-20 w-20 rounded-full bg-[#f0f9f2] transition-transform duration-300 group-hover:scale-125" />

      <div className="relative flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-[#718078]">
            {title}
          </p>

          <p className="mt-2 text-2xl font-black tracking-tight text-[#16351f]">
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

function StatusBadge({ status }) {
  const styles = {
    pending:
      "bg-amber-50 text-amber-700",
    confirmed:
      "bg-green-50 text-green-700",
    declined:
      "bg-red-50 text-red-700",
    completed:
      "bg-blue-50 text-blue-700",
    cancelled:
      "bg-gray-100 text-gray-600",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        styles[status] ||
        "bg-gray-100 text-gray-600"
      }`}
    >
      {status || "pending"}
    </span>
  );
}

function Detail({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-5 border-b border-gray-100 pb-3">
      <span className="text-sm text-gray-500">
        {label}
      </span>

      <span className="text-right text-sm font-semibold text-[#17351f]">
        {value}
      </span>
    </div>
  );
}