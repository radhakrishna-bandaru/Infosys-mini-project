import { useEffect,useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  IndianRupee,
  MapPin,
  Package,
  Search,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";

import DashboardLayout from "../../layouts/DashboardLayout";
import { getStorage, setStorage } from "../../utils/storage";
import { getRequirements, createOrder } from "../../services/api";
const buyersData = [
  {
    id: 1,
    name: "FreshMart Buyers",
    company: "FreshMart Foods Pvt. Ltd.",
    location: "Vijayawada",
    distance: 21,
    crop: "Tomato",
    requirement: 500,
    price: 58,
    demand: "High",
    verified: true,
    rating: 4.8,
    payment: "Fast payment",
  },
  {
    id: 2,
    name: "AgroTrade Foods",
    company: "AgroTrade Foods",
    location: "Guntur",
    distance: 39,
    crop: "Tomato",
    requirement: 800,
    price: 56,
    demand: "High",
    verified: true,
    rating: 4.7,
    payment: "3–5 days",
  },
  {
    id: 3,
    name: "GreenBasket Wholesale",
    company: "GreenBasket Wholesale",
    location: "Mangalagiri",
    distance: 34,
    crop: "Onion",
    requirement: 1000,
    price: 38,
    demand: "High",
    verified: true,
    rating: 4.6,
    payment: "Fast payment",
  },
  {
    id: 4,
    name: "RuralFresh Traders",
    company: "RuralFresh Traders",
    location: "Tenali",
    distance: 47,
    crop: "Potato",
    requirement: 750,
    price: 33,
    demand: "Medium",
    verified: false,
    rating: 4.4,
    payment: "5–7 days",
  },
  {
    id: 5,
    name: "SpiceLink Exports",
    company: "SpiceLink Exports",
    location: "Guntur",
    distance: 43,
    crop: "Chilli",
    requirement: 400,
    price: 128,
    demand: "High",
    verified: true,
    rating: 4.9,
    payment: "Fast payment",
  },
  {
    id: 6,
    name: "Andhra Agro Hub",
    company: "Andhra Agro Hub",
    location: "Amaravati",
    distance: 51,
    crop: "Tomato",
    requirement: 650,
    price: 54,
    demand: "Medium",
    verified: true,
    rating: 4.5,
    payment: "3–5 days",
  },
];

const cropOptions = [
  "All Crops",
  "Tomato",
  "Onion",
  "Potato",
  "Chilli",
];

export default function Buyers() {
  const navigate = useNavigate();
  const [requirements, setRequirements] = useState([]);
  const [crop, setCrop] = useState("All Crops");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("recommended");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  useEffect(() => {
  async function loadRequirements() {
    try {
      const response = await getRequirements();
      setRequirements(response.requirements || []);
    } catch (error) {
      console.error("Requirements load error:", error);
    }
  }

  loadRequirements();
}, []);
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [offerQuantity, setOfferQuantity] = useState(100);
  const [offerPrice, setOfferPrice] = useState(0);
  const requirementBuyers = requirements
  .filter((item) => item.status === "active")
  .map((item) => ({
    id: item.id,
    buyerId: item.buyerId,
    name: item.buyerName || "Buyer",
    company: item.buyerName || "Buyer",
    location: item.location || "Not specified",
    distance: 0,
    crop: item.cropName,
    requirement: Number(item.quantity || 0),
    price: Number(item.targetPrice || 0),
    demand: "High",
    verified: true,
    rating: 5,
    payment: "Direct",
  }));
  const filteredBuyers = useMemo(() => {
    let result = [...buyersData, ...requirementBuyers].filter((buyer) => {
      const matchesCrop =
        crop === "All Crops" || buyer.crop === crop;

      const matchesSearch =
        `${buyer.name} ${buyer.company} ${buyer.location} ${buyer.crop}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesVerified =
        !verifiedOnly || buyer.verified;

      return (
        matchesCrop &&
        matchesSearch &&
        matchesVerified
      );
    });

    if (sort === "price") {
      result.sort((a, b) => b.price - a.price);
    }

    if (sort === "distance") {
      result.sort((a, b) => a.distance - b.distance);
    }

    if (sort === "demand") {
      const weight = {
        High: 3,
        Medium: 2,
        Low: 1,
      };

      result.sort(
        (a, b) =>
          weight[b.demand] - weight[a.demand]
      );
    }

    if (sort === "recommended") {
      result.sort((a, b) => {
        const scoreA =
          (a.verified ? 4 : 0) +
          a.rating +
          (a.demand === "High" ? 2 : 0) -
          a.distance / 100;

        const scoreB =
          (b.verified ? 4 : 0) +
          b.rating +
          (b.demand === "High" ? 2 : 0) -
          b.distance / 100;

        return scoreB - scoreA;
      });
    }

    return result;
  }, [crop, search, sort, verifiedOnly]);

  const openOffer = (buyer) => {
    setSelectedBuyer(buyer);
    setOfferQuantity(
      Math.min(100, buyer.requirement)
    );
    setOfferPrice(buyer.price);
  };

  const submitOffer = async () => {
    if (!selectedBuyer) return;

    if (
      !offerQuantity ||
      offerQuantity <= 0 ||
      offerQuantity > selectedBuyer.requirement
    ) {
      alert(
        `Enter quantity between 1 and ${selectedBuyer.requirement} kg.`
      );
      return;
    }
  try {
  const response = await createOrder({
    buyerId: selectedBuyer.buyerId || selectedBuyer.id,
    buyerName: selectedBuyer.buyerName || selectedBuyer.name,
    cropName: selectedBuyer.crop,
    quantity: Number(offerQuantity),
    price: Number(offerPrice),
    location: selectedBuyer.location || "",
    notes: "Selling offer from farmer",
  });

  if (!response.success) {
    alert(response.message || "Failed to send offer.");
    return;
  }
  } catch (error) {
  console.error("Offer submission error:", error);
  alert("Failed to send selling offer.");
  return;
}
    setSelectedBuyer(null);

    alert(
      `Offer sent successfully to ${selectedBuyer.name}.`
    );
  };

  return (
    <DashboardLayout>
      <div className="buyers-page space-y-6 pb-10">

        {/* Header */}
        <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>

            <h1 className="mt-1 text-3xl font-black tracking-tight text-[#1d3024]">
              Find buyers for your crop
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#748179]">
              Discover verified buyers, compare offered prices and
              send a direct selling offer.
            </p>
          </div>

          <button
            onClick={() =>
              navigate("/farmer/market")
            }
            className="sf-button sf-button-secondary"
          >
            <TrendingUp size={17} />
            Compare Market Prices
          </button>
        </section>

        {/* Search */}
        <section className="sf-card p-5">
          <div className="grid gap-4 xl:grid-cols-[1fr_1fr_auto] xl:items-end">

            <div>
              <label className="text-xs font-bold text-[#78857c]">
                Crop
              </label>

              <div className="relative mt-2">
                <select
                  value={crop}
                  onChange={(e) =>
                    setCrop(e.target.value)
                  }
                  className="sf-input appearance-none pr-10"
                >
                  {cropOptions.map((item) => (
                    <option key={item}>
                      {item}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8c9990]"
                />
              </div>
            </div>

            <div className="relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a097]"
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search buyer, location or crop..."
                className="sf-input pl-10"
              />
            </div>

            <div className="flex gap-2">
              <label className="flex h-[46px] cursor-pointer items-center gap-2 rounded-xl bg-[#f1f6f0] px-4 text-xs font-bold text-[#617067]">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) =>
                    setVerifiedOnly(
                      e.target.checked
                    )
                  }
                  className="h-4 w-4 accent-[#18864b]"
                />
                Verified
              </label>

              <div className="relative hidden sm:block">
                <select
                  value={sort}
                  onChange={(e) =>
                    setSort(e.target.value)
                  }
                  className="h-[46px] appearance-none rounded-xl border border-[#dfe7de] bg-white py-2.5 pl-3 pr-9 text-xs font-bold text-[#637168] outline-none"
                >
                  <option value="recommended">
                    Recommended
                  </option>

                  <option value="price">
                    Highest price
                  </option>

                  <option value="distance">
                    Nearest
                  </option>

                  <option value="demand">
                    Highest demand
                  </option>
                </select>

                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8b978f]"
                />
              </div>
            </div>

          </div>
        </section>

        {/* KPI */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <div className="sf-card p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf7ee] text-[#18864b]">
              <Users size={18} />
            </div>

            <p className="mt-4 text-xs text-[#87938b]">
              Buyers available
            </p>

            <p className="mt-1 text-2xl font-black text-[#27392e]">
              {filteredBuyers.length}
            </p>
          </div>

          <div className="sf-card p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff5dd] text-[#a17b20]">
              <IndianRupee size={18} />
            </div>

            <p className="mt-4 text-xs text-[#87938b]">
              Highest offer
            </p>

            <p className="mt-1 text-2xl font-black text-[#27392e]">
              {filteredBuyers.length
                ? `₹${Math.max(
                    ...filteredBuyers.map(
                      (item) => item.price
                    )
                  )}`
                : "—"}
              <span className="text-xs font-semibold text-[#87938b]">
                /kg
              </span>
            </p>
          </div>

          <div className="sf-card p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef5fa] text-[#467aa0]">
              <Package size={18} />
            </div>

            <p className="mt-4 text-xs text-[#87938b]">
              Total demand
            </p>

            <p className="mt-1 text-2xl font-black text-[#27392e]">
              {filteredBuyers
                .reduce(
                  (sum, item) =>
                    sum + item.requirement,
                  0
                )
                .toLocaleString()}
              <span className="text-xs font-semibold text-[#87938b]">
                kg
              </span>
            </p>
          </div>

          <div className="sf-card p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f1edfa] text-[#7355a2]">
              <BadgeCheck size={18} />
            </div>

            <p className="mt-4 text-xs text-[#87938b]">
              Verified buyers
            </p>

            <p className="mt-1 text-2xl font-black text-[#27392e]">
              {
                filteredBuyers.filter(
                  (item) => item.verified
                ).length
              }
            </p>
          </div>

        </section>

        {/* Buyer cards */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-black text-[#26382d]">
              Buyer opportunities
            </h2>

            <p className="mt-1 text-xs text-[#86938a]">
              {filteredBuyers.length} matching buyers found.
            </p>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            {filteredBuyers.map((buyer, index) => (
              <article
                key={buyer.id}
                className={`sf-card sf-card-hover p-5 ${
                  index === 0
                    ? "border-[#c8dfcc]"
                    : ""
                }`}
              >
                <div className="flex flex-col gap-5">

                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#edf7ee] text-[#18864b]">
                        <ShoppingCart size={20} />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          {index === 0 && (
                            <span className="rounded-full bg-[#e7f6e9] px-2 py-1 text-[9px] font-black text-[#18864b]">
                              TOP MATCH
                            </span>
                          )}

                          {buyer.verified && (
                            <span className="flex items-center gap-1 rounded-full bg-[#edf4f9] px-2 py-1 text-[9px] font-black text-[#4b7894]">
                              <BadgeCheck size={10} />
                              VERIFIED
                            </span>
                          )}
                        </div>

                        <h3 className="mt-1 font-black text-[#293b30]">
                          {buyer.name}
                        </h3>

                        <p className="mt-0.5 text-[11px] text-[#89958d]">
                          {buyer.company}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl bg-[#fff7e3] px-2.5 py-1.5">
                      <span className="text-xs font-black text-[#86671e]">
                        ★ {buyer.rating}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-2xl bg-[#f6f8f5] p-3">
                      <p className="text-[9px] uppercase tracking-wide text-[#929e96]">
                        Crop
                      </p>

                      <p className="mt-1 text-sm font-black text-[#33463a]">
                        {buyer.crop}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#f6f8f5] p-3">
                      <p className="text-[9px] uppercase tracking-wide text-[#929e96]">
                        Offer
                      </p>

                      <p className="mt-1 text-sm font-black text-[#18864b]">
                        ₹{buyer.price}/kg
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#f6f8f5] p-3">
                      <p className="text-[9px] uppercase tracking-wide text-[#929e96]">
                        Requirement
                      </p>

                      <p className="mt-1 text-sm font-black text-[#33463a]">
                        {buyer.requirement} kg
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#f6f8f5] p-3">
                      <p className="text-[9px] uppercase tracking-wide text-[#929e96]">
                        Distance
                      </p>

                      <p className="mt-1 text-sm font-black text-[#33463a]">
                        {buyer.distance} km
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 border-t border-[#edf0eb] pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-lg bg-[#edf7ee] px-2.5 py-1.5 text-[10px] font-bold text-[#25804a]">
                        {buyer.demand} demand
                      </span>

                      <span className="rounded-lg bg-[#f4f6f3] px-2.5 py-1.5 text-[10px] font-bold text-[#748078]">
                        {buyer.payment}
                      </span>

                      <span className="flex items-center gap-1 rounded-lg bg-[#f4f6f3] px-2.5 py-1.5 text-[10px] font-bold text-[#748078]">
                        <MapPin size={10} />
                        {buyer.location}
                      </span>
                    </div>

                    <button
                      onClick={() => openOffer(buyer)}
                      className="sf-button sf-button-primary w-full sm:w-auto"
                    >
                      Send Offer
                      <ArrowRight size={15} />
                    </button>
                  </div>

                </div>
              </article>
            ))}
          </div>

          {filteredBuyers.length === 0 && (
            <div className="sf-card py-16 text-center">
              <Users
                size={30}
                className="mx-auto text-[#a0aba3]"
              />

              <h3 className="mt-3 font-black text-[#405147]">
                No buyers found
              </h3>

              <p className="mt-1 text-xs text-[#89958d]">
                Try another crop, location or search term.
              </p>
            </div>
          )}
        </section>

        {/* How it works */}
        <section className="rounded-[26px] border border-[#d2e6d5] bg-[#eaf7ec] p-5 sm:p-6">
          <div className="grid gap-5 md:grid-cols-3">

            {[
              {
                number: "01",
                title: "Choose a buyer",
                text: "Compare demand, price, distance and payment terms.",
              },
              {
                number: "02",
                title: "Send your offer",
                text: "Enter your quantity and preferred selling price.",
              },
              {
                number: "03",
                title: "Track response",
                text: "Your offer is saved locally and can be tracked from bookings/orders.",
              },
            ].map((item) => (
              <div
                key={item.number}
                className="flex gap-3"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[10px] font-black text-[#18864b]">
                  {item.number}
                </span>

                <div>
                  <p className="text-sm font-black text-[#294c33]">
                    {item.title}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#718479]">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}

          </div>
        </section>

        {/* Offer modal */}
        {selectedBuyer && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#102218]/45 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl">

              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.15em] text-[#8b988f]">
                    Selling offer
                  </p>

                  <h2 className="mt-1 text-2xl font-black text-[#293b30]">
                    {selectedBuyer.name}
                  </h2>

                  <p className="mt-1 text-xs text-[#89958d]">
                    {selectedBuyer.crop} ·{" "}
                    {selectedBuyer.location}
                  </p>
                </div>

                <button
                  onClick={() =>
                    setSelectedBuyer(null)
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f1f5f0] text-[#68766d]"
                >
                  ×
                </button>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">

                <div>
                  <label className="text-xs font-bold text-[#78857c]">
                    Quantity (kg)
                  </label>

                  <input
                    type="number"
                    min="1"
                    max={selectedBuyer.requirement}
                    value={offerQuantity}
                    onChange={(e) =>
                      setOfferQuantity(
                        Number(e.target.value)
                      )
                    }
                    className="sf-input mt-2"
                  />

                  <p className="mt-1 text-[10px] text-[#8b978f]">
                    Buyer needs up to{" "}
                    {selectedBuyer.requirement} kg.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#78857c]">
                    Your price (₹/kg)
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={offerPrice}
                    onChange={(e) =>
                      setOfferPrice(
                        Number(e.target.value)
                      )
                    }
                    className="sf-input mt-2"
                  />

                  <p className="mt-1 text-[10px] text-[#8b978f]">
                    Buyer listed ₹
                    {selectedBuyer.price}/kg.
                  </p>
                </div>

              </div>

              <div className="mt-5 rounded-2xl bg-[#eaf7ec] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#718479]">
                    Estimated order value
                  </span>

                  <span className="text-xl font-black text-[#18864b]">
                    ₹
                    {(
                      offerQuantity * offerPrice
                    ).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={submitOffer}
                  className="sf-button sf-button-primary flex-1"
                >
                  Send Selling Offer
                  <ArrowRight size={16} />
                </button>

                <button
                  onClick={() =>
                    setSelectedBuyer(null)
                  }
                  className="sf-button sf-button-secondary"
                >
                  Cancel
                </button>
              </div>

              <p className="mt-4 text-center text-[10px] leading-4 text-[#909b94]">
                Demo only — offer data is saved in localStorage.
              </p>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}