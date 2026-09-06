import { useEffect, useMemo, useState } from "react";
import {
  Eye,
  RefreshCw,
  Search,
  ShieldCheck,
  ShieldOff,
  Power,
  PowerOff,
  Trash2,
  X,
  Warehouse,
  MapPin,
  Thermometer,
  IndianRupee,
  Package,
  Loader2,
  AlertCircle,
} from "lucide-react";

import {
  getStorages,
  updateStorageStatus,
  updateStorageVerification,
  deleteStorage,
} from "../../services/api";

export default function ManageStorages() {
  const [storages, setStorages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [verificationFilter, setVerificationFilter] =
    useState("all");

  const [selectedStorage, setSelectedStorage] =
    useState(null);

  async function loadStorages() {
    try {
      setLoading(true);
      setError("");

      const response = await getStorages();

      setStorages(response.storages || []);
    } catch (err) {
      setError(
        err.message || "Failed to load storages"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStorages();
  }, []);

  const filteredStorages = useMemo(() => {
    const text = search.trim().toLowerCase();

    return storages.filter((storage) => {
      const matchesSearch =
        !text ||
        storage.name?.toLowerCase().includes(text) ||
        storage.owner?.toLowerCase().includes(text) ||
        storage.location
          ?.toLowerCase()
          .includes(text);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" &&
          storage.active !== false) ||
        (statusFilter === "inactive" &&
          storage.active === false);

      const matchesVerification =
        verificationFilter === "all" ||
        (verificationFilter === "verified" &&
          storage.verified === true) ||
        (verificationFilter === "unverified" &&
          storage.verified !== true);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesVerification
      );
    });
  }, [
    storages,
    search,
    statusFilter,
    verificationFilter,
  ]);

  const stats = useMemo(() => {
    return {
      total: storages.length,
      active: storages.filter(
        (item) => item.active !== false
      ).length,
      verified: storages.filter(
        (item) => item.verified === true
      ).length,
      capacity: storages.reduce(
        (sum, item) =>
          sum + Number(item.capacity || 0),
        0
      ),
    };
  }, [storages]);

  async function handleStatusChange(storage) {
    const nextStatus = storage.active === false;

    try {
      setActionLoading(`status-${storage.id}`);
      setError("");

      const response =
        await updateStorageStatus(
          storage.id,
          nextStatus
        );

      setStorages((current) =>
        current.map((item) =>
          item.id === storage.id
            ? response.storage
            : item
        )
      );
    } catch (err) {
      setError(
        err.message ||
          "Failed to update storage status"
      );
    } finally {
      setActionLoading("");
    }
  }

  async function handleVerification(storage) {
    const nextVerified =
      storage.verified !== true;

    try {
      setActionLoading(
        `verify-${storage.id}`
      );
      setError("");

      const response =
        await updateStorageVerification(
          storage.id,
          nextVerified
        );

      setStorages((current) =>
        current.map((item) =>
          item.id === storage.id
            ? response.storage
            : item
        )
      );

      if (
        selectedStorage?.id === storage.id
      ) {
        setSelectedStorage(
          response.storage
        );
      }
    } catch (err) {
      setError(
        err.message ||
          "Failed to update verification"
      );
    } finally {
      setActionLoading("");
    }
  }

  async function handleDelete(storage) {
    const confirmed = window.confirm(
      `Delete "${storage.name}" permanently?`
    );

    if (!confirmed) return;

    try {
      setActionLoading(
        `delete-${storage.id}`
      );
      setError("");

      await deleteStorage(storage.id);

      setStorages((current) =>
        current.filter(
          (item) => item.id !== storage.id
        )
      );

      if (
        selectedStorage?.id === storage.id
      ) {
        setSelectedStorage(null);
      }
    } catch (err) {
      setError(
        err.message ||
          "Failed to delete storage"
      );
    } finally {
      setActionLoading("");
    }
  }

  function formatNumber(value) {
    return Number(value || 0).toLocaleString(
      "en-IN"
    );
  }

  return (
    <div className="admin-storages-page space-y-6 pb-10">
      {/* HEADER */}
<div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f6b3d] via-[#18864b] to-[#42a96c] p-6 text-white shadow-[0_18px_45px_rgba(24,134,75,0.18)] sm:p-8">
  <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
    <div className="min-w-0">
      <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold backdrop-blur-sm">
        <Warehouse size={14} />
        ADMIN CONTROL
      </div>

      <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
        Manage Storages
      </h1>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75 sm:text-[15px]">
        Monitor, verify and manage all registered cold storage
        facilities across the Smart Farmer platform.
      </p>
    </div>

    <button
      type="button"
      onClick={loadStorages}
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
              Something went wrong
            </p>

            <p className="mt-1">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* STATS */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          icon={<Warehouse size={21} />}
          label="Total Storages"
          value={formatNumber(stats.total)}
        />

        <Stat
          icon={<Power size={21} />}
          label="Active Storages"
          value={formatNumber(stats.active)}
        />

        <Stat
          icon={<ShieldCheck size={21} />}
          label="Verified"
          value={formatNumber(stats.verified)}
        />

        <Stat
          icon={<Package size={21} />}
          label="Total Capacity"
          value={`${formatNumber(stats.capacity)} kg`}
        />
      </div>

     {/* FILTERS */}
<div className="sf-card p-4 sm:p-5">
  <div className="grid gap-3 lg:grid-cols-[1fr_190px_190px]">
    <div className="relative min-w-0">
      <Search
        size={19}
        className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[#8a978f]"
      />

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search storage, owner or location..."
        className="sf-input w-full pl-11"
      />
    </div>

    <select
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value)}
      className="sf-input w-full"
    >
      <option value="all">All Status</option>
      <option value="active">Active</option>
      <option value="inactive">Inactive</option>
    </select>

    <select
      value={verificationFilter}
      onChange={(e) => setVerificationFilter(e.target.value)}
      className="sf-input w-full"
    >
      <option value="all">All Verification</option>
      <option value="verified">Verified</option>
      <option value="unverified">Unverified</option>
    </select>
  </div>
</div>
      {/* STORAGE LIST */}
      <div className="sf-card overflow-hidden">
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="flex items-center gap-3 text-gray-500">
              <Loader2
                size={22}
                className="animate-spin"
              />
              Loading storages...
            </div>
          </div>
        ) : filteredStorages.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
            <Warehouse
              size={42}
              className="text-gray-300"
            />

            <h3 className="mt-4 text-lg font-semibold text-gray-700">
              No storages found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70 text-left text-xs uppercase tracking-wide text-gray-500">
                    <th className="px-5 py-4">
                      Storage
                    </th>

                    <th className="px-5 py-4">
                      Location
                    </th>

                    <th className="px-5 py-4">
                      Capacity
                    </th>

                    <th className="px-5 py-4">
                      Rent
                    </th>

                    <th className="px-5 py-4">
                      Status
                    </th>

                    <th className="px-5 py-4">
                      Verification
                    </th>

                    <th className="px-5 py-4 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredStorages.map(
                    (storage) => (
                      <tr
                        key={storage.id}
                        className="border-b border-gray-100 last:border-0"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e8f5ec] text-[#18864b]">
                              <Warehouse
                                size={21}
                              />
                            </div>

                            <div>
                              <p className="font-semibold text-[#16351f]">
                                {storage.name}
                              </p>

                              <p className="text-xs text-gray-500">
                                {storage.owner}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <MapPin
                              size={15}
                            />
                            {storage.location ||
                              "—"}
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm">
                          <p className="font-semibold text-gray-700">
                            {formatNumber(
                              storage.capacity
                            )}{" "}
                            kg
                          </p>

                          <p className="text-xs text-gray-400">
                            {formatNumber(
                              storage.availableCapacity
                            )}{" "}
                            available
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm font-semibold text-gray-700">
                          ₹
                          {Number(
                            storage.rentPerKgPerDay ||
                              0
                          ).toFixed(2)}
                          <span className="font-normal text-gray-400">
                            {" "}
                            /kg/day
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge
                            active={
                              storage.active !==
                              false
                            }
                          />
                        </td>

                        <td className="px-5 py-4">
                          <VerificationBadge
                            verified={
                              storage.verified ===
                              true
                            }
                          />
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <ActionButton
                              title="View"
                              onClick={() =>
                                setSelectedStorage(
                                  storage
                                )
                              }
                            >
                              <Eye size={17} />
                            </ActionButton>

                            <ActionButton
                              title={
                                storage.verified
                                  ? "Unverify"
                                  : "Verify"
                              }
                              onClick={() =>
                                handleVerification(
                                  storage
                                )
                              }
                              loading={
                                actionLoading ===
                                `verify-${storage.id}`
                              }
                            >
                              {storage.verified ? (
                                <ShieldOff
                                  size={17}
                                />
                              ) : (
                                <ShieldCheck
                                  size={17}
                                />
                              )}
                            </ActionButton>

                            <ActionButton
                              title={
                                storage.active ===
                                false
                                  ? "Activate"
                                  : "Deactivate"
                              }
                              onClick={() =>
                                handleStatusChange(
                                  storage
                                )
                              }
                              loading={
                                actionLoading ===
                                `status-${storage.id}`
                              }
                            >
                              {storage.active ===
                              false ? (
                                <Power
                                  size={17}
                                />
                              ) : (
                                <PowerOff
                                  size={17}
                                />
                              )}
                            </ActionButton>

                            <ActionButton
                              title="Delete"
                              danger
                              onClick={() =>
                                handleDelete(
                                  storage
                                )
                              }
                              loading={
                                actionLoading ===
                                `delete-${storage.id}`
                              }
                            >
                              <Trash2 size={17} />
                            </ActionButton>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARDS */}
            <div className="grid gap-4 p-4 lg:hidden">
              {filteredStorages.map(
                (storage) => (
                  <div
                    key={storage.id}
                    className="rounded-2xl border border-gray-100 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e8f5ec] text-[#18864b]">
                          <Warehouse
                            size={21}
                          />
                        </div>

                        <div>
                          <h3 className="font-semibold text-[#16351f]">
                            {storage.name}
                          </h3>

                          <p className="text-xs text-gray-500">
                            {storage.owner}
                          </p>
                        </div>
                      </div>

                      <StatusBadge
                        active={
                          storage.active !== false
                        }
                      />
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <Info
                        icon={<MapPin size={15} />}
                        label="Location"
                        value={
                          storage.location || "—"
                        }
                      />

                      <Info
                        icon={<Package size={15} />}
                        label="Capacity"
                        value={`${formatNumber(
                          storage.capacity
                        )} kg`}
                      />

                      <Info
                        icon={
                          <IndianRupee size={15} />
                        }
                        label="Rent"
                        value={`₹${Number(
                          storage.rentPerKgPerDay ||
                            0
                        ).toFixed(2)}/kg/day`}
                      />

                      <Info
                        icon={
                          <Thermometer size={15} />
                        }
                        label="Temperature"
                        value={
                          storage.temperature ||
                          "—"
                        }
                      />
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <VerificationBadge
                        verified={
                          storage.verified === true
                        }
                      />

                      <div className="flex gap-2">
                        <ActionButton
                          title="View"
                          onClick={() =>
                            setSelectedStorage(
                              storage
                            )
                          }
                        >
                          <Eye size={16} />
                        </ActionButton>

                        <ActionButton
                          title={
                            storage.verified
                              ? "Unverify"
                              : "Verify"
                          }
                          onClick={() =>
                            handleVerification(
                              storage
                            )
                          }
                        >
                          {storage.verified ? (
                            <ShieldOff
                              size={16}
                            />
                          ) : (
                            <ShieldCheck
                              size={16}
                            />
                          )}
                        </ActionButton>

                        <ActionButton
                          title={
                            storage.active === false
                              ? "Activate"
                              : "Deactivate"
                          }
                          onClick={() =>
                            handleStatusChange(
                              storage
                            )
                          }
                        >
                          {storage.active === false ? (
                            <Power size={16} />
                          ) : (
                            <PowerOff size={16} />
                          )}
                        </ActionButton>

                        <ActionButton
                          title="Delete"
                          danger
                          onClick={() =>
                            handleDelete(
                              storage
                            )
                          }
                        >
                          <Trash2 size={16} />
                        </ActionButton>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </>
        )}
      </div>

      {/* VIEW MODAL */}
      {selectedStorage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedStorage(null);
            }
          }}
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4 sm:px-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#18864b]">
                  Storage Details
                </p>

                <h2 className="mt-1 text-xl font-bold text-[#16351f]">
                  {selectedStorage.name}
                </h2>
              </div>

              <button
                onClick={() =>
                  setSelectedStorage(null)
                }
                className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <div className="flex flex-wrap gap-2">
                <StatusBadge
                  active={
                    selectedStorage.active !==
                    false
                  }
                />

                <VerificationBadge
                  verified={
                    selectedStorage.verified ===
                    true
                  }
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Detail
                  label="Storage Owner"
                  value={
                    selectedStorage.owner || "—"
                  }
                />

                <Detail
                  label="Storage Type"
                  value={
                    selectedStorage.storageType ||
                    "—"
                  }
                />

                <Detail
                  label="Location"
                  value={
                    selectedStorage.location ||
                    "—"
                  }
                />

                <Detail
                  label="Temperature"
                  value={
                    selectedStorage.temperature ||
                    "—"
                  }
                />

                <Detail
                  label="Total Capacity"
                  value={`${formatNumber(
                    selectedStorage.capacity
                  )} kg`}
                />

                <Detail
                  label="Available Capacity"
                  value={`${formatNumber(
                    selectedStorage.availableCapacity
                  )} kg`}
                />

                <Detail
                  label="Rent / kg / day"
                  value={`₹${Number(
                    selectedStorage.rentPerKgPerDay ||
                      0
                  ).toFixed(2)}`}
                />

                <Detail
                  label="Distance"
                  value={
                    selectedStorage.distance
                      ? `${selectedStorage.distance} km`
                      : "—"
                  }
                />
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-gray-700">
                  Supported Crops
                </p>

                <div className="flex flex-wrap gap-2">
                  {selectedStorage.crops
                    ?.length ? (
                    selectedStorage.crops.map(
                      (crop) => (
                        <span
                          key={crop}
                          className="rounded-full bg-[#e8f5ec] px-3 py-1.5 text-xs font-semibold text-[#18864b]"
                        >
                          {crop}
                        </span>
                      )
                    )
                  ) : (
                    <span className="text-sm text-gray-400">
                      No crops listed
                    </span>
                  )}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <button
                  onClick={() =>
                    handleVerification(
                      selectedStorage
                    )
                  }
                  className="sf-button sf-button-secondary"
                >
                  {selectedStorage.verified ? (
                    <>
                      <ShieldOff size={17} />
                      Unverify
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={17} />
                      Verify
                    </>
                  )}
                </button>

                <button
                  onClick={() =>
                    handleStatusChange(
                      selectedStorage
                    )
                  }
                  className="sf-button sf-button-secondary"
                >
                  {selectedStorage.active ===
                  false ? (
                    <>
                      <Power size={17} />
                      Activate
                    </>
                  ) : (
                    <>
                      <PowerOff size={17} />
                      Deactivate
                    </>
                  )}
                </button>

                <button
                  onClick={() =>
                    handleDelete(
                      selectedStorage
                    )
                  }
                  className="flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={17} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div className="group sf-card relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(24,134,75,0.10)]">
      <div className="absolute -right-5 -top-5 h-20 w-20 rounded-full bg-[#f0f9f2] transition-transform duration-300 group-hover:scale-125" />

      <div className="relative flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-[#718078]">
            {label}
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

function StatusBadge({ active }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
        active
          ? "bg-green-50 text-green-700"
          : "bg-gray-100 text-gray-600"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function VerificationBadge({ verified }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        verified
          ? "bg-blue-50 text-blue-700"
          : "bg-amber-50 text-amber-700"
      }`}
    >
      {verified ? (
        <ShieldCheck size={13} />
      ) : (
        <ShieldOff size={13} />
      )}

      {verified ? "Verified" : "Unverified"}
    </span>
  );
}

function ActionButton({
  children,
  title,
  onClick,
  danger = false,
  loading = false,
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={loading}
      className={`flex h-9 w-9 items-center justify-center rounded-xl border transition ${
        danger
          ? "border-red-100 text-red-500 hover:bg-red-50"
          : "border-gray-200 text-gray-600 hover:border-[#b9ddc5] hover:bg-[#f2faf4] hover:text-[#18864b]"
      } disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {loading ? (
        <Loader2
          size={16}
          className="animate-spin"
        />
      ) : (
        children
      )}
    </button>
  );
}

function Info({ icon, label, value }) {
  return (
    <div className="rounded-xl bg-gray-50 p-3">
      <div className="flex items-center gap-1.5 text-xs text-gray-400">
        {icon}
        {label}
      </div>

      <p className="mt-1 truncate text-sm font-semibold text-gray-700">
        {value}
      </p>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="rounded-2xl border border-gray-100 p-4">
      <p className="text-xs text-gray-400">
        {label}
      </p>

      <p className="mt-1 font-semibold text-gray-700">
        {value}
      </p>
    </div>
  );
}