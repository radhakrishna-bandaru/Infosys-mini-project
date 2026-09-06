import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Users,
  UserCheck,
  UserX,
  Eye,
  Trash2,
  X,
  Phone,
  Mail,
  MapPin,
  Building2,
  Loader2,
  AlertCircle,
} from "lucide-react";

import {
  getUsers,
  updateUserStatus,
  deleteUser,
} from "../../services/api";

export default function ManageBuyers() {
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] =
    useState("");
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");

  const [selectedBuyer, setSelectedBuyer] =
    useState(null);

  async function loadBuyers() {
    try {
      setLoading(true);
      setError("");

      const response = await getUsers({
        role: "buyer",
      });

      setBuyers(response.users || []);
    } catch (err) {
      setError(
        err.message || "Failed to load buyers"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBuyers();
  }, []);

  const filteredBuyers = useMemo(() => {
    const text = search.trim().toLowerCase();

    return buyers.filter((buyer) => {
      const matchesSearch =
        !text ||
        buyer.name
          ?.toLowerCase()
          .includes(text) ||
        buyer.email
          ?.toLowerCase()
          .includes(text) ||
        buyer.phone?.includes(search) ||
        buyer.businessName
          ?.toLowerCase()
          .includes(text) ||
        buyer.location
          ?.toLowerCase()
          .includes(text);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" &&
          buyer.active !== false) ||
        (statusFilter === "inactive" &&
          buyer.active === false);

      return (
        matchesSearch && matchesStatus
      );
    });
  }, [buyers, search, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: buyers.length,

      active: buyers.filter(
        (buyer) => buyer.active !== false
      ).length,

      inactive: buyers.filter(
        (buyer) => buyer.active === false
      ).length,
    };
  }, [buyers]);

  async function handleStatusChange(buyer) {
    const nextStatus =
      buyer.active === false;

    try {
      setActionLoading(
        `status-${buyer.id}`
      );
      setError("");

      const response =
        await updateUserStatus(
          buyer.id,
          nextStatus
        );

      setBuyers((current) =>
        current.map((item) =>
          String(item.id) ===
          String(buyer.id)
            ? response.user
            : item
        )
      );

      if (
        selectedBuyer &&
        String(selectedBuyer.id) ===
          String(buyer.id)
      ) {
        setSelectedBuyer(response.user);
      }
    } catch (err) {
      setError(
        err.message ||
          "Failed to update buyer status"
      );
    } finally {
      setActionLoading("");
    }
  }

  async function handleDelete(buyer) {
    const confirmed = window.confirm(
      `Delete buyer "${buyer.name}" permanently?`
    );

    if (!confirmed) return;

    try {
      setActionLoading(
        `delete-${buyer.id}`
      );
      setError("");

      await deleteUser(buyer.id);

      setBuyers((current) =>
        current.filter(
          (item) =>
            String(item.id) !==
            String(buyer.id)
        )
      );

      if (
        selectedBuyer &&
        String(selectedBuyer.id) ===
          String(buyer.id)
      ) {
        setSelectedBuyer(null);
      }
    } catch (err) {
      setError(
        err.message ||
          "Failed to delete buyer"
      );
    } finally {
      setActionLoading("");
    }
  }

  return (
    <div className="admin-buyers-page space-y-6 pb-10">
{/* HEADER */}
<div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f6b3d] via-[#18864b] to-[#42a96c] p-6 text-white shadow-[0_18px_45px_rgba(24,134,75,0.18)] sm:p-8">
  <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
    <div className="min-w-0">
      <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold backdrop-blur-sm">
        <Users size={14} />
        ADMIN CONTROL
      </div>

      <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
        Manage Buyers
      </h1>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75 sm:text-[15px]">
        Monitor and manage registered buyers across the
        Smart Farmer platform.
      </p>
    </div>

    <button
      type="button"
      onClick={loadBuyers}
      disabled={loading}
      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-[#176b3d] shadow-lg transition hover:-translate-y-0.5 hover:bg-[#f5fff7] disabled:opacity-60"
    >
      {loading ? "Refreshing..." : "Refresh Data"}
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
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={<Users size={21} />}
          label="Total Buyers"
          value={stats.total}
        />

        <StatCard
          icon={<UserCheck size={21} />}
          label="Active Buyers"
          value={stats.active}
        />

        <StatCard
          icon={<UserX size={21} />}
          label="Inactive Buyers"
          value={stats.inactive}
        />
      </div>

      {/* FILTERS */}
<div className="sf-card p-4 sm:p-5">
  <div className="grid gap-3 md:grid-cols-[1fr_200px]">
    <div className="relative min-w-0">
      <Search
        size={19}
        className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[#8a978f]"
      />

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search buyer, business, email or location..."
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
  </div>
</div>

      {/* BUYERS */}
      <div className="sf-card overflow-hidden">
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="flex items-center gap-3 text-gray-500">
              <Loader2
                size={22}
                className="animate-spin"
              />

              Loading buyers...
            </div>
          </div>
        ) : filteredBuyers.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
            <Users
              size={44}
              className="text-gray-300"
            />

            <h3 className="mt-4 text-lg font-semibold text-gray-700">
              No buyers found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Try changing your search or
              status filter.
            </p>
          </div>
        ) : (
          <>
            {/* DESKTOP */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70 text-left text-xs uppercase tracking-wide text-gray-500">
                    <th className="px-5 py-4">
                      Buyer
                    </th>

                    <th className="px-5 py-4">
                      Contact
                    </th>

                    <th className="px-5 py-4">
                      Business
                    </th>

                    <th className="px-5 py-4">
                      Location
                    </th>

                    <th className="px-5 py-4">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredBuyers.map(
                    (buyer) => (
                      <tr
                        key={buyer.id}
                        className="border-b border-gray-100 last:border-0"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar
                              name={buyer.name}
                            />

                            <div>
                              <p className="font-semibold text-[#16351f]">
                                {buyer.name ||
                                  "Buyer"}
                              </p>

                              <p className="text-xs text-gray-400">
                                ID: {buyer.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="space-y-1">
                            {buyer.email && (
                              <p className="flex items-center gap-1.5 text-sm text-gray-600">
                                <Mail
                                  size={14}
                                />
                                {buyer.email}
                              </p>
                            )}

                            {buyer.phone && (
                              <p className="flex items-center gap-1.5 text-xs text-gray-400">
                                <Phone
                                  size={13}
                                />
                                {buyer.phone}
                              </p>
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-600">
                          {buyer.businessName ||
                            "—"}
                        </td>

                        <td className="px-5 py-4">
                          <p className="flex items-center gap-1.5 text-sm text-gray-600">
                            <MapPin
                              size={14}
                            />

                            {buyer.location ||
                              "—"}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge
                            active={
                              buyer.active !==
                              false
                            }
                          />
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <ActionButton
                              title="View"
                              onClick={() =>
                                setSelectedBuyer(
                                  buyer
                                )
                              }
                            >
                              <Eye size={17} />
                            </ActionButton>

                            <ActionButton
                              title={
                                buyer.active ===
                                false
                                  ? "Activate"
                                  : "Deactivate"
                              }
                              onClick={() =>
                                handleStatusChange(
                                  buyer
                                )
                              }
                              loading={
                                actionLoading ===
                                `status-${buyer.id}`
                              }
                            >
                              {buyer.active ===
                              false ? (
                                <UserCheck
                                  size={17}
                                />
                              ) : (
                                <UserX
                                  size={17}
                                />
                              )}
                            </ActionButton>

                            <ActionButton
                              title="Delete"
                              danger
                              onClick={() =>
                                handleDelete(
                                  buyer
                                )
                              }
                              loading={
                                actionLoading ===
                                `delete-${buyer.id}`
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

            {/* MOBILE */}
            <div className="grid gap-4 p-4 lg:hidden">
              {filteredBuyers.map(
                (buyer) => (
                  <div
                    key={buyer.id}
                    className="rounded-2xl border border-gray-100 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={buyer.name}
                        />

                        <div>
                          <h3 className="font-semibold text-[#16351f]">
                            {buyer.name ||
                              "Buyer"}
                          </h3>

                          <p className="text-xs text-gray-500">
                            {buyer.businessName ||
                              "Buyer Account"}
                          </p>
                        </div>
                      </div>

                      <StatusBadge
                        active={
                          buyer.active !==
                          false
                        }
                      />
                    </div>

                    <div className="mt-4 space-y-2">
                      {buyer.email && (
                        <Info
                          icon={
                            <Mail size={15} />
                          }
                          value={buyer.email}
                        />
                      )}

                      {buyer.phone && (
                        <Info
                          icon={
                            <Phone size={15} />
                          }
                          value={buyer.phone}
                        />
                      )}

                      {buyer.location && (
                        <Info
                          icon={
                            <MapPin size={15} />
                          }
                          value={buyer.location}
                        />
                      )}
                    </div>

                    <div className="mt-4 flex justify-end gap-2">
                      <ActionButton
                        title="View"
                        onClick={() =>
                          setSelectedBuyer(
                            buyer
                          )
                        }
                      >
                        <Eye size={16} />
                      </ActionButton>

                      <ActionButton
                        title={
                          buyer.active === false
                            ? "Activate"
                            : "Deactivate"
                        }
                        onClick={() =>
                          handleStatusChange(
                            buyer
                          )
                        }
                      >
                        {buyer.active === false ? (
                          <UserCheck
                            size={16}
                          />
                        ) : (
                          <UserX size={16} />
                        )}
                      </ActionButton>

                      <ActionButton
                        title="Delete"
                        danger
                        onClick={() =>
                          handleDelete(
                            buyer
                          )
                        }
                      >
                        <Trash2 size={16} />
                      </ActionButton>
                    </div>
                  </div>
                )
              )}
            </div>
          </>
        )}
      </div>

      {/* VIEW MODAL */}
      {selectedBuyer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedBuyer(null);
            }
          }}
        >
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4 sm:px-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#18864b]">
                  Buyer Details
                </p>

                <h2 className="mt-1 text-xl font-bold text-[#16351f]">
                  {selectedBuyer.name ||
                    "Buyer"}
                </h2>
              </div>

              <button
                onClick={() =>
                  setSelectedBuyer(null)
                }
                className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <div className="flex items-center gap-4">
                <Avatar
                  name={selectedBuyer.name}
                  large
                />

                <div>
                  <h3 className="text-lg font-bold text-[#16351f]">
                    {selectedBuyer.name ||
                      "Buyer"}
                  </h3>

                  <p className="text-sm text-gray-500">
                    {selectedBuyer.businessName ||
                      "Buyer Account"}
                  </p>

                  <div className="mt-2">
                    <StatusBadge
                      active={
                        selectedBuyer.active !==
                        false
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Detail
                  icon={<Mail size={16} />}
                  label="Email"
                  value={
                    selectedBuyer.email ||
                    "Not provided"
                  }
                />

                <Detail
                  icon={<Phone size={16} />}
                  label="Phone"
                  value={
                    selectedBuyer.phone ||
                    "Not provided"
                  }
                />

                <Detail
                  icon={<Building2 size={16} />}
                  label="Business"
                  value={
                    selectedBuyer.businessName ||
                    "Not provided"
                  }
                />

                <Detail
                  icon={<MapPin size={16} />}
                  label="Location"
                  value={
                    selectedBuyer.location ||
                    "Not provided"
                  }
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  onClick={() =>
                    handleStatusChange(
                      selectedBuyer
                    )
                  }
                  className="sf-button sf-button-secondary"
                >
                  {selectedBuyer.active ===
                  false ? (
                    <>
                      <UserCheck size={17} />
                      Activate Buyer
                    </>
                  ) : (
                    <>
                      <UserX size={17} />
                      Deactivate Buyer
                    </>
                  )}
                </button>

                <button
                  onClick={() =>
                    handleDelete(
                      selectedBuyer
                    )
                  }
                  className="flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={17} />
                  Delete Buyer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }) {
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

function Avatar({ name, large = false }) {
  const letter =
    name?.trim()?.charAt(0)?.toUpperCase() ||
    "B";

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-[#e8f5ec] font-bold text-[#18864b] ${
        large
          ? "h-16 w-16 text-xl"
          : "h-11 w-11 text-sm"
      }`}
    >
      {letter}
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

function Info({ icon, value }) {
  return (
    <p className="flex items-center gap-2 text-sm text-gray-600">
      <span className="text-gray-400">
        {icon}
      </span>

      <span className="truncate">
        {value}
      </span>
    </p>
  );
}

function Detail({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-gray-100 p-4">
      <div className="flex items-center gap-2 text-xs text-gray-400">
        {icon}
        {label}
      </div>

      <p className="mt-1 break-words text-sm font-semibold text-gray-700">
        {value}
      </p>
    </div>
  );
}