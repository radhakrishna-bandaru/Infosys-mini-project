import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Edit3,
  IndianRupee,
  Leaf,
  Loader2,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import DashboardLayout from "../../layouts/DashboardLayout";
import { createCrop, deleteCrop, getCrops, updateCrop } from "../../services/api";
import { getLoggedInUser } from "../../utils/auth";
const LOCAL_CROPS_KEY = "smartFarmerLocalCrops";
const emptyForm = {
  cropName: "",
  variety: "",
  quantity: "",
  unit: "kg",
  expectedPrice: "",
  harvestDate: "",
  location: "",
};

const demoCrops = [
  {
    id: "demo-1",
    farmerId: "demo",
    cropName: "Tomato",
    variety: "Hybrid",
    quantity: 1200,
    unit: "kg",
    expectedPrice: 28,
    harvestDate: "2026-09-20",
    location: "Vijayawada",
    status: "active",
  },
  {
    id: "demo-2",
    farmerId: "demo",
    cropName: "Chilli",
    variety: "Guntur Sannam",
    quantity: 800,
    unit: "kg",
    expectedPrice: 145,
    harvestDate: "2026-10-05",
    location: "Guntur",
    status: "active",
  },
];

export default function MyCrops() {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingCrop, setEditingCrop] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const user = getLoggedInUser("farmer");

const loadCrops = async () => {
  try {
    setLoading(true);
    setError("");

    const farmerId = user?.id || user?._id;

    let localCrops = [];

    try {
      localCrops = JSON.parse(
        localStorage.getItem(LOCAL_CROPS_KEY) || "[]"
      );
    } catch {
      localCrops = [];
    }

    const farmerLocalCrops = localCrops.filter(
      (crop) => String(crop.farmerId) === String(farmerId)
    );

    try {
      const response = await getCrops();

      const apiCrops = (response.crops || []).filter(
        (crop) => String(crop.farmerId) === String(farmerId)
      );

      const merged = [
        ...apiCrops,
        ...farmerLocalCrops.filter(
          (local) =>
            !apiCrops.some(
              (api) => String(api.id) === String(local.id)
            )
        ),
      ];

      setCrops(
        merged.length > 0
          ? merged
          : farmerId
          ? []
          : demoCrops
      );
    } catch (err) {
      console.error("API crop loading error:", err);

      setCrops(
        farmerLocalCrops.length > 0
          ? farmerLocalCrops
          : farmerId
          ? []
          : demoCrops
      );
    }
  } catch (err) {
    console.error("Crop loading error:", err);
    setError("Unable to load crops.");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    loadCrops();
  }, []);

  const filteredCrops = useMemo(() => {
    return crops.filter((crop) => {
      const matchesSearch =
        crop.cropName
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        crop.variety
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        crop.location
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const matchesFilter =
        filter === "all" ||
        crop.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [crops, search, filter]);

  const totalQuantity = crops.reduce(
    (sum, crop) => sum + Number(crop.quantity || 0),
    0
  );

  const estimatedValue = crops.reduce(
    (sum, crop) =>
      sum +
      Number(crop.quantity || 0) *
        Number(crop.expectedPrice || 0),
    0
  );

  const openAddModal = () => {
    setEditingCrop(null);
    setForm(emptyForm);
    setError("");
    setShowModal(true);
  };

  const openEditModal = (crop) => {
    setEditingCrop(crop);

    setForm({
      cropName: crop.cropName || "",
      variety: crop.variety || "",
      quantity: crop.quantity || "",
      unit: crop.unit || "kg",
      expectedPrice: crop.expectedPrice || "",
      harvestDate: crop.harvestDate || "",
      location: crop.location || "",
    });

    setError("");
    setShowModal(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.cropName.trim()) {
      setError("Please enter crop name.");
      return;
    }

    if (!form.quantity || Number(form.quantity) <= 0) {
      setError("Please enter a valid quantity.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
  farmerId: user?.id || user?._id,
  farmerName: user?.name || "Farmer",
  cropName: form.cropName.trim(),
  variety: form.variety.trim(),
  quantity: Number(form.quantity),
  unit: form.unit,
  expectedPrice: Number(form.expectedPrice || 0),
  harvestDate: form.harvestDate,
  location: form.location.trim(),
};

      if (editingCrop) {
        const response = await updateCrop(
          editingCrop.id,
          payload
        );

        setCrops((previous) =>
          previous.map((crop) =>
            crop.id === editingCrop.id
              ? response.crop
              : crop
          )
        );
      } else {
       let savedCrop;

try {
  const response = await createCrop(payload);
  savedCrop = response.crop;
} catch (apiError) {
  console.warn("API save failed, saving locally:", apiError);

  savedCrop = {
    ...payload,
    id: `LOCAL-CROP-${Date.now()}`,
    status: "active",
    createdAt: new Date().toISOString(),
  };
}

setCrops((previous) => [...previous, savedCrop]);

const existingLocalCrops = JSON.parse(
  localStorage.getItem(LOCAL_CROPS_KEY) || "[]"
);

localStorage.setItem(
  LOCAL_CROPS_KEY,
  JSON.stringify([
    ...existingLocalCrops.filter(
      (crop) => String(crop.id) !== String(savedCrop.id)
    ),
    savedCrop,
  ])
);
      }

      setShowModal(false);
      setEditingCrop(null);
      setForm(emptyForm);
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to save crop. Check backend."
      );
    } finally {
      setSaving(false);
    }
  };

const handleDelete = async (id) => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this crop?"
  );

  if (!confirmed) return;

  try {
    try {
      await deleteCrop(id);
    } catch (apiError) {
      console.warn("API delete failed, deleting locally:", apiError);
    }

    setCrops((previous) =>
      previous.filter((crop) => String(crop.id) !== String(id))
    );

    const existingLocalCrops = JSON.parse(
      localStorage.getItem(LOCAL_CROPS_KEY) || "[]"
    );

    localStorage.setItem(
      LOCAL_CROPS_KEY,
      JSON.stringify(
        existingLocalCrops.filter(
          (crop) => String(crop.id) !== String(id)
        )
      )
    );
  } catch (err) {
    console.error(err);
    setError("Unable to delete crop.");
  }
};
  return (
    <DashboardLayout>
      <div className="my-crops-page space-y-6">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            

            <h1 className="sf-section-title text-3xl sm:text-4xl">
              My Crops
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-[#6d796f]">
              Manage your crops, expected prices, harvest dates
              and quantities from one place.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="sf-button sf-button-primary"
          >
            <Plus size={18} />
            Add Crop
          </button>
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
            icon={<Leaf size={20} />}
            label="Total Crops"
            value={crops.length}
          />

          <Stat
            icon={<IndianRupee size={20} />}
            label="Estimated Value"
            value={`₹${estimatedValue.toLocaleString("en-IN")}`}
          />

          <Stat
            icon={<span className="text-lg font-bold">KG</span>}
            label="Total Quantity"
            value={`${totalQuantity.toLocaleString("en-IN")} kg`}
          />

          <Stat
            icon={<CalendarDays size={20} />}
            label="Active Crops"
            value={
              crops.filter(
                (crop) => crop.status === "active"
              ).length
            }
          />

        </div>

        {/* Controls */}
        <div className="sf-card p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">

            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8a948d]"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search crop, variety or location..."
                className="sf-input pl-11"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto">
              {["all", "active", "sold"].map((item) => (
                <button
                  key={item}
                  onClick={() => setFilter(item)}
                  className={`rounded-xl px-4 py-2.5 text-sm font-bold capitalize ${
                    filter === item
                      ? "bg-[#18864b] text-white"
                      : "bg-[#f0f5ef] text-[#526056]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* Crop list */}
        {loading ? (
          <div className="sf-card flex min-h-[280px] items-center justify-center">
            <div className="flex items-center gap-3 text-[#18864b]">
              <Loader2
                size={24}
                className="sf-spin"
              />
              <span className="font-semibold">
                Loading your crops...
              </span>
            </div>
          </div>
        ) : filteredCrops.length === 0 ? (
          <div className="sf-card flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#edf7ee] text-[#18864b]">
              <Leaf size={30} />
            </div>

            <h3 className="text-xl font-extrabold text-[#17221b]">
              No crops found
            </h3>

            <p className="mt-2 max-w-md text-sm text-[#6d796f]">
              Add your first crop to start tracking quantity,
              pricing and harvest information.
            </p>

            <button
              onClick={openAddModal}
              className="sf-button sf-button-primary mt-5"
            >
              <Plus size={18} />
              Add Crop
            </button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">

            {filteredCrops.map((crop) => (
              <CropCard
                key={crop.id}
                crop={crop}
                onEdit={() => openEditModal(crop)}
                onDelete={() =>
                  handleDelete(crop.id)
                }
              />
            ))}

          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">

              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e6ece5] bg-white px-6 py-5">
                <div>
                  <h2 className="text-xl font-extrabold text-[#17221b]">
                    {editingCrop
                      ? "Edit Crop"
                      : "Add New Crop"}
                  </h2>

                  <p className="mt-1 text-sm text-[#6d796f]">
                    Enter your crop details below.
                  </p>
                </div>

                <button
                  onClick={() => setShowModal(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f2f5f1] text-[#536057]"
                >
                  <X size={19} />
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-5 p-6"
              >

                <div className="grid gap-4 sm:grid-cols-2">

                  <Field label="Crop Name *">
                    <input
                      name="cropName"
                      value={form.cropName}
                      onChange={handleChange}
                      placeholder="Tomato"
                      className="sf-input"
                    />
                  </Field>

                  <Field label="Variety">
                    <input
                      name="variety"
                      value={form.variety}
                      onChange={handleChange}
                      placeholder="Hybrid"
                      className="sf-input"
                    />
                  </Field>

                  <Field label="Quantity *">
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

                  <Field label="Unit">
                    <select
                      name="unit"
                      value={form.unit}
                      onChange={handleChange}
                      className="sf-input"
                    >
                      <option value="kg">Kilograms</option>
                      <option value="quintal">Quintal</option>
                      <option value="ton">Ton</option>
                    </select>
                  </Field>

                  <Field label="Expected Price / Unit">
                    <input
                      name="expectedPrice"
                      type="number"
                      min="0"
                      value={form.expectedPrice}
                      onChange={handleChange}
                      placeholder="28"
                      className="sf-input"
                    />
                  </Field>

                  <Field label="Expected Harvest Date">
                    <input
                      name="harvestDate"
                      type="date"
                      value={form.harvestDate}
                      onChange={handleChange}
                      className="sf-input"
                    />
                  </Field>

                </div>

                <Field label="Location">
                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="Vijayawada"
                    className="sf-input"
                  />
                </Field>

                {error && (
                  <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
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
                          size={18}
                          className="sf-spin"
                        />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Plus size={18} />
                        {editingCrop
                          ? "Update Crop"
                          : "Save Crop"}
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div className="sf-card sf-card-hover p-5">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#edf7ee] text-[#18864b]">
        {icon}
      </div>

      <p className="text-sm font-medium text-[#6d796f]">
        {label}
      </p>

      <p className="mt-1 text-2xl font-extrabold text-[#17221b]">
        {value}
      </p>
    </div>
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

function CropCard({ crop, onEdit, onDelete }) {
  const value =
    Number(crop.quantity || 0) *
    Number(crop.expectedPrice || 0);

  return (
    <div className="sf-card sf-card-hover overflow-hidden">

      <div className="flex items-start justify-between border-b border-[#edf1ec] p-5">
        <div className="flex items-center gap-3">

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf6eb] text-[#18864b]">
            <Leaf size={23} />
          </div>

          <div>
            <h3 className="text-lg font-extrabold text-[#17221b]">
              {crop.cropName}
            </h3>

            <p className="text-sm text-[#718076]">
              {crop.variety || "Standard variety"}
            </p>
          </div>

        </div>

        <span className="rounded-full bg-[#eaf7ed] px-3 py-1 text-xs font-bold capitalize text-[#18864b]">
          {crop.status || "active"}
        </span>
      </div>

      <div className="space-y-4 p-5">

        <div className="grid grid-cols-2 gap-3">

          <Info
            label="Quantity"
            value={`${Number(crop.quantity).toLocaleString("en-IN")} ${crop.unit || "kg"}`}
          />

          <Info
            label="Expected Price"
            value={`₹${Number(crop.expectedPrice || 0).toLocaleString("en-IN")}`}
          />

          <Info
            label="Est. Value"
            value={`₹${value.toLocaleString("en-IN")}`}
          />

          <Info
            label="Harvest"
            value={
              crop.harvestDate
                ? new Date(
                    crop.harvestDate
                  ).toLocaleDateString("en-IN")
                : "Not set"
            }
          />

        </div>

        {crop.location && (
          <div className="rounded-xl bg-[#f5f8f4] px-3 py-2 text-sm text-[#637066]">
            📍 {crop.location}
          </div>
        )}

        <div className="flex gap-2 border-t border-[#edf1ec] pt-4">

          <button
            onClick={onEdit}
            className="sf-button sf-button-secondary flex-1"
          >
            <Edit3 size={16} />
            Edit
          </button>

          <button
            onClick={onDelete}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600 transition hover:bg-red-100"
            aria-label="Delete crop"
          >
            <Trash2 size={17} />
          </button>

        </div>

      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-xl bg-[#f7f9f6] p-3">
      <p className="text-xs font-semibold text-[#8a948d]">
        {label}
      </p>

      <p className="mt-1 text-sm font-extrabold text-[#26342b]">
        {value}
      </p>
    </div>
  );
}