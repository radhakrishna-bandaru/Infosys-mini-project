import { useEffect, useMemo, useState } from "react";
import {
  Users as UsersIcon,
  Search,
  RefreshCw,
  UserCheck,
  UserX,
  Trash2,
  Eye,
  X,
  ShieldCheck,
} from "lucide-react";

import {
  getUsers,
  updateUserStatus,
  deleteUser as deleteAdminUser,
} from "../../services/api";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] =
    useState("all");

  const [selectedUser, setSelectedUser] =
    useState(null);

  const [updatingId, setUpdatingId] =
    useState(null);

  async function loadUsers() {
    try {
      setLoading(true);

      const response = await getUsers({
        role: roleFilter,
        search,
      });

      setUsers(response.users || []);
    } catch (error) {
      console.error(
        "Users loading error:",
        error
      );

      alert(
        error.message ||
          "Failed to load users"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  // ==================== SEARCH ====================

  const filteredUsers = useMemo(() => {
    const text = search.toLowerCase();

    if (!text) return users;

    return users.filter(
      (user) =>
        user.name
          ?.toLowerCase()
          .includes(text) ||
        user.email
          ?.toLowerCase()
          .includes(text) ||
        user.phone?.includes(search)
    );
  }, [users, search]);

  // ==================== STATS ====================

  const farmerCount = users.filter(
    (user) => user.role === "farmer"
  ).length;

  const storageCount = users.filter(
    (user) => user.role === "storage"
  ).length;

  const buyerCount = users.filter(
    (user) => user.role === "buyer"
  ).length;

  const activeCount = users.filter(
    (user) => user.active !== false
  ).length;

  // ==================== STATUS ====================

  async function toggleStatus(user) {
    try {
      setUpdatingId(user.id);

      await updateUserStatus(
        user.id,
        user.active === false
      );

      await loadUsers();

      if (
        selectedUser?.id === user.id
      ) {
        setSelectedUser((previous) =>
          previous
            ? {
                ...previous,
                active:
                  user.active === false,
              }
            : null
        );
      }
    } catch (error) {
      console.error(
        "Status update error:",
        error
      );

      alert(
        error.message ||
          "Failed to update user status"
      );
    } finally {
      setUpdatingId(null);
    }
  }

  // ==================== DELETE ====================

  async function handleDelete(user) {
    const confirmed = window.confirm(
      `Delete ${user.name || "this user"} permanently?`
    );

    if (!confirmed) return;

    try {
      setUpdatingId(user.id);

      await deleteAdminUser(user.id);

      setSelectedUser(null);

      await loadUsers();
    } catch (error) {
      console.error(
        "User delete error:",
        error
      );

      alert(
        error.message ||
          "Failed to delete user"
      );
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="admin-users-page space-y-6 pb-10">
     {/* HEADER */}
<div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f6b3d] via-[#18864b] to-[#42a96c] p-6 text-white shadow-[0_18px_45px_rgba(24,134,75,0.18)] sm:p-8">
  <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
    <div className="min-w-0">
      <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold backdrop-blur-sm">
        <UsersIcon size={14} />
        ADMINISTRATION
      </div>

      <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
        Users
      </h1>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75 sm:text-[15px]">
        Manage farmers, storage owners, buyers and administrators
        across the Smart Farmer platform.
      </p>
    </div>

    <button
      type="button"
      onClick={loadUsers}
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          icon={<UsersIcon size={20} />}
          title="Total Users"
          value={users.length}
        />

        <Stat
          icon={<UserCheck size={20} />}
          title="Active Users"
          value={activeCount}
        />

        <Stat
          icon={<UsersIcon size={20} />}
          title="Farmers"
          value={farmerCount}
        />

        <Stat
          icon={<ShieldCheck size={20} />}
          title="Buyers / Storage"
          value={buyerCount + storageCount}
        />
      </div>

     {/* FILTERS */}
<div className="sf-card p-4 sm:p-5">
  <div className="grid gap-3 lg:grid-cols-[1fr_220px_auto]">
    <div className="relative min-w-0">
      <Search
        size={19}
        className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[#8a978f]"
      />

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            loadUsers();
          }
        }}
        placeholder="Search by name, email or phone..."
        className="sf-input w-full pl-11"
      />
    </div>

    <select
      value={roleFilter}
      onChange={(e) => setRoleFilter(e.target.value)}
      className="sf-input w-full"
    >
      <option value="all">All Roles</option>
      <option value="farmer">Farmers</option>
      <option value="storage">Storage Owners</option>
      <option value="buyer">Buyers</option>
      <option value="admin">Admins</option>
    </select>

    <button
      type="button"
      onClick={loadUsers}
      className="sf-button sf-button-primary inline-flex items-center justify-center gap-2 px-6"
    >
      <Search size={17} />
      Search
    </button>
  </div>
</div>
      {/* TABLE */}

      <div className="sf-card overflow-hidden">
        {loading ? (
          <div className="flex min-h-[320px] items-center justify-center text-sm text-gray-500">
            Loading users...
          </div>
        ) : filteredUsers.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px]">
              <thead>
                <tr className="border-b bg-[#f8faf7] text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-5 py-4">
                    User
                  </th>

                  <th className="px-5 py-4">
                    Role
                  </th>

                  <th className="px-5 py-4">
                    Contact
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

              <tbody className="divide-y">
                {filteredUsers.map(
                  (user) => (
                    <tr
                      key={user.id}
                      className="transition hover:bg-[#fbfdf9]"
                    >
                      {/* USER */}

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e8f5ec] font-bold text-[#18864b]">
                            {user.name
                              ?.charAt(0)
                              ?.toUpperCase() ||
                              "U"}
                          </div>

                          <div>
                            <p className="font-semibold text-[#17351f]">
                              {user.name ||
                                "Unknown User"}
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                              {user.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* ROLE */}

                      <td className="px-5 py-4">
                        <RoleBadge
                          role={user.role}
                        />
                      </td>

                      {/* CONTACT */}

                      <td className="px-5 py-4">
                        <p className="text-sm text-gray-700">
                          {user.email ||
                            "No email"}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          {user.phone ||
                            "No phone"}
                        </p>
                      </td>

                      {/* LOCATION */}

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {user.location ||
                          "—"}
                      </td>

                      {/* STATUS */}

                      <td className="px-5 py-4">
                        <StatusBadge
                          active={
                            user.active !==
                            false
                          }
                        />
                      </td>

                      {/* ACTIONS */}

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() =>
                              setSelectedUser(
                                user
                              )
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:border-[#18864b] hover:text-[#18864b]"
                            title="View"
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            onClick={() =>
                              toggleStatus(user)
                            }
                            disabled={
                              updatingId ===
                              user.id
                            }
                            className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                              user.active ===
                              false
                                ? "bg-green-50 text-green-700"
                                : "bg-amber-50 text-amber-700"
                            } disabled:opacity-50`}
                            title={
                              user.active ===
                              false
                                ? "Activate"
                                : "Deactivate"
                            }
                          >
                            {user.active ===
                            false ? (
                              <UserCheck
                                size={16}
                              />
                            ) : (
                              <UserX
                                size={16}
                              />
                            )}
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(
                                user
                              )
                            }
                            disabled={
                              updatingId ===
                              user.id
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2
                              size={16}
                            />
                          </button>
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

      {/* USER DETAILS */}

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b p-6">
              <div>
                <h2 className="text-xl font-bold text-[#17351f]">
                  User Details
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  {selectedUser.id}
                </p>
              </div>

              <button
                onClick={() =>
                  setSelectedUser(null)
                }
                className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-gray-100"
              >
                <X size={19} />
              </button>
            </div>

            <div className="space-y-4 p-6">
              <Detail
                label="Name"
                value={
                  selectedUser.name ||
                  "—"
                }
              />

              <Detail
                label="Role"
                value={
                  selectedUser.role ||
                  "—"
                }
              />

              <Detail
                label="Email"
                value={
                  selectedUser.email ||
                  "—"
                }
              />

              <Detail
                label="Phone"
                value={
                  selectedUser.phone ||
                  "—"
                }
              />

              <Detail
                label="Location"
                value={
                  selectedUser.location ||
                  "—"
                }
              />

              <Detail
                label="Business / Farm"
                value={
                  selectedUser.businessName ||
                  selectedUser.farmName ||
                  "—"
                }
              />

              <Detail
                label="Status"
                value={
                  selectedUser.active ===
                  false
                    ? "Inactive"
                    : "Active"
                }
              />

              <Detail
                label="Created"
                value={
                  selectedUser.createdAt
                    ? new Date(
                        selectedUser.createdAt
                      ).toLocaleString()
                    : "—"
                }
              />
            </div>

            <div className="flex gap-3 border-t p-6">
              <button
                onClick={() =>
                  toggleStatus(
                    selectedUser
                  )
                }
                disabled={
                  updatingId ===
                  selectedUser.id
                }
                className="sf-button sf-button-secondary flex-1"
              >
                {selectedUser.active ===
                false
                  ? "Activate"
                  : "Deactivate"}
              </button>

              <button
                onClick={() =>
                  handleDelete(
                    selectedUser
                  )
                }
                disabled={
                  updatingId ===
                  selectedUser.id
                }
                className="sf-button flex-1 border border-red-200 bg-red-50 text-red-600"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== COMPONENTS ====================

function Stat({
  icon,
  title,
  value,
}) {
  return (
    <div className="group sf-card relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(24,134,75,0.10)]">
      <div className="absolute -right-5 -top-5 h-20 w-20 rounded-full bg-[#f0f9f2] transition-transform duration-300 group-hover:scale-125" />

      <div className="relative flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-[#718078]">
            {title}
          </p>

          <p className="mt-2 text-2xl font-black text-[#17351f]">
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

function RoleBadge({ role }) {
  const labels = {
    farmer: "Farmer",
    storage: "Storage Owner",
    buyer: "Buyer",
    admin: "Admin",
  };

  return (
    <span className="inline-flex rounded-full bg-[#eef7f0] px-3 py-1 text-xs font-semibold text-[#18864b]">
      {labels[role] || role}
    </span>
  );
}

function StatusBadge({ active }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        active
          ? "bg-green-50 text-green-700"
          : "bg-red-50 text-red-600"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function Detail({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-5 border-b border-gray-100 pb-3">
      <span className="text-sm text-gray-500">
        {label}
      </span>

      <span className="max-w-[65%] text-right text-sm font-semibold text-[#17351f]">
        {value}
      </span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8f5ec] text-[#18864b]">
        <UsersIcon size={27} />
      </div>

      <h3 className="mt-4 text-lg font-bold text-[#17351f]">
        No users found
      </h3>

      <p className="mt-1 text-sm text-gray-500">
        Try changing the search or role filter.
      </p>
    </div>
  );
}