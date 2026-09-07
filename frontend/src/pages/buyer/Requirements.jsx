import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Package,
  Pencil,
  Trash2,
  Pause,
  Play,
  CheckCircle2,
  Clock3,
  MapPin,
  IndianRupee,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";

import DashboardLayout from "../../layouts/DashboardLayout";
import { getLoggedInUser } from "../../utils/auth";
import {
  getRequirements,
  createRequirement,
  updateRequirement,
  deleteRequirement,
} from "../../services/api";

const EMPTY_FORM = {
  cropName: "",
  quantity: "",
  targetPrice: "",
  location: "",
  requiredBy: "",
  quality: "Standard",
  notes: "",
};

export default function Requirements() {
  const buyer = getLoggedInUser("buyer");

  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedRequirement, setSelectedRequirement] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);

  const buyerId = buyer?.id || buyer?._id || "";

  // ==================== LOAD ====================

async function loadRequirements() {
  try {
    setLoading(true);
    setError("");

    const currentBuyerId =
      buyer?.id ||
      buyer?._id ||
      "";

    // 1. Backend data
    let apiRequirements = [];

    try {
      const response =
        await getRequirements(
          currentBuyerId
        );

      apiRequirements =
        Array.isArray(
          response?.requirements
        )
          ? response.requirements
          : [];
    } catch (error) {
      console.warn(
        "API requirements unavailable:",
        error
      );
    }

    // 2. Local data
    let localRequirements = [];

    try {
      localRequirements =
        JSON.parse(
          localStorage.getItem(
            "smartFarmerLocalRequirements"
          ) || "[]"
        );

      if (
        !Array.isArray(localRequirements)
      ) {
        localRequirements = [];
      }
    } catch {
      localRequirements = [];
    }

    // 3. Only current buyer's requirements
    const buyerLocalRequirements =
      localRequirements.filter(
        (item) =>
          String(
            item.buyerId || ""
          ) === String(currentBuyerId)
      );

    // 4. Merge backend + local
    const mergedRequirements = [
      ...apiRequirements,

      ...buyerLocalRequirements.filter(
        (localItem) =>
          !apiRequirements.some(
            (apiItem) =>
              String(apiItem.id) ===
              String(localItem.id)
          )
      ),
    ];

    setRequirements(
      mergedRequirements
    );
  } catch (err) {
    console.error(
      "Requirements load error:",
      err
    );

    setError(
      err.message ||
        "Unable to load requirements."
    );
  } finally {
    setLoading(false);
  }
}

  useEffect(() => {
    loadRequirements();
  }, []);

  // ==================== FILTER ====================

  const filteredRequirements = useMemo(() => {
    const query = search.trim().toLowerCase();

    return requirements.filter((item) => {
      const matchesSearch =
        !query ||
        item.cropName?.toLowerCase().includes(query) ||
        item.location?.toLowerCase().includes(query) ||
        item.quality?.toLowerCase().includes(query);

      const matchesFilter =
        filter === "all" ||
        item.status?.toLowerCase() === filter;

      return matchesSearch && matchesFilter;
    });
  }, [requirements, search, filter]);

  // ==================== STATS ====================

  const stats = useMemo(() => {
    const active = requirements.filter(
      (item) => item.status === "active"
    ).length;

    const paused = requirements.filter(
      (item) => item.status === "paused"
    ).length;

    const completed = requirements.filter(
      (item) => item.status === "completed"
    ).length;

    const totalQuantity = requirements.reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0
    );

    return {
      total: requirements.length,
      active,
      paused,
      completed,
      totalQuantity,
    };
  }, [requirements]);

  // ==================== FORM ====================

  function openCreateModal() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
    setModalOpen(true);
  }

  function openEditModal(item) {
    setEditingId(item.id);

    setForm({
      cropName: item.cropName || "",
      quantity: item.quantity || "",
      targetPrice: item.targetPrice || "",
      location: item.location || "",
      requiredBy: item.requiredBy
        ? item.requiredBy.slice(0, 10)
        : "",
      quality: item.quality || "Standard",
      notes: item.notes || "",
    });

    setError("");
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;

    setModalOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // ==================== CREATE / UPDATE ====================

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.cropName.trim()) {
      setError("Please enter the crop name.");
      return;
    }

    if (!form.quantity || Number(form.quantity) <= 0) {
      setError("Please enter a valid quantity.");
      return;
    }

    if (!form.targetPrice || Number(form.targetPrice) <= 0) {
      setError("Please enter a valid target price.");
      return;
    }

    if (!form.location.trim()) {
      setError("Please enter the delivery location.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        buyerId,
        buyerName: buyer?.name || "Buyer",
        cropName: form.cropName.trim(),
        quantity: Number(form.quantity),
        targetPrice: Number(form.targetPrice),
        location: form.location.trim(),
        requiredBy: form.requiredBy,
        quality: form.quality,
        notes: form.notes.trim(),
      };

      if (editingId) {
        await updateRequirement(editingId, payload);
      } else {
        await createRequirement(payload);
      }

      await loadRequirements();

      closeModal();
    } catch (err) {
      console.error("Requirement save error:", err);

      setError(
        err.message || "Unable to save requirement."
      );
    } finally {
      setSaving(false);
    }
  }

  // ==================== STATUS ====================

  async function toggleStatus(item) {
    try {
      setError("");

      const nextStatus =
        item.status === "active"
          ? "paused"
          : "active";

      await updateRequirement(item.id, {
        ...item,
        status: nextStatus,
      });

      await loadRequirements();
    } catch (err) {
      console.error("Status update error:", err);
      setError(
        err.message || "Unable to update requirement."
      );
    }
  }

  async function completeRequirement(item) {
    try {
      setError("");

      await updateRequirement(item.id, {
        ...item,
        status: "completed",
      });

      await loadRequirements();
      setSelectedRequirement(null);
    } catch (err) {
      console.error("Complete requirement error:", err);

      setError(
        err.message || "Unable to complete requirement."
      );
    }
  }

  // ==================== DELETE ====================

  async function handleDelete(item) {
    const confirmed = window.confirm(
      `Delete requirement for ${item.cropName}?`
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteRequirement(item.id);

      setRequirements((previous) =>
        previous.filter(
          (requirement) => requirement.id !== item.id
        )
      );

      setSelectedRequirement(null);
    } catch (err) {
      console.error("Requirement delete error:", err);

      setError(
        err.message || "Unable to delete requirement."
      );
    }
  }

  // ==================== UI HELPERS ====================

  function statusClass(status) {
    if (status === "active") {
      return "bg-emerald-50 text-emerald-700";
    }

    if (status === "paused") {
      return "bg-amber-50 text-amber-700";
    }

    return "bg-slate-100 text-slate-600";
  }

  return (
    <DashboardLayout>
      <div className="buyer-requirements-page space-y-6 pb-10">
       {/* HEADER */}
<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"> <div className="min-w-0">
  

    <h1 className="mt-1 text-2xl font-bold text-[#17351f] sm:text-3xl">
      Crop Requirements
    </h1>

    <p className="mt-1 text-sm text-gray-500">
      Create and manage your crop requirements for farmers.
    </p>
  </div>

  <button
    type="button"
    onClick={openCreateModal}
    className="sf-button sf-button-primary inline-flex items-center justify-center gap-2"
  >
    <Plus size={18} />
    New Requirement
  </button>
</div>

        {/* ERROR */}
        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0"
            />
            <span>{error}</span>
          </div>
        )}

        {/* STATS */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <Stat
            icon={<Package size={19} />}
            label="Total Requirements"
            value={stats.total}
          />

          <Stat
            icon={<CheckCircle2 size={19} />}
            label="Active"
            value={stats.active}
            positive
          />

          <Stat
            icon={<Pause size={19} />}
            label="Paused"
            value={stats.paused}
          />

          <Stat
            icon={<IndianRupee size={19} />}
            label="Total Quantity"
            value={`${stats.totalQuantity.toLocaleString()} kg`}
          />

        </section>

        {/* TOOLBAR */}
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
                  setSearch(event.target.value)
                }
                placeholder="Search crop, location or quality..."
                className="sf-input pl-11"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {[
                ["all", "All"],
                ["active", "Active"],
                ["paused", "Paused"],
                ["completed", "Completed"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-bold transition ${
                    filter === value
                      ? "bg-[#18864b] text-white"
                      : "bg-[#f1f5f0] text-slate-600 hover:bg-[#e7eee6]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

          </div>
        </section>

        {/* CONTENT */}
        {loading ? (
          <div className="sf-card flex min-h-[320px] items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-slate-500">
              <Loader2
                size={28}
                className="sf-spin text-[#18864b]"
              />
              <span className="text-sm font-semibold">
                Loading requirements...
              </span>
            </div>
          </div>
        ) : filteredRequirements.length === 0 ? (
          <div className="sf-card flex min-h-[360px] flex-col items-center justify-center px-6 text-center">

            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#edf6ed] text-[#18864b]">
              <Package size={30} />
            </div>

            <h2 className="text-lg font-extrabold text-slate-800">
              No requirements found
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              {search || filter !== "all"
                ? "Try changing your search or filter."
                : "Create your first procurement requirement to start receiving crop offers."}
            </p>

            {!search && filter === "all" && (
              <button
                onClick={openCreateModal}
                className="sf-button sf-button-primary mt-5"
              >
                <Plus size={18} />
                Create Requirement
              </button>
            )}

          </div>
        ) : (
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

            {filteredRequirements.map((item) => (
              <RequirementCard
                key={item.id}
                item={item}
                statusClass={statusClass}
                onView={() =>
                  setSelectedRequirement(item)
                }
                onEdit={() =>
                  openEditModal(item)
                }
                onDelete={() =>
                  handleDelete(item)
                }
                onToggle={() =>
                  toggleStatus(item)
                }
              />
            ))}

          </section>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5">
              <div>
                <h2 className="text-xl font-black text-slate-800">
                  {editingId
                    ? "Edit Requirement"
                    : "Create Requirement"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Add procurement details for farmers.
                </p>
              </div>

              <button
                onClick={closeModal}
                disabled={saving}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >

              <div className="grid gap-5 sm:grid-cols-2">

                <Field label="Crop Name">
                  <input
                    name="cropName"
                    value={form.cropName}
                    onChange={handleChange}
                    placeholder="e.g. Tomato"
                    className="sf-input"
                  />
                </Field>

                <Field label="Quantity (kg)">
                  <input
                    name="quantity"
                    type="number"
                    min="1"
                    value={form.quantity}
                    onChange={handleChange}
                    placeholder="e.g. 5000"
                    className="sf-input"
                  />
                </Field>

                <Field label="Target Price (₹/kg)">
                  <input
                    name="targetPrice"
                    type="number"
                    min="1"
                    step="0.01"
                    value={form.targetPrice}
                    onChange={handleChange}
                    placeholder="e.g. 30"
                    className="sf-input"
                  />
                </Field>

                <Field label="Required By">
                  <input
                    name="requiredBy"
                    type="date"
                    value={form.requiredBy}
                    onChange={handleChange}
                    className="sf-input"
                  />
                </Field>

                <Field label="Delivery Location">
                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="e.g. Vijayawada"
                    className="sf-input"
                  />
                </Field>

                <Field label="Quality">
                  <select
                    name="quality"
                    value={form.quality}
                    onChange={handleChange}
                    className="sf-input"
                  >
                    <option>Standard</option>
                    <option>Good</option>
                    <option>Premium</option>
                    <option>Grade A</option>
                    <option>Grade B</option>
                  </select>
                </Field>

              </div>

              <Field label="Additional Notes">
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Add quality, packaging or delivery requirements..."
                  className="sf-input resize-none"
                />
              </Field>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="sf-button sf-button-secondary"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="sf-button sf-button-primary"
                >
                  {saving ? (
                    <>
                      <Loader2
                        size={17}
                        className="sf-spin"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={17} />
                      {editingId
                        ? "Save Changes"
                        : "Create Requirement"}
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* DETAILS MODAL */}
      {selectedRequirement && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl bg-white shadow-2xl">

            <div className="flex items-start justify-between border-b border-slate-100 p-6">

              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded-lg bg-[#edf6ed] px-2.5 py-1 text-xs font-bold text-[#18864b]">
                    PROCUREMENT
                  </span>

                  <span
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold capitalize ${statusClass(
                      selectedRequirement.status
                    )}`}
                  >
                    {selectedRequirement.status}
                  </span>
                </div>

                <h2 className="text-2xl font-black text-slate-800">
                  {selectedRequirement.cropName}
                </h2>
              </div>

              <button
                onClick={() =>
                  setSelectedRequirement(null)
                }
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>

            </div>

            <div className="grid gap-3 p-6 sm:grid-cols-2">

              <Info
                icon={<Package size={17} />}
                label="Quantity"
                value={`${Number(
                  selectedRequirement.quantity || 0
                ).toLocaleString()} kg`}
              />

              <Info
                icon={<IndianRupee size={17} />}
                label="Target Price"
                value={`₹${selectedRequirement.targetPrice}/kg`}
              />

              <Info
                icon={<MapPin size={17} />}
                label="Location"
                value={
                  selectedRequirement.location ||
                  "Not specified"
                }
              />

              <Info
                icon={<Clock3 size={17} />}
                label="Required By"
                value={
                  selectedRequirement.requiredBy
                    ? new Date(
                        selectedRequirement.requiredBy
                      ).toLocaleDateString()
                    : "Flexible"
                }
              />

            </div>

            {selectedRequirement.notes && (
              <div className="mx-6 mb-5 rounded-2xl bg-[#f6f8f5] p-4">
                <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Notes
                </p>
                <p className="text-sm leading-6 text-slate-600">
                  {selectedRequirement.notes}
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-3 border-t border-slate-100 p-6">

              {selectedRequirement.status !==
                "completed" && (
                <>
                  <button
                    onClick={() => {
                      toggleStatus(
                        selectedRequirement
                      );
                      setSelectedRequirement(null);
                    }}
                    className="sf-button sf-button-secondary"
                  >
                    {selectedRequirement.status ===
                    "active" ? (
                      <>
                        <Pause size={17} />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play size={17} />
                        Activate
                      </>
                    )}
                  </button>

                  <button
                    onClick={() =>
                      openEditModal(
                        selectedRequirement
                      )
                    }
                    className="sf-button sf-button-secondary"
                  >
                    <Pencil size={17} />
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      completeRequirement(
                        selectedRequirement
                      )
                    }
                    className="sf-button sf-button-primary"
                  >
                    <CheckCircle2 size={17} />
                    Mark Completed
                  </button>
                </>
              )}

              <button
                onClick={() =>
                  handleDelete(selectedRequirement)
                }
                className="sf-button ml-auto bg-red-50 text-red-600 hover:bg-red-100"
              >
                <Trash2 size={17} />
                Delete
              </button>

            </div>

          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

// ==================== COMPONENTS ====================

function Stat({ icon, label, value, positive = false }) {
  return (
    <div className="group sf-card relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(24,134,75,0.10)]">
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#f0f9f2] transition-transform duration-300 group-hover:scale-125" />

      <div className="relative flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-[#718078]">
            {label}
          </p>

          <p className="mt-2 text-2xl font-black text-[#16351f]">
            {value}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm ${
            positive
              ? "bg-[#18864b] text-white"
              : "bg-[#e8f5ec] text-[#18864b]"
          }`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function RequirementCard({
  item,
  statusClass,
  onView,
  onEdit,
  onDelete,
  onToggle,
}) {
  return (
    <article className="sf-card sf-card-hover overflow-hidden">

      <div className="border-b border-slate-100 p-5">

        <div className="flex items-start justify-between gap-3">

          <div>
            <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf6ed] text-[#18864b]">
              <Package size={21} />
            </div>

            <h3 className="text-lg font-black text-slate-800">
              {item.cropName}
            </h3>

            <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
              <MapPin size={13} />
              {item.location || "Location not specified"}
            </p>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${statusClass(
              item.status
            )}`}
          >
            {item.status}
          </span>

        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">

          <Metric
            label="Quantity"
            value={`${Number(
              item.quantity || 0
            ).toLocaleString()} kg`}
          />

          <Metric
            label="Target Price"
            value={`₹${item.targetPrice}/kg`}
          />

        </div>
      </div>

      <div className="space-y-3 p-5">

        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">
            Quality
          </span>

          <span className="font-bold text-slate-700">
            {item.quality || "Standard"}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">
            Required by
          </span>

          <span className="font-bold text-slate-700">
            {item.requiredBy
              ? new Date(
                  item.requiredBy
                ).toLocaleDateString()
              : "Flexible"}
          </span>
        </div>

        <div className="flex gap-2 pt-2">

          <button
            onClick={onView}
            className="sf-button flex-1 bg-[#f1f5f0] text-[#285337] hover:bg-[#e5eee5]"
          >
            View
          </button>

          <button
            onClick={onEdit}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f1f5f0] text-slate-600 hover:bg-slate-100"
            title="Edit"
          >
            <Pencil size={17} />
          </button>

          <button
            onClick={onToggle}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f1f5f0] text-slate-600 hover:bg-slate-100"
            title={
              item.status === "active"
                ? "Pause"
                : "Activate"
            }
          >
            {item.status === "active" ? (
              <Pause size={17} />
            ) : (
              <Play size={17} />
            )}
          </button>

          <button
            onClick={onDelete}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 hover:bg-red-100"
            title="Delete"
          >
            <Trash2 size={17} />
          </button>

        </div>
      </div>
    </article>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-xl bg-[#f6f8f5] p-3">
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-black text-slate-800">
        {value}
      </p>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}

function Info({ icon, label, value }) {
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