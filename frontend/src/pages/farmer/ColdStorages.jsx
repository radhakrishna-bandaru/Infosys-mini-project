import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Filter,
  Loader2,
  MapPin,
  Search,
  Thermometer,
  Warehouse,
} from "lucide-react";

import DashboardLayout from "../../layouts/DashboardLayout";
import { getStorages } from "../../services/api";

const crops = [
  "All Crops",
  "Tomato",
  "Chilli",
  "Onion",
  "Potato",
];

export default function ColdStorages() {
  const [storages, setStorages] = useState([]);
  const [selectedCrop, setSelectedCrop] =
    useState("All Crops");
  const [search, setSearch] = useState("");
  const [verifiedOnly, setVerifiedOnly] =
    useState(false);
  const [sortBy, setSortBy] =
    useState("distance");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStorages = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getStorages({
        crop:
          selectedCrop !== "All Crops"
            ? selectedCrop
            : undefined,
        verified: verifiedOnly,
      });

      setStorages(response.storages || []);
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to load cold storages."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStorages();
  }, [selectedCrop, verifiedOnly]);

  const filteredStorages = useMemo(() => {
    const result = storages.filter((storage) => {
      const text =
        `${storage.name} ${storage.location} ${storage.owner}`
          .toLowerCase();

      return text.includes(search.toLowerCase());
    });

    return [...result].sort((a, b) => {
      if (sortBy === "distance") {
        return (
          Number(a.distance || 0) -
          Number(b.distance || 0)
        );
      }

      if (sortBy === "rent-low") {
        return (
          Number(a.rentPerKgPerDay || 0) -
          Number(b.rentPerKgPerDay || 0)
        );
      }

      if (sortBy === "capacity") {
        return (
          Number(b.availableCapacity || 0) -
          Number(a.availableCapacity || 0)
        );
      }

      return 0;
    });
  }, [storages, search, sortBy]);

  const totalCapacity = storages.reduce(
    (sum, storage) =>
      sum + Number(storage.capacity || 0),
    0
  );

  const availableCapacity = storages.reduce(
    (sum, storage) =>
      sum +
      Number(storage.availableCapacity || 0),
    0
  );

  const verifiedCount = storages.filter(
    (storage) => storage.verified
  ).length;

  return (
    <DashboardLayout>
      <div className="cold-storage-page space-y-6">

        {/* Header */}
        <div>
          

          <h1 className="sf-section-title text-3xl sm:text-4xl">
            Find Cold Storage
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-[#6d796f]">
            Find suitable storage based on crop,
            availability, rent, distance and verification.
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

          <StatCard
            icon={<Warehouse size={20} />}
            label="Storages Found"
            value={storages.length}
          />

          <StatCard
            icon={<CheckCircle2 size={20} />}
            label="Verified"
            value={verifiedCount}
          />

          <StatCard
            icon={<Warehouse size={20} />}
            label="Total Capacity"
            value={`${totalCapacity.toLocaleString("en-IN")} kg`}
          />

          <StatCard
            icon={<CheckCircle2 size={20} />}
            label="Available Space"
            value={`${availableCapacity.toLocaleString("en-IN")} kg`}
          />

        </div>

        {/* Filters */}
        <div className="sf-card p-4">
          <div className="flex flex-col gap-4">

            <div className="flex flex-col gap-3 lg:flex-row">

           <div className="relative min-w-0 flex-1">
  <Search
    size={16}
    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#89948c]"
  />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search storage or location..."
                  className="w-full rounded-2xl border border-[#dfe7df] bg-white py-3 pl-11 pr-4"
                />
              </div>

              <select
                value={selectedCrop}
                onChange={(event) =>
                  setSelectedCrop(event.target.value)
                }
               className="sf-input !w-44 shrink-0"
              >
                {crops.map((crop) => (
                  <option key={crop}>
                    {crop}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(event) =>
                  setSortBy(event.target.value)
                }
                className="sf-input !w-48 shrink-0"
              >
                <option value="distance">
                  Nearest First
                </option>
                <option value="rent-low">
                  Lowest Rent
                </option>
                <option value="capacity">
                  More Space
                </option>
              </select>

            </div>

            <button
              onClick={() =>
                setVerifiedOnly(
                  (previous) => !previous
                )
              }
              className={`flex w-fit items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold ${
                verifiedOnly
                  ? "bg-[#18864b] text-white"
                  : "bg-[#eef5ee] text-[#4f5d53]"
              }`}
            >
              <Filter size={16} />
              Verified Only
            </button>

          </div>
        </div>

        {/* Storage cards */}
        {loading ? (
          <div className="sf-card flex min-h-[320px] items-center justify-center">
            <div className="flex items-center gap-3 text-[#18864b]">
              <Loader2
                size={25}
                className="sf-spin"
              />
              <span className="font-semibold">
                Loading cold storages...
              </span>
            </div>
          </div>
        ) : filteredStorages.length === 0 ? (
          <div className="sf-card flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
            <Warehouse
              size={42}
              className="mb-4 text-[#18864b]"
            />

            <h3 className="text-xl font-extrabold text-[#17221b]">
              No storage found
            </h3>

            <p className="mt-2 text-sm text-[#6d796f]">
              Try another crop, location or filter.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

            {filteredStorages.map((storage) => (
              <StorageCard
                key={storage.id}
                storage={storage}
              />
            ))}

          </div>
        )}

      </div>
    </DashboardLayout>
  );
}

function StatCard({ icon, label, value }) {
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

function StorageCard({ storage }) {
  const occupancy =
    Number(storage.capacity) > 0
      ? Math.round(
          ((Number(storage.capacity) -
            Number(storage.availableCapacity)) /
            Number(storage.capacity)) *
            100
        )
      : 0;

  return (
    <div className="sf-card sf-card-hover overflow-hidden">

      {/* Header */}
      <div className="border-b border-[#edf1ec] p-5">

        <div className="flex items-start justify-between gap-3">

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#eaf6eb] text-[#18864b]">
              <Warehouse size={23} />
            </div>

            <div>
              <h3 className="font-extrabold text-[#17221b]">
                {storage.name}
              </h3>

              <p className="mt-1 text-xs text-[#758078]">
                {storage.owner}
              </p>
            </div>

          </div>

          {storage.verified && (
            <div className="flex items-center gap-1 rounded-full bg-[#eaf7ed] px-2.5 py-1 text-xs font-bold text-[#18864b]">
              <CheckCircle2 size={13} />
              Verified
            </div>
          )}

        </div>

      </div>

      {/* Details */}
      <div className="space-y-4 p-5">

        <div className="flex items-center gap-2 text-sm text-[#637067]">
          <MapPin size={16} />
          {storage.location}
          <span className="ml-auto font-bold text-[#18864b]">
            {storage.distance} km
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">

          <Info
            label="Available"
            value={`${Number(
              storage.availableCapacity || 0
            ).toLocaleString("en-IN")} kg`}
          />

          <Info
            label="Rent"
            value={`₹${storage.rentPerKgPerDay}/kg/day`}
          />

          <Info
            label="Temperature"
            value={storage.temperature}
            icon={<Thermometer size={14} />}
          />

          <Info
            label="Occupancy"
            value={`${occupancy}%`}
          />

        </div>

        {/* Capacity */}
        <div>
          <div className="mb-2 flex justify-between text-xs">
            <span className="font-semibold text-[#748078]">
              Storage Occupancy
            </span>

            <span className="font-bold text-[#334139]">
              {occupancy}%
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-[#e7eee6]">
            <div
              className="h-full rounded-full bg-[#18864b]"
              style={{
                width: `${Math.min(
                  occupancy,
                  100
                )}%`,
              }}
            />
          </div>
        </div>

        {/* Crops */}
        <div>
          <p className="mb-2 text-xs font-bold text-[#748078]">
            Suitable Crops
          </p>

          <div className="flex flex-wrap gap-2">
            {(storage.crops || []).map((crop) => (
              <span
                key={crop}
                className="rounded-full bg-[#f1f6f0] px-3 py-1 text-xs font-semibold text-[#526056]"
              >
                {crop}
              </span>
            ))}
          </div>
        </div>

        {/* Action */}
        <button
          onClick={() =>
            (window.location.href =
              `/farmer/storage/${storage.id}`)
          }
          className="sf-button sf-button-primary w-full"
        >
          View Storage & Book
        </button>

      </div>
    </div>
  );
}

function Info({ label, value, icon }) {
  return (
    <div className="rounded-xl bg-[#f6f9f5] p-3">
      <p className="flex items-center gap-1 text-xs font-semibold text-[#89938b]">
        {icon}
        {label}
      </p>

      <p className="mt-1 text-sm font-extrabold text-[#29372e]">
        {value}
      </p>
    </div>
  );
}