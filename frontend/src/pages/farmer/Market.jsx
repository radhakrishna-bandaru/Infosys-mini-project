import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  IndianRupee,
  Loader2,
  MapPin,
  Search,
  TrendingUp,
} from "lucide-react";

import DashboardLayout from "../../layouts/DashboardLayout";
import { getMarkets } from "../../services/api";

const cropOptions = [
  "All Crops",
  "Tomato",
  "Chilli",
  "Onion",
];

export default function Market() {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedCrop, setSelectedCrop] =
    useState("All Crops");
  const [sortBy, setSortBy] = useState("price-high");

  const loadMarkets = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMarkets(
        selectedCrop !== "All Crops"
          ? { crop: selectedCrop }
          : {}
      );

      setMarkets(response.markets || []);
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to load market prices."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMarkets();
  }, [selectedCrop]);

  const filteredMarkets = useMemo(() => {
    let result = markets.filter((market) => {
      const text =
        `${market.name} ${market.location} ${market.crop}`
          .toLowerCase();

      return text.includes(search.toLowerCase());
    });

    result.sort((a, b) => {
      if (sortBy === "price-high") {
        return Number(b.price) - Number(a.price);
      }

      if (sortBy === "price-low") {
        return Number(a.price) - Number(b.price);
      }

      if (sortBy === "change-high") {
        return (
          Number(b.change) -
          Number(a.change)
        );
      }

      return 0;
    });

    return result;
  }, [markets, search, sortBy]);

  const highestPrice =
    markets.length > 0
      ? Math.max(
          ...markets.map((market) =>
            Number(market.price)
          )
        )
      : 0;

  const averagePrice =
    markets.length > 0
      ? markets.reduce(
          (sum, market) =>
            sum + Number(market.price),
          0
        ) / markets.length
      : 0;

  const risingMarkets = markets.filter(
    (market) => Number(market.change) > 0
  ).length;

  return (
    <DashboardLayout>
      <div className="market-page space-y-6">

        {/* Header */}
        <div>
          

          <h1 className="sf-section-title text-3xl sm:text-4xl">
            Market Prices
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-[#6d796f]">
            Compare crop prices across nearby markets
            and identify better selling opportunities.
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
            icon={<IndianRupee size={20} />}
            label="Highest Price"
            value={`₹${highestPrice.toLocaleString(
              "en-IN"
            )}/kg`}
          />

          <StatCard
            icon={<BarChart3 size={20} />}
            label="Average Price"
            value={`₹${averagePrice.toFixed(1)}/kg`}
          />

          <StatCard
            icon={<TrendingUp size={20} />}
            label="Markets Rising"
            value={risingMarkets}
          />

          <StatCard
            icon={<MapPin size={20} />}
            label="Markets Tracked"
            value={markets.length}
          />

        </div>

        {/* Filters */}
        <div className="sf-card p-4">
          <div className="flex flex-col gap-4 lg:flex-row">

            {/* Search */}
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#89948c]"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search market, crop or location..."
                className="sf-input pl-11"
              />
            </div>

            {/* Crop */}
            <select
              value={selectedCrop}
              onChange={(event) =>
                setSelectedCrop(event.target.value)
              }
              className="sf-input !w-36 shrink-0"
            >
              {cropOptions.map((crop) => (
                <option key={crop}>
                  {crop}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(event) =>
                setSortBy(event.target.value)
              }
              className="sf-input !w-40 shrink-0"
            >
              <option value="price-high">
                Highest Price
              </option>
              <option value="price-low">
                Lowest Price
              </option>
              <option value="change-high">
                Highest Change
              </option>
            </select>

          </div>
        </div>

        {/* Market cards */}
        {loading ? (
          <div className="sf-card flex min-h-[300px] items-center justify-center">
            <div className="flex items-center gap-3 text-[#18864b]">
              <Loader2
                size={25}
                className="sf-spin"
              />
              <span className="font-semibold">
                Loading live market data...
              </span>
            </div>
          </div>
        ) : filteredMarkets.length === 0 ? (
          <div className="sf-card flex min-h-[280px] flex-col items-center justify-center text-center">
            <BarChart3
              size={40}
              className="mb-4 text-[#18864b]"
            />

            <h3 className="text-xl font-extrabold">
              No market data found
            </h3>

            <p className="mt-2 text-sm text-[#6d796f]">
              Try changing your search or crop filter.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">

            {filteredMarkets.map((market) => (
              <MarketCard
                key={market.id}
                market={market}
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

      <p className="text-sm font-medium text-[#6d796f]">
        {label}
      </p>

      <p className="mt-1 text-2xl font-extrabold text-[#17221b]">
        {value}
      </p>
    </div>
  );
}

function MarketCard({ market }) {
  const change = Number(market.change || 0);
  const rising = change > 0;
  const falling = change < 0;

  return (
    <div className="sf-card sf-card-hover overflow-hidden">

      {/* Top */}
      <div className="flex items-start justify-between border-b border-[#edf1ec] p-5">

        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eaf6eb] text-[#18864b]">
              <BarChart3 size={21} />
            </div>

            <div>
              <h3 className="font-extrabold text-[#17221b]">
                {market.crop}
              </h3>

              <p className="text-xs text-[#758078]">
                {market.name}
              </p>
            </div>
          </div>
        </div>

        <div
          className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold ${
            rising
              ? "bg-[#eaf7ed] text-[#18864b]"
              : falling
                ? "bg-red-50 text-red-600"
                : "bg-[#f1f3f1] text-[#68736b]"
          }`}
        >
          {rising && <ArrowUp size={13} />}
          {falling && <ArrowDown size={13} />}
          {change === 0 ? "Stable" : `${Math.abs(change)}%`}
        </div>

      </div>

      {/* Price */}
      <div className="p-5">

        <p className="text-sm font-medium text-[#7a857d]">
          Current Market Price
        </p>

        <div className="mt-1 flex items-end gap-2">
          <span className="text-3xl font-black text-[#17221b]">
            ₹{Number(market.price).toLocaleString(
              "en-IN"
            )}
          </span>

          <span className="pb-1 text-sm text-[#7a857d]">
            / {market.unit || "kg"}
          </span>
        </div>

        <div className="mt-4 rounded-2xl bg-[#f6f9f5] p-4">

          <div className="flex items-center gap-2 text-sm text-[#637067]">
            <MapPin size={15} />
            {market.location}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs font-medium text-[#8a948d]">
              Price movement
            </span>

            <span
              className={`text-sm font-extrabold ${
                rising
                  ? "text-[#18864b]"
                  : falling
                    ? "text-red-600"
                    : "text-[#68736b]"
              }`}
            >
              {rising
                ? "Increasing"
                : falling
                  ? "Decreasing"
                  : "Stable"}
            </span>
          </div>

        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-[#89938b]">
          <span>Updated</span>

          <span>
            {market.updatedAt
              ? new Date(
                  market.updatedAt
                ).toLocaleDateString("en-IN")
              : "Today"}
          </span>
        </div>

      </div>
    </div>
  );
}