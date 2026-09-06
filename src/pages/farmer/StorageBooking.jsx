import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  IndianRupee,
  Loader2,
  MapPin,
  Truck,
  Warehouse,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout";
import {
  createBooking,
  getStorageById,
} from "../../services/api";
import { getLoggedInUser } from "../../utils/auth";

export default function StorageBooking() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [storage, setStorage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  const [form, setForm] = useState({
    cropName: "Tomato",
    quantity: "",
    duration: 7,
    startDate: "",
    transportCost: 0,
    notes: "",
  });

  const farmer = getLoggedInUser("farmer");

  useEffect(() => {
    loadStorage();
  }, [id]);

const loadStorage = async () => {
  try {
    setLoading(true);
    setError("");

    // Backend storage IDs are like "storage-1"
    const storageId = id?.startsWith("storage-")
      ? id
      : `storage-${id}`;

    const response = await getStorageById(storageId);

    if (!response.success) {
      throw new Error(
        response.message || "Storage not found"
      );
    }

    setStorage(response.storage);
  } catch (err) {
    console.error("Storage loading error:", err);

    setError(
      err.message ||
        "Unable to load storage details."
    );
  } finally {
    setLoading(false);
  }
};
  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const storageCost =
    Number(form.quantity || 0) *
    Number(storage?.rentPerKgPerDay || 0) *
    Number(form.duration || 0);

  const totalCost =
    storageCost +
    Number(form.transportCost || 0);

  const handleBooking = async (event) => {
    event.preventDefault();

    if (!form.quantity || Number(form.quantity) <= 0) {
      setError("Please enter a valid quantity.");
      return;
    }

    if (!form.startDate) {
      setError("Please select a start date.");
      return;
    }

    if (
      Number(form.quantity) >
      Number(storage?.availableCapacity || 0)
    ) {
      setError(
        "Requested quantity is greater than available storage capacity."
      );
      return;
    }

    try {
      setBooking(true);
      setError("");

      const response = await createBooking({
        farmerId: farmer?.id || "demo-farmer",
        farmerName: farmer?.name || "Farmer",
        storageId: storage.id,
        storageName: storage.name,
        cropName: form.cropName,
        quantity: Number(form.quantity),
        duration: Number(form.duration),
        startDate: form.startDate,
        transportCost: Number(
          form.transportCost || 0
        ),
        notes: form.notes.trim(),
      });

      if (!response.success) {
        throw new Error(
          response.message ||
            "Booking failed"
        );
      }

      setSuccess(response.booking);
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to create booking."
      );
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="sf-card flex min-h-[400px] items-center justify-center">
          <div className="flex items-center gap-3 text-[#18864b]">
            <Loader2
              size={25}
              className="sf-spin"
            />
            <span className="font-semibold">
              Loading storage...
            </span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !storage) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <button
            onClick={() => navigate("/farmer/storage")}
            className="sf-button sf-button-secondary"
          >
            <ArrowLeft size={17} />
            Back to Storages
          </button>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            {error}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (success) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-2xl">

          <div className="sf-card overflow-hidden text-center">

            <div className="bg-[#18864b] px-6 py-12 text-white">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/15">
                <CheckCircle2 size={42} />
              </div>

              <h1 className="mt-5 text-3xl font-black">
                Booking Request Sent
              </h1>

              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-white/80">
                Your storage booking request has been
                sent to the storage owner.
              </p>
            </div>

            <div className="space-y-4 p-6 text-left">

              <InfoRow
                label="Booking ID"
                value={success.id}
              />

              <InfoRow
                label="Storage"
                value={success.storageName}
              />

              <InfoRow
                label="Crop"
                value={success.cropName}
              />

              <InfoRow
                label="Quantity"
                value={`${success.quantity} kg`}
              />

              <InfoRow
                label="Duration"
                value={`${success.duration} days`}
              />

              <InfoRow
                label="Status"
                value="Pending Approval"
              />

              <button
                onClick={() =>
                  navigate("/farmer/bookings")
                }
                className="sf-button sf-button-primary mt-3 w-full"
              >
                View My Bookings
              </button>

              <button
                onClick={() =>
                  navigate("/farmer/storage")
                }
                className="sf-button sf-button-secondary w-full"
              >
                Find Another Storage
              </button>

            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Back */}
        <button
          onClick={() => navigate("/farmer/storage")}
          className="sf-button sf-button-secondary"
        >
          <ArrowLeft size={17} />
          Back to Storages
        </button>

        {/* Storage header */}
        <div className="sf-card overflow-hidden">

          <div className="bg-gradient-to-br from-[#164f31] to-[#18864b] p-6 text-white sm:p-8">

            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

              <div className="flex items-center gap-4">

                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-white/15">
                  <Warehouse size={32} />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-black sm:text-3xl">
                      {storage.name}
                    </h1>

                    {storage.verified && (
                      <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
                        ✓ Verified
                      </span>
                    )}
                  </div>

                  <div className="mt-2 flex items-center gap-2 text-sm text-white/75">
                    <MapPin size={15} />
                    {storage.location}
                  </div>
                </div>

              </div>

              <div className="rounded-2xl bg-white/10 px-5 py-4">
                <p className="text-xs text-white/65">
                  Available Space
                </p>

                <p className="mt-1 text-2xl font-black">
                  {Number(
                    storage.availableCapacity || 0
                  ).toLocaleString("en-IN")}{" "}
                  kg
                </p>
              </div>

            </div>
          </div>

          <div className="grid gap-4 p-5 sm:grid-cols-3">

            <Summary
              icon={<IndianRupee size={18} />}
              label="Rent"
              value={`₹${storage.rentPerKgPerDay}/kg/day`}
            />

            <Summary
              icon={<Warehouse size={18} />}
              label="Type"
              value={storage.storageType}
            />

            <Summary
              icon={<MapPin size={18} />}
              label="Distance"
              value={`${storage.distance} km`}
            />

          </div>
        </div>

        {/* Booking form */}
        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">

          <form
            onSubmit={handleBooking}
            className="sf-card p-6"
          >
            <div className="mb-6">
              <h2 className="text-xl font-extrabold text-[#17221b]">
                Storage Booking
              </h2>

              <p className="mt-1 text-sm text-[#6d796f]">
                Enter your crop and storage requirements.
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2">

              <Field label="Crop">
                <select
                  name="cropName"
                  value={form.cropName}
                  onChange={handleChange}
                  className="sf-input"
                >
                  {(
                    storage.crops || [
                      "Tomato",
                      "Chilli",
                      "Onion",
                    ]
                  ).map((crop) => (
                    <option key={crop}>
                      {crop}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Quantity (kg)">
                <input
                  name="quantity"
                  type="number"
                  min="1"
                  value={form.quantity}
                  onChange={handleChange}
                  placeholder="1000"
                  className="sf-input"
                />
              </Field>

              <Field label="Storage Duration (days)">
                <input
                  name="duration"
                  type="number"
                  min="1"
                  value={form.duration}
                  onChange={handleChange}
                  className="sf-input"
                />
              </Field>

              <Field label="Start Date">
                <input
                  name="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={handleChange}
                  min={
                    new Date()
                      .toISOString()
                      .split("T")[0]
                  }
                  className="sf-input"
                />
              </Field>

              <Field label="Transport Cost (₹)">
                <input
                  name="transportCost"
                  type="number"
                  min="0"
                  value={form.transportCost}
                  onChange={handleChange}
                  className="sf-input"
                />
              </Field>

            </div>

            <div className="mt-5">
              <Field label="Notes">
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Any special storage requirements..."
                  className="sf-input resize-none"
                />
              </Field>
            </div>

            <button
              type="submit"
              disabled={booking}
              className="sf-button sf-button-primary mt-6 w-full"
            >
              {booking ? (
                <>
                  <Loader2
                    size={18}
                    className="sf-spin"
                  />
                  Sending Request...
                </>
              ) : (
                <>
                  <Warehouse size={18} />
                  Request Storage Booking
                </>
              )}
            </button>
          </form>

          {/* Cost summary */}
          <div className="sf-card h-fit p-6">

            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#edf7ee] text-[#18864b]">
                <IndianRupee size={21} />
              </div>

              <div>
                <h3 className="font-extrabold text-[#17221b]">
                  Cost Estimate
                </h3>

                <p className="text-xs text-[#78837b]">
                  Estimated booking cost
                </p>
              </div>
            </div>

            <div className="space-y-3">

              <CostRow
                label="Storage"
                value={`₹${storageCost.toLocaleString(
                  "en-IN"
                )}`}
              />

              <CostRow
                label="Transport"
                value={`₹${Number(
                  form.transportCost || 0
                ).toLocaleString("en-IN")}`}
              />

              <div className="border-t border-[#e8eee7] pt-4">
                <CostRow
                  label="Estimated Total"
                  value={`₹${totalCost.toLocaleString(
                    "en-IN"
                  )}`}
                  strong
                />
              </div>

            </div>

            <div className="mt-5 rounded-2xl bg-[#f5f9f4] p-4">
              <div className="flex items-start gap-3">
                <Truck
                  size={19}
                  className="mt-0.5 text-[#18864b]"
                />

                <p className="text-xs leading-5 text-[#667269]">
                  Transport cost is added separately.
                  Final charges may vary based on the
                  storage owner's confirmation.
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-[#334139]">
        {label}
      </span>
      {children}
    </label>
  );
}

function Summary({ icon, label, value }) {
  return (
    <div className="rounded-2xl bg-[#f6f9f5] p-4">
      <div className="flex items-center gap-2 text-xs font-semibold text-[#7d887f]">
        {icon}
        {label}
      </div>

      <p className="mt-2 font-extrabold text-[#26342b]">
        {value}
      </p>
    </div>
  );
}

function CostRow({
  label,
  value,
  strong = false,
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span
        className={
          strong
            ? "font-extrabold text-[#26342b]"
            : "text-sm text-[#68746c]"
        }
      >
        {label}
      </span>

      <span
        className={
          strong
            ? "text-xl font-black text-[#18864b]"
            : "font-bold text-[#344239]"
        }
      >
        {value}
      </span>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-[#f6f9f5] px-4 py-3">
      <span className="text-sm text-[#718078]">
        {label}
      </span>

      <span className="text-right text-sm font-extrabold text-[#26342b]">
        {value}
      </span>
    </div>
  );
}