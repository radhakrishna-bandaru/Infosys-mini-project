import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  Loader2,
  MapPin,
  Package,
  Search,
  Warehouse,
  X,
  XCircle,
} from "lucide-react";

import DashboardLayout from "../../layouts/DashboardLayout";
import {
  getBookings,
  updateBookingStatus,
} from "../../services/api";
import { getLoggedInUser } from "../../utils/auth";

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");

  const [selectedBooking, setSelectedBooking] =
    useState(null);

  const [processingId, setProcessingId] =
    useState(null);

  const farmer = getLoggedInUser("farmer");

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getBookings({
        farmerId: farmer?.id,
      });

      setBookings(response.bookings || []);
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to load your bookings."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const text =
        `${booking.id} ${booking.storageName} ${booking.cropName}`
          .toLowerCase();

      const matchesSearch =
        text.includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        booking.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, search, statusFilter]);

  const pendingCount = bookings.filter(
    (booking) => booking.status === "pending"
  ).length;

  const confirmedCount = bookings.filter(
    (booking) => booking.status === "confirmed"
  ).length;

  const totalQuantity = bookings.reduce(
    (sum, booking) =>
      sum + Number(booking.quantity || 0),
    0
  );

  const cancelBooking = async (id) => {
    const confirmed = window.confirm(
      "Cancel this booking request?"
    );

    if (!confirmed) return;

    try {
      setProcessingId(id);
      setError("");

      const response =
        await updateBookingStatus(
          id,
          "cancelled"
        );

      if (!response.success) {
        throw new Error(
          response.message ||
            "Unable to cancel booking"
        );
      }

      setBookings((previous) =>
        previous.map((booking) =>
          booking.id === id
            ? response.booking
            : booking
        )
      );

      setSelectedBooking((previous) =>
        previous?.id === id
          ? response.booking
          : previous
      );
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to cancel booking."
      );
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="bookings-page space-y-6">

        {/* Header */}
        <div>
          

          <h1 className="sf-section-title text-3xl sm:text-4xl">
            My Bookings
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-[#6d796f]">
            Track your storage requests, approval
            status and stored crop quantities.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <Stat
            icon={<CalendarDays size={20} />}
            label="Total Bookings"
            value={bookings.length}
          />

          <Stat
            icon={<Clock3 size={20} />}
            label="Pending"
            value={pendingCount}
          />

          <Stat
            icon={<CheckCircle2 size={20} />}
            label="Confirmed"
            value={confirmedCount}
          />

          <Stat
            icon={<Package size={20} />}
            label="Total Quantity"
            value={`${totalQuantity.toLocaleString(
              "en-IN"
            )} kg`}
          />

        </div>

        {/* Filters */}
        <div className="sf-card p-4">

          <div className="flex flex-col gap-4 lg:flex-row">

            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#89948c]"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search booking, storage or crop..."
                className="sf-input pl-11"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto">

              {[
                "all",
                "pending",
                "confirmed",
                "declined",
                "cancelled",
                "completed",
              ].map((status) => (
                <button
                  key={status}
                  onClick={() =>
                    setStatusFilter(status)
                  }
                  className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-bold capitalize ${
                    statusFilter === status
                      ? "bg-[#18864b] text-white"
                      : "bg-[#eef5ee] text-[#526056]"
                  }`}
                >
                  {status}
                </button>
              ))}

            </div>

          </div>
        </div>

        {/* Bookings */}
        {loading ? (
          <div className="sf-card flex min-h-[320px] items-center justify-center">
            <div className="flex items-center gap-3 text-[#18864b]">
              <Loader2
                size={25}
                className="sf-spin"
              />
              <span className="font-semibold">
                Loading your bookings...
              </span>
            </div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="sf-card flex min-h-[300px] flex-col items-center justify-center px-6 text-center">

            <Warehouse
              size={42}
              className="mb-4 text-[#18864b]"
            />

            <h3 className="text-xl font-extrabold text-[#17221b]">
              No bookings found
            </h3>

            <p className="mt-2 max-w-md text-sm text-[#6d796f]">
              Your storage booking requests will appear
              here after you submit them.
            </p>

          </div>
        ) : (
          <div className="grid gap-5 xl:grid-cols-2">

            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                processing={
                  processingId === booking.id
                }
                onView={() =>
                  setSelectedBooking(booking)
                }
                onCancel={() =>
                  cancelBooking(booking.id)
                }
              />
            ))}

          </div>
        )}

        {/* Details */}
        {selectedBooking && (
          <BookingModal
            booking={selectedBooking}
            processing={
              processingId === selectedBooking.id
            }
            onClose={() =>
              setSelectedBooking(null)
            }
            onCancel={() =>
              cancelBooking(selectedBooking.id)
            }
          />
        )}

      </div>
    </DashboardLayout>
  );
}

function BookingCard({
  booking,
  processing,
  onView,
  onCancel,
}) {
  return (
    <div className="sf-card sf-card-hover overflow-hidden">

      <div className="flex items-start justify-between border-b border-[#edf1ec] p-5">

        <div className="flex items-center gap-3">

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf6eb] text-[#18864b]">
            <Warehouse size={23} />
          </div>

          <div>
            <p className="text-xs font-bold text-[#89938b]">
              {booking.id}
            </p>

            <h3 className="mt-1 font-extrabold text-[#17221b]">
              {booking.storageName}
            </h3>

            <p className="text-sm text-[#718078]">
              {booking.cropName}
            </p>
          </div>

        </div>

        <StatusBadge
          status={booking.status}
        />

      </div>

      <div className="space-y-4 p-5">

        <div className="grid grid-cols-2 gap-3">

          <Info
            label="Quantity"
            value={`${Number(
              booking.quantity || 0
            ).toLocaleString("en-IN")} kg`}
          />

          <Info
            label="Duration"
            value={`${booking.duration} days`}
          />

          <Info
            label="Start Date"
            value={formatDate(
              booking.startDate
            )}
          />

          <Info
            label="Transport"
            value={`₹${Number(
              booking.transportCost || 0
            ).toLocaleString("en-IN")}`}
          />

        </div>

        <div className="flex items-center gap-2 text-sm text-[#667269]">
          <MapPin size={16} />
          Storage booking request
        </div>

        <div className="flex gap-2 border-t border-[#edf1ec] pt-4">

          <button
            onClick={onView}
            className="sf-button sf-button-secondary flex-1"
          >
            <Eye size={16} />
            View Details
          </button>

          {booking.status === "pending" && (
            <button
              onClick={onCancel}
              disabled={processing}
              className="sf-button bg-red-50 text-red-600 hover:bg-red-100"
            >
              {processing ? (
                <Loader2
                  size={16}
                  className="sf-spin"
                />
              ) : (
                <XCircle size={16} />
              )}

              Cancel
            </button>
          )}

        </div>

      </div>
    </div>
  );
}

function BookingModal({
  booking,
  processing,
  onClose,
  onCancel,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">

      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white shadow-2xl">

        <div className="flex items-center justify-between border-b border-[#e7ece6] px-6 py-5">

          <div>
            <p className="text-xs font-bold text-[#89938b]">
              {booking.id}
            </p>

            <h2 className="mt-1 text-xl font-extrabold text-[#17221b]">
              Booking Details
            </h2>
          </div>

          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f2f5f1] text-[#526056]"
          >
            <X size={19} />
          </button>

        </div>

        <div className="space-y-4 p-6">

          <Detail
            label="Storage"
            value={booking.storageName}
          />

          <Detail
            label="Crop"
            value={booking.cropName}
          />

          <Detail
            label="Quantity"
            value={`${booking.quantity} kg`}
          />

          <Detail
            label="Duration"
            value={`${booking.duration} days`}
          />

          <Detail
            label="Start Date"
            value={formatDate(
              booking.startDate
            )}
          />

          <Detail
            label="Transport"
            value={`₹${Number(
              booking.transportCost || 0
            ).toLocaleString("en-IN")}`}
          />

          <Detail
            label="Status"
            value={booking.status}
          />

          {booking.notes && (
            <div className="rounded-2xl bg-[#f5f8f4] p-4">
              <p className="text-xs font-bold text-[#849087]">
                Your Notes
              </p>

              <p className="mt-2 text-sm leading-6 text-[#435047]">
                {booking.notes}
              </p>
            </div>
          )}

          {booking.status === "pending" && (
            <button
              onClick={onCancel}
              disabled={processing}
              className="sf-button mt-2 w-full bg-red-50 text-red-600 hover:bg-red-100"
            >
              {processing ? (
                <>
                  <Loader2
                    size={17}
                    className="sf-spin"
                  />
                  Cancelling...
                </>
              ) : (
                <>
                  <XCircle size={17} />
                  Cancel Booking
                </>
              )}
            </button>
          )}

        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    pending: "bg-amber-50 text-amber-700",
    confirmed: "bg-[#eaf7ed] text-[#18864b]",
    declined: "bg-red-50 text-red-600",
    cancelled: "bg-[#f1f3f1] text-[#68736b]",
    completed: "bg-blue-50 text-blue-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize ${
        styles[status] ||
        "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div className="sf-card sf-card-hover p-5">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#edf7ee] text-[#18864b]">
        {icon}
      </div>

      <p className="text-sm text-[#6d796f]">
        {label}
      </p>

      <p className="mt-1 text-2xl font-extrabold text-[#17221b]">
        {value}
      </p>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-xl bg-[#f6f9f5] p-3">
      <p className="text-xs font-semibold text-[#89938b]">
        {label}
      </p>

      <p className="mt-1 text-sm font-extrabold text-[#29372e]">
        {value}
      </p>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-[#f6f9f5] px-4 py-3">
      <span className="text-sm text-[#748078]">
        {label}
      </span>

      <span className="text-right text-sm font-extrabold capitalize text-[#26342b]">
        {value}
      </span>
    </div>
  );
}

function formatDate(date) {
  if (!date) return "Not specified";

  return new Date(date).toLocaleDateString(
    "en-IN"
  );
}