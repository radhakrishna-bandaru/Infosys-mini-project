import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Package,
  MapPin,
  IndianRupee,
  CheckCircle2,
  Truck,
  Eye,
  X,
  ShoppingCart,
  Loader2,
  AlertCircle,
} from "lucide-react";

import DashboardLayout from "../../layouts/DashboardLayout";
import { getCrops, createOrder } from "../../services/api";
import { getLoggedInUser } from "../../utils/auth";

export default function AvailableCrops() {
  const buyer = getLoggedInUser("buyer");

  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [cropFilter, setCropFilter] = useState("all");
  const [sort, setSort] = useState("price-low");

  const [selectedCrop, setSelectedCrop] = useState(null);
  const [orderModal, setOrderModal] = useState(false);

  const [orderForm, setOrderForm] = useState({
    quantity: "",
    price: "",
    deliveryDate: "",
    notes: "",
  });

  const buyerId = buyer?.id || buyer?._id || "";

  // ==================== LOAD CROPS ====================

  async function loadCrops() {
    try {
      setLoading(true);
      setError("");

      const response = await getCrops();

      setCrops(
        (response.crops || []).filter(
          (crop) => crop.status !== "sold"
        )
      );
    } catch (err) {
      console.error("Available crops error:", err);

      setError(
        err.message || "Unable to load available crops."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCrops();
  }, []);

  // ==================== CROP TYPES ====================

  const cropTypes = useMemo(() => {
    return [
      "all",
      ...new Set(
        crops
          .map((crop) => crop.cropName)
          .filter(Boolean)
      ),
    ];
  }, [crops]);

  // ==================== FILTER ====================

  const filteredCrops = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = crops.filter((crop) => {
      const matchesSearch =
        !query ||
        crop.cropName?.toLowerCase().includes(query) ||
        crop.variety?.toLowerCase().includes(query) ||
        crop.location?.toLowerCase().includes(query) ||
        crop.farmerName?.toLowerCase().includes(query);

      const matchesCrop =
        cropFilter === "all" ||
        crop.cropName === cropFilter;

      return matchesSearch && matchesCrop;
    });

    return [...result].sort((a, b) => {
      const priceA = Number(a.expectedPrice || 0);
      const priceB = Number(b.expectedPrice || 0);

      const quantityA = Number(a.quantity || 0);
      const quantityB = Number(b.quantity || 0);

      if (sort === "price-low") {
        return priceA - priceB;
      }

      if (sort === "price-high") {
        return priceB - priceA;
      }

      if (sort === "quantity-high") {
        return quantityB - quantityA;
      }

      return (
        new Date(b.createdAt || 0) -
        new Date(a.createdAt || 0)
      );
    });
  }, [crops, search, cropFilter, sort]);

  // ==================== STATS ====================

  const stats = useMemo(() => {
    const totalQuantity = crops.reduce(
      (sum, crop) =>
        sum + Number(crop.quantity || 0),
      0
    );

    const prices = crops
      .map((crop) =>
        Number(crop.expectedPrice || 0)
      )
      .filter((price) => price > 0);

    const averagePrice = prices.length
      ? prices.reduce(
          (sum, price) => sum + price,
          0
        ) / prices.length
      : 0;

    return {
      listings: crops.length,
      quantity: totalQuantity,
      averagePrice,
      cropTypes: new Set(
        crops.map((crop) => crop.cropName)
      ).size,
    };
  }, [crops]);

  // ==================== OPEN ORDER ====================

  function openOrderModal(crop) {
    setSelectedCrop(crop);

    setOrderForm({
      quantity: Math.min(
        Number(crop.quantity || 0),
        100
      ),
      price: crop.expectedPrice || "",
      deliveryDate: "",
      notes: "",
    });

    setError("");
    setOrderModal(true);
  }

  function closeOrderModal() {
    if (actionLoading) return;

    setOrderModal(false);
    setSelectedCrop(null);
  }

  // ==================== CREATE ORDER ====================

  async function handleOrder(event) {
    event.preventDefault();

    if (!selectedCrop) return;

    const quantity = Number(orderForm.quantity);
    const price = Number(orderForm.price);

    if (!quantity || quantity <= 0) {
      setError("Enter a valid quantity.");
      return;
    }

    if (
      quantity >
      Number(selectedCrop.quantity || 0)
    ) {
      setError(
        `Only ${selectedCrop.quantity} kg is available.`
      );
      return;
    }

    if (!price || price <= 0) {
      setError("Enter a valid purchase price.");
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      await createOrder({
        buyerId,
        buyerName: buyer?.name || "",
        farmerId: selectedCrop.farmerId || "",
        farmerName: selectedCrop.farmerName || "",
        cropName: selectedCrop.cropName,
        quantity,
        price,
        location: selectedCrop.location || "",
        deliveryDate: orderForm.deliveryDate,
        notes: orderForm.notes.trim(),
      });

      setOrderModal(false);
      setSelectedCrop(null);

      alert(
        "Order placed successfully! The farmer can now process your order."
      );

      loadCrops();
    } catch (err) {
      console.error("Create order error:", err);

      setError(
        err.message || "Unable to place order."
      );
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="buyer-crops-page space-y-6 pb-10">

        {/* ==================== HEADER ==================== */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
          
            <h1 className="mt-1 text-2xl font-bold text-[#17351f] sm:text-3xl">
              Available Crops
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Discover farmer listings, compare prices and place purchase orders.
            </p>
          </div>

          <div className="inline-flex w-fit items-center rounded-xl bg-[#eef8f0] px-4 py-2 text-sm font-bold text-[#18864b]">
            {stats.listings} Listings
          </div>
        </div>

        {/* ==================== ERROR ==================== */}

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <span>{error}</span>
          </div>
        )}

        {/* ==================== STATS ==================== */}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <Stat
            icon={<Package size={19} />}
            label="Available Listings"
            value={stats.listings}
          />

          <Stat
            icon={<Package size={19} />}
            label="Total Supply"
            value={`${stats.quantity.toLocaleString()} kg`}
          />

          <Stat
            icon={<IndianRupee size={19} />}
            label="Average Price"
            value={`₹${stats.averagePrice.toFixed(1)}/kg`}
          />

          <Stat
            icon={<Truck size={19} />}
            label="Procurement Ready"
            value={stats.listings}
          />

        </section>

        {/* ==================== FILTERS ==================== */}

        <section className="sf-card p-4">

          <div className="flex flex-col gap-4">

            {/* SEARCH + SORT */}

            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">

              <div className="relative min-w-0">

                <Search
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search crop, variety, farmer or location..."
                  className="sf-input w-full pl-11 pr-4"
                />

              </div>

              <select
                value={sort}
                onChange={(event) =>
                  setSort(event.target.value)
                }
                className="sf-input w-full"
              >
                <option value="price-low">
                  Price: Low to High
                </option>

                <option value="price-high">
                  Price: High to Low
                </option>

                <option value="quantity-high">
                  Highest Quantity
                </option>

                <option value="newest">
                  Recently Added
                </option>
              </select>

            </div>

            {/* CROP FILTER */}

            <div className="flex gap-2 overflow-x-auto pb-1">

              {cropTypes.map((crop) => (
                <button
                  key={crop}
                  type="button"
                  onClick={() =>
                    setCropFilter(crop)
                  }
                  className={`shrink-0 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-bold capitalize transition ${
                    cropFilter === crop
                      ? "bg-[#18864b] text-white shadow-sm"
                      : "bg-[#f1f5f0] text-slate-600 hover:bg-[#e7eee6]"
                  }`}
                >
                  {crop === "all"
                    ? "All Crops"
                    : crop}
                </button>
              ))}

            </div>

          </div>

        </section>

        {/* ==================== CROPS ==================== */}

        {loading ? (
          <div className="sf-card flex min-h-[340px] items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-slate-500">

              <Loader2
                size={28}
                className="sf-spin text-[#18864b]"
              />

              <span className="text-sm font-semibold">
                Loading available crops...
              </span>

            </div>
          </div>
        ) : filteredCrops.length === 0 ? (
          <EmptyState />
        ) : (
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

            {filteredCrops.map((crop) => (
              <CropCard
                key={crop.id}
                crop={crop}
                onView={() =>
                  setSelectedCrop(crop)
                }
                onOrder={() =>
                  openOrderModal(crop)
                }
              />
            ))}

          </section>
        )}

      </div>

      {/* ==================== DETAILS MODAL ==================== */}

      {selectedCrop && !orderModal && (
        <DetailsModal
          crop={selectedCrop}
          onClose={() =>
            setSelectedCrop(null)
          }
          onOrder={() =>
            openOrderModal(selectedCrop)
          }
        />
      )}

      {/* ==================== ORDER MODAL ==================== */}

      {orderModal && selectedCrop && (
        <OrderModal
          crop={selectedCrop}
          form={orderForm}
          setForm={setOrderForm}
          loading={actionLoading}
          error={error}
          onClose={closeOrderModal}
          onSubmit={handleOrder}
        />
      )}
    </DashboardLayout>
  );
}


/* =====================================================
   STAT
===================================================== */

function Stat({ icon, label, value }) {
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

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e8f5ec] text-[#18864b] shadow-sm transition-all duration-300 group-hover:bg-[#18864b] group-hover:text-white">
          {icon}
        </div>

      </div>
    </div>
  );
}


/* =====================================================
   CROP CARD
===================================================== */

function CropCard({
  crop,
  onView,
  onOrder,
}) {
  return (
    <article className="sf-card sf-card-hover overflow-hidden">

      <div className="border-b border-slate-100 p-5">

        <div className="flex items-start justify-between gap-3">

          <div className="min-w-0">

            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf6ed] text-[#18864b]">
              <Package size={21} />
            </div>

            <h2 className="text-lg font-black text-slate-800">
              {crop.cropName}
            </h2>

            {crop.variety && (
              <p className="mt-1 text-xs font-semibold text-slate-500">
                {crop.variety}
              </p>
            )}

          </div>

          <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
            Available
          </span>

        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">

          <Metric
            label="Quantity"
            value={`${Number(
              crop.quantity || 0
            ).toLocaleString()} kg`}
          />

          <Metric
            label="Expected Price"
            value={`₹${Number(
              crop.expectedPrice || 0
            )}/kg`}
          />

        </div>

      </div>

      <div className="space-y-3 p-5">

        <div className="flex items-center gap-2 text-sm text-slate-500">
          <MapPin
            size={15}
            className="shrink-0 text-[#18864b]"
          />

          <span className="min-w-0 break-words">
            {crop.location || "Location not specified"}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 text-sm">

          <span className="text-slate-500">
            Farmer
          </span>

          <span className="min-w-0 text-right font-bold text-slate-700">
            {crop.farmerName || "Farmer"}
          </span>

        </div>

        <div className="flex gap-2 pt-2">

          <button
            type="button"
            onClick={onView}
            className="sf-button flex-1 bg-[#f1f5f0] text-[#285337] hover:bg-[#e5eee5]"
          >
            <Eye size={16} />
            Details
          </button>

          <button
            type="button"
            onClick={onOrder}
            className="sf-button sf-button-primary flex-1"
          >
            <ShoppingCart size={16} />
            Buy
          </button>

        </div>

      </div>

    </article>
  );
}


/* =====================================================
   METRIC
===================================================== */

function Metric({ label, value }) {
  return (
    <div className="rounded-xl bg-[#f6f8f5] p-3">

      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-black text-slate-800">
        {value}
      </p>

    </div>
  );
}


/* =====================================================
   DETAILS MODAL
===================================================== */

function DetailsModal({
  crop,
  onClose,
  onOrder,
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">

      <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white shadow-2xl">

        <div className="flex items-start justify-between border-b border-slate-100 p-6">

          <div className="min-w-0">

            <span className="mb-2 inline-flex rounded-lg bg-[#edf6ed] px-2.5 py-1 text-xs font-bold text-[#18864b]">
              FARMER LISTING
            </span>

            <h2 className="text-2xl font-black text-slate-800">
              {crop.cropName}
            </h2>

            {crop.variety && (
              <p className="mt-1 text-sm text-slate-500">
                {crop.variety}
              </p>
            )}

          </div>

          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-xl p-2 text-slate-400 hover:bg-slate-100"
          >
            <X size={20} />
          </button>

        </div>

        <div className="grid gap-3 p-6 sm:grid-cols-2">

          <Info
            icon={<Package size={17} />}
            label="Available Quantity"
            value={`${Number(
              crop.quantity || 0
            ).toLocaleString()} kg`}
          />

          <Info
            icon={<IndianRupee size={17} />}
            label="Expected Price"
            value={`₹${Number(
              crop.expectedPrice || 0
            )}/kg`}
          />

          <Info
            icon={<MapPin size={17} />}
            label="Location"
            value={
              crop.location || "Not specified"
            }
          />

          <Info
            icon={<CheckCircle2 size={17} />}
            label="Status"
            value={crop.status || "Available"}
          />

        </div>

        <div className="border-t border-slate-100 p-6">

          <div className="mb-5">

            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Farmer
            </p>

            <p className="mt-1 font-extrabold text-slate-800">
              {crop.farmerName || "Farmer"}
            </p>

          </div>

          <button
            type="button"
            onClick={onOrder}
            className="sf-button sf-button-primary w-full"
          >
            <ShoppingCart size={18} />
            Place Purchase Order
          </button>

        </div>

      </div>
    </div>
  );
}


/* =====================================================
   ORDER MODAL
===================================================== */

function OrderModal({
  crop,
  form,
  setForm,
  loading,
  error,
  onClose,
  onSubmit,
}) {
  function update(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">

      <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white shadow-2xl">

        <div className="flex items-start justify-between border-b border-slate-100 p-6">

          <div className="min-w-0">

            <span className="mb-2 inline-flex rounded-lg bg-[#edf6ed] px-2.5 py-1 text-xs font-bold text-[#18864b]">
              NEW ORDER
            </span>

            <h2 className="text-xl font-black text-slate-800">
              Buy {crop.cropName}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Farmer: {crop.farmerName || "Farmer"}
            </p>

          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="shrink-0 rounded-xl p-2 text-slate-400 hover:bg-slate-100"
          >
            <X size={20} />
          </button>

        </div>

        {error && (
          <div className="mx-6 mt-5 flex gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle
              size={17}
              className="shrink-0"
            />

            <span>{error}</span>
          </div>
        )}

        <form
          onSubmit={onSubmit}
          className="space-y-5 p-6"
        >

          <div className="rounded-2xl bg-[#f6f8f5] p-4">

            <div className="flex justify-between gap-4">
              <span className="text-sm text-slate-500">
                Available
              </span>

              <span className="font-black text-slate-800">
                {Number(
                  crop.quantity || 0
                ).toLocaleString()} kg
              </span>
            </div>

            <div className="mt-2 flex justify-between gap-4">
              <span className="text-sm text-slate-500">
                Listed Price
              </span>

              <span className="font-black text-[#18864b]">
                ₹{crop.expectedPrice}/kg
              </span>
            </div>

          </div>

          <Field label="Purchase Quantity (kg)">
            <input
              type="number"
              min="1"
              max={crop.quantity}
              value={form.quantity}
              onChange={(event) =>
                update(
                  "quantity",
                  event.target.value
                )
              }
              className="sf-input w-full"
            />
          </Field>

          <Field label="Purchase Price (₹/kg)">
            <input
              type="number"
              min="1"
              step="0.01"
              value={form.price}
              onChange={(event) =>
                update(
                  "price",
                  event.target.value
                )
              }
              className="sf-input w-full"
            />
          </Field>

          <Field label="Preferred Delivery Date">
            <input
              type="date"
              value={form.deliveryDate}
              onChange={(event) =>
                update(
                  "deliveryDate",
                  event.target.value
                )
              }
              className="sf-input w-full"
            />
          </Field>

          <Field label="Notes">
            <textarea
              rows={3}
              value={form.notes}
              onChange={(event) =>
                update(
                  "notes",
                  event.target.value
                )
              }
              placeholder="Add delivery or quality instructions..."
              className="sf-input w-full resize-none"
            />
          </Field>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="sf-button sf-button-secondary"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="sf-button sf-button-primary"
            >
              {loading ? (
                <>
                  <Loader2
                    size={17}
                    className="sf-spin"
                  />
                  Placing Order...
                </>
              ) : (
                <>
                  <ShoppingCart size={17} />
                  Place Order
                </>
              )}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
}


/* =====================================================
   EMPTY
===================================================== */

function EmptyState() {
  return (
    <div className="sf-card flex min-h-[350px] flex-col items-center justify-center px-6 text-center">

      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#edf6ed] text-[#18864b]">
        <Package size={30} />
      </div>

      <h2 className="text-lg font-extrabold text-slate-800">
        No available crops
      </h2>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        There are no farmer crop listings matching
        your current search or filters.
      </p>

    </div>
  );
}


/* =====================================================
   INFO
===================================================== */

function Info({ icon, label, value }) {
  return (
    <div className="rounded-2xl bg-[#f6f8f5] p-4">

      <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
        <span className="text-[#18864b]">
          {icon}
        </span>
        {label}
      </div>

      <p className="break-words font-extrabold text-slate-800">
        {value}
      </p>

    </div>
  );
}


/* =====================================================
   FIELD
===================================================== */

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