import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Package,
  X,
  Thermometer,
  CalendarDays,
} from "lucide-react";

import {
  getInventory,
  createInventory,
  updateInventory,
  deleteInventory,
} from "../../services/api";

import { getLoggedInUser } from "../../utils/auth";
const LOCAL_INVENTORY_KEY = "smartFarmerLocalInventory";
export default function Inventory() {
  const user = getLoggedInUser("storage");

  const storageId =
    user?.id ||
    user?._id ||
    user?.storageId ||
    "storage-1";

  const storageName =
    user?.businessName ||
    user?.name ||
    "Storage";

  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [form, setForm] = useState({
    cropName: "",
    quantity: "",
    unit: "kg",
    temperature: "",
    entryDate: "",
    expectedExitDate: "",
  });

  // ==================== LOAD INVENTORY ====================

  async function loadInventory() {
  try {
    setLoading(true);

    const currentStorageId = String(storageId);
    const currentStorageName = String(storageName)
      .trim()
      .toLowerCase();

    let apiInventory = [];

    // Backend inventory
    try {
      const response = await getInventory(currentStorageId);

      apiInventory = Array.isArray(response?.inventory)
        ? response.inventory
        : [];
    } catch (error) {
      console.warn(
        "API inventory loading failed:",
        error
      );
    }

    // Local inventory
    let localInventory = [];

    try {
      const stored = localStorage.getItem(
        LOCAL_INVENTORY_KEY
      );

      localInventory = stored
        ? JSON.parse(stored)
        : [];

      if (!Array.isArray(localInventory)) {
        localInventory = [];
      }
    } catch (error) {
      console.warn(
        "Local inventory loading failed:",
        error
      );
    }

    // Match storage by ID OR storage name
    const matchingLocalInventory =
      localInventory.filter((item) => {
        const itemStorageId = String(
          item.storageId || ""
        );

        const itemStorageName = String(
          item.storageName || ""
        )
          .trim()
          .toLowerCase();

        return (
          itemStorageId === currentStorageId ||
          itemStorageName === currentStorageName
        );
      });

    // API + local merge
    const mergedInventory = [
      ...apiInventory,

      ...matchingLocalInventory.filter(
        (localItem) =>
          !apiInventory.some(
            (apiItem) =>
              String(apiItem.id) ===
              String(localItem.id)
          )
      ),
    ];

    setInventory(mergedInventory);
  } catch (error) {
    console.error(
      "Inventory loading error:",
      error
    );

    setInventory([]);
  } finally {
    setLoading(false);
  }
}

  useEffect(() => {
    loadInventory();
  }, []);

  // ==================== FORM ====================

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function openAddModal() {
    setEditingItem(null);

    setForm({
      cropName: "",
      quantity: "",
      unit: "kg",
      temperature: "",
      entryDate: "",
      expectedExitDate: "",
    });

    setShowModal(true);
  }

  function openEditModal(item) {
    setEditingItem(item);

    setForm({
      cropName: item.cropName || "",
      quantity: item.quantity || "",
      unit: item.unit || "kg",
      temperature: item.temperature || "",
      entryDate: item.entryDate || "",
      expectedExitDate: item.expectedExitDate || "",
    });

    setShowModal(true);
  }

  function closeModal() {
    if (saving) return;

    setShowModal(false);
    setEditingItem(null);
  }

  // ==================== SAVE ====================

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.cropName.trim()) {
      alert("Please enter crop name");
      return;
    }

    if (!form.quantity || Number(form.quantity) <= 0) {
      alert("Please enter a valid quantity");
      return;
    }

    try {
      setSaving(true);

    const payload = {
  storageId,
  storageName,
  cropName: form.cropName.trim(),
  quantity: Number(form.quantity),
  unit: form.unit,
  temperature: form.temperature,
  entryDate: form.entryDate,
  expectedExitDate: form.expectedExitDate,
};

let savedItem;

if (editingItem) {
  try {
    const response = await updateInventory(
      editingItem.id,
      payload
    );

    savedItem =
      response?.inventory ||
      response?.item ||
      {
        ...editingItem,
        ...payload,
      };
  } catch (apiError) {
    console.warn(
      "API update failed, updating locally:",
      apiError
    );

    savedItem = {
      ...editingItem,
      ...payload,
      updatedAt: new Date().toISOString(),
    };
  }
} else {
  try {
    const response = await createInventory(payload);

    savedItem =
      response?.inventory ||
      response?.item ||
      response?.data ||
      {
        ...payload,
        id: `LOCAL-INV-${Date.now()}`,
      };
  } catch (apiError) {
    console.warn(
      "API create failed, saving locally:",
      apiError
    );

    savedItem = {
      ...payload,
      id: `LOCAL-INV-${Date.now()}`,
      status: "stored",
      createdAt: new Date().toISOString(),
    };
  }
}

// Save permanently in browser
try {
  const existingInventory = JSON.parse(
    localStorage.getItem(
      LOCAL_INVENTORY_KEY
    ) || "[]"
  );

  const updatedInventory = [
    ...existingInventory.filter(
      (item) =>
        String(item.id) !==
        String(savedItem.id)
    ),
    {
      ...savedItem,
      storageId,
      storageName,
      status: savedItem.status || "stored",
    },
  ];

  localStorage.setItem(
    LOCAL_INVENTORY_KEY,
    JSON.stringify(updatedInventory)
  );
} catch (localError) {
  console.error(
    "Local inventory save error:",
    localError
  );
}

await loadInventory();
closeModal();
    } catch (error) {
      console.error("Inventory save error:", error);
      alert(error.message || "Failed to save inventory");
    } finally {
      setSaving(false);
    }
  }

  // ==================== DELETE ====================

async function handleDelete(id) {
  const confirmed = window.confirm(
    "Are you sure you want to delete this inventory item?"
  );

  if (!confirmed) return;

  try {
    try {
      await deleteInventory(id);
    } catch (apiError) {
      console.warn(
        "API delete failed, deleting locally:",
        apiError
      );
    }

    // Remove from UI
    setInventory((previous) =>
      previous.filter(
        (item) =>
          String(item.id) !== String(id)
      )
    );

    // Remove from localStorage
    try {
      const existingInventory = JSON.parse(
        localStorage.getItem(
          LOCAL_INVENTORY_KEY
        ) || "[]"
      );

      const updatedInventory =
        existingInventory.filter(
          (item) =>
            String(item.id) !== String(id)
        );

      localStorage.setItem(
        LOCAL_INVENTORY_KEY,
        JSON.stringify(updatedInventory)
      );
    } catch (localError) {
      console.error(
        "Local inventory delete error:",
        localError
      );
    }
  } catch (error) {
    console.error(
      "Inventory delete error:",
      error
    );

    alert(
      error.message ||
        "Failed to delete inventory"
    );
  }
}

  // ==================== FILTER ====================

  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const matchesSearch =
        item.cropName
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [inventory, search, statusFilter]);

  // ==================== STATS ====================

  const totalItems = inventory.length;

  const totalQuantity = inventory.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  const storedItems = inventory.filter(
    (item) => item.status === "stored"
  ).length;

  const exitedItems = inventory.filter(
    (item) => item.status === "exited"
  ).length;

  // ==================== UI ====================

  return (
    <div className="storage-inventory-page space-y-6 pb-10">
     {/* HEADER */}
<div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f6b3d] via-[#18864b] to-[#42a96c] p-6 text-white shadow-[0_18px_45px_rgba(24,134,75,0.18)] sm:p-8">
  <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
    <div className="min-w-0">
      <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold backdrop-blur-sm">
        <Package size={14} />
        STORAGE MANAGEMENT
      </div>

      <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
        Inventory
      </h1>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75 sm:text-[15px]">
        Manage crops currently stored in your facility and
        keep track of storage status.
      </p>
    </div>

    <button
      type="button"
      onClick={openAddModal}
      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-[#176b3d] shadow-lg transition hover:-translate-y-0.5 hover:bg-[#f5fff7]"
    >
      <Plus size={18} />
      Add Inventory
    </button>
  </div>

  <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/10" />
  <div className="pointer-events-none absolute -bottom-24 right-24 h-52 w-52 rounded-full bg-white/5" />
</div>
      {/* STATS */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          icon={<Package size={20} />}
          title="Total Items"
          value={totalItems}
        />

        <Stat
          icon={<Package size={20} />}
          title="Total Quantity"
          value={`${totalQuantity.toLocaleString()} kg`}
        />

        <Stat
          icon={<Package size={20} />}
          title="Currently Stored"
          value={storedItems}
        />

        <Stat
          icon={<Package size={20} />}
          title="Exited"
          value={exitedItems}
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
        type="text"
        placeholder="Search crop..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="sf-input w-full pl-11"
      />
    </div>

    <select
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value)}
      className="sf-input w-full"
    >
      <option value="all">All Status</option>
      <option value="stored">Stored</option>
      <option value="exited">Exited</option>
    </select>
  </div>
</div>
      {/* TABLE */}

      <div className="sf-card overflow-hidden">
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="text-sm text-gray-500">
              Loading inventory...
            </div>
          </div>
        ) : filteredInventory.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8f5ec] text-[#18864b]">
              <Package size={26} />
            </div>

            <h3 className="text-lg font-semibold text-[#17351f]">
              No inventory found
            </h3>

            <p className="mt-1 max-w-md text-sm text-gray-500">
              Add crops to your storage inventory to start
              managing them here.
            </p>

            <button
              onClick={openAddModal}
              className="mt-5 sf-button sf-button-primary"
            >
              <Plus size={17} />
              Add Inventory
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b bg-[#f8faf7] text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-5 py-4">Crop</th>
                  <th className="px-5 py-4">Quantity</th>
                  <th className="px-5 py-4">Temperature</th>
                  <th className="px-5 py-4">Entry Date</th>
                  <th className="px-5 py-4">Expected Exit</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {filteredInventory.map((item) => (
                  <tr
                    key={item.id}
                    className="transition hover:bg-[#fbfdf9]"
                  >
                    <td className="px-5 py-4">
                      <div className="font-semibold text-[#17351f]">
                        {item.cropName}
                      </div>

                      <div className="text-xs text-gray-400">
                        {item.id}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-700">
                      <span className="font-semibold">
                        {Number(item.quantity).toLocaleString()}
                      </span>{" "}
                      {item.unit || "kg"}
                    </td>

                    <td className="px-5 py-4">
                      <div className="inline-flex items-center gap-1.5 text-sm text-gray-700">
                        <Thermometer size={16} />
                        {item.temperature || "Not set"}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {item.entryDate || "—"}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {item.expectedExitDate || "—"}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={item.status} />
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition hover:border-[#18864b] hover:text-[#18864b]"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          onClick={() => handleDelete(item.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-100 text-red-500 transition hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl">
            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-[#17351f]">
                  {editingItem
                    ? "Edit Inventory"
                    : "Add Inventory"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Enter crop storage details.
                </p>
              </div>

              <button
                onClick={closeModal}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100"
              >
                <X size={19} />
              </button>
            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Crop Name">
                  <input
                    name="cropName"
                    value={form.cropName}
                    onChange={handleChange}
                    placeholder="e.g. Tomato"
                    className="sf-input w-full"
                    required
                  />
                </Field>

                <Field label="Quantity">
                  <input
                    name="quantity"
                    type="number"
                    min="1"
                    value={form.quantity}
                    onChange={handleChange}
                    placeholder="e.g. 1000"
                    className="sf-input w-full"
                    required
                  />
                </Field>

                <Field label="Unit">
                  <select
                    name="unit"
                    value={form.unit}
                    onChange={handleChange}
                    className="sf-input w-full"
                  >
                    <option value="kg">Kilograms (kg)</option>
                    <option value="ton">Ton</option>
                    <option value="quintal">Quintal</option>
                  </select>
                </Field>

                <Field label="Temperature">
                  <input
                    name="temperature"
                    value={form.temperature}
                    onChange={handleChange}
                    placeholder="e.g. 4°C"
                    className="sf-input w-full"
                  />
                </Field>

                <Field label="Entry Date">
                  <div className="relative">
                    <CalendarDays
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      name="entryDate"
                      type="date"
                      value={form.entryDate}
                      onChange={handleChange}
                      className="sf-input w-full pl-10"
                    />
                  </div>
                </Field>

                <Field label="Expected Exit Date">
                  <div className="relative">
                    <CalendarDays
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      name="expectedExitDate"
                      type="date"
                      value={form.expectedExitDate}
                      onChange={handleChange}
                      className="sf-input w-full pl-10"
                    />
                  </div>
                </Field>
              </div>

              <div className="flex justify-end gap-3 border-t pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  className="sf-button sf-button-secondary"
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="sf-button sf-button-primary"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingItem
                    ? "Update Inventory"
                    : "Add Inventory"}
                </button>
              </div>
            </form>
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

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-gray-700">
        {label}
      </span>

      {children}
    </label>
  );
}

function StatusBadge({ status }) {
  const isStored = status === "stored";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        isStored
          ? "bg-green-50 text-green-700"
          : "bg-gray-100 text-gray-600"
      }`}
    >
      {status || "stored"}
    </span>
  );
}