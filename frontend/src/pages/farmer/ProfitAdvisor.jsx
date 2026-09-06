import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Package,
  Sparkles,
  TrendingUp,
  Warehouse,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { calculateProfit, recommendProfit } from "../../services/api";
import { getLoggedInUser } from "../../utils/auth";
import Loading from "../../components/Loading";

export default function ProfitAdvisor() {
  const navigate = useNavigate();

  const user = getLoggedInUser("farmer");

  const [form, setForm] = useState({
    cropName: "",
    quantity: "",
    storageDays: "10",
  });

  const [result, setResult] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();

    setError("");
    setResult(null);
    setRecommendation(null);

    if (!form.cropName.trim()) {
      setError("Please enter the crop name.");
      return;
    }

    if (!form.quantity || Number(form.quantity) <= 0) {
      setError("Please enter a valid quantity.");
      return;
    }


    if (!form.storageDays || Number(form.storageDays) <= 0) {
      setError("Please enter valid storage days.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
  quantity: Number(form.quantity),
  currentPrice: 28,
  futurePrice: 35,
  storageRate: 0.25,
  storageDays: Number(form.storageDays),
  transportCost: 500,
  spoilageRate: 5,
};

      const [profitResponse, recommendationResponse] =
        await Promise.all([
          calculateProfit(payload),
          recommendProfit(payload),
        ]);

      if (profitResponse?.success) {
        setResult(
          profitResponse.profit ||
            profitResponse.result ||
            profitResponse
        );
      }

      if (recommendationResponse?.success) {
        setRecommendation(
          recommendationResponse.recommendation ||
            recommendationResponse.result ||
            recommendationResponse
        );
      }
    } catch (err) {
      setError(
        err.message ||
          "Unable to calculate the recommendation. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (value) => {
    const amount = Number(value || 0);

    return `₹${amount.toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    })}`;
  };

  const formatNumber = (value) => {
    return Number(value || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    });
  };

  const decision = useMemo(() => {
    const value = String(
      recommendation?.decision ||
        recommendation?.recommendation ||
        result?.recommendation ||
        ""
    ).toUpperCase();

    if (
      value.includes("STORE") ||
      value.includes("SELL_AFTER")
    ) {
      return "STORE_AND_SELL";
    }

    return "SELL_NOW";
  }, [recommendation, result]);

  const bestMarket =
    recommendation?.bestMarket ||
    recommendation?.market ||
    result?.bestMarket ||
    null;

  const bestStorage =
    recommendation?.bestStorage ||
    recommendation?.storage ||
    null;

  const expectedProfit =
    recommendation?.expectedProfit ??
    result?.storeAndSellNetProfit ??
    result?.futureNetProfit ??
    result?.expectedProfit ??
    0;

  const profitDifference =
    recommendation?.profitDifference ??
    recommendation?.difference ??
    result?.profitDifference ??
    result?.difference ??
    0;

  const spoilage =
    recommendation?.spoilagePercentage ??
    recommendation?.spoilage ??
    result?.spoilagePercentage ??
    result?.spoilage ??
    0;

  const currentPrice =
    bestMarket?.price ??
    result?.currentMarketPrice ??
    result?.currentPrice ??
    0;

  const futurePrice =
    recommendation?.futurePrice ??
    result?.futurePrice ??
    result?.expectedFuturePrice ??
    0;

  const storageCost =
    recommendation?.storageCost ??
    result?.storageCost ??
    result?.totalStorageCost ??
    0;

  const recommendationReason =
    recommendation?.reason ||
    recommendation?.message ||
    result?.reason ||
    (decision === "STORE_AND_SELL"
      ? "The expected future price can provide better returns after considering storage cost and estimated spoilage."
      : "Selling now appears safer because the expected future gain does not sufficiently cover storage cost and spoilage risk.");

  return (
    <div className="profit-page space-y-6">
      {/* Header */}
      <div>
        

        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Profit Advisor
        </h1>

        <p className="mt-1 max-w-2xl text-sm text-slate-500">
          Compare current selling opportunities with future
          storage options and choose the strategy that can
          maximize your profit.
        </p>
      </div>

      {/* Input Card */}
      <form
        onSubmit={handleAnalyze}
        className="sf-card p-5 sm:p-6"
      >
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e7f6ed] text-[#18864b]">
            <BarChart3 size={22} />
          </div>

          <div>
            <h2 className="font-bold text-slate-900">
              Analyze Your Crop
            </h2>

            <p className="text-sm text-slate-500">
              Enter your crop details to get a smart recommendation.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Crop */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Crop Name
            </label>

            <input
              name="cropName"
              value={form.cropName}
              onChange={handleChange}
              placeholder="e.g. Tomato"
              className="sf-input"
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Quantity (kg)
            </label>

            <input
              name="quantity"
              type="number"
              min="1"
              value={form.quantity}
              onChange={handleChange}
              placeholder="e.g. 1000"
              className="sf-input"
            />
          </div>

          {/* Storage Days */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Storage Period (days)
            </label>

            <input
              name="storageDays"
              type="number"
              min="1"
              value={form.storageDays}
              onChange={handleChange}
              className="sf-input"
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="sf-button sf-button-primary inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Sparkles size={18} />

            {loading
              ? "Analyzing..."
              : "Analyze Profit"}
          </button>
        </div>
      </form>

      {loading && <Loading />}

      {/* Results */}
      {!loading && (result || recommendation) && (
        <>
          {/* Decision */}
          <div
            className={`rounded-3xl border p-5 sm:p-6 ${
              decision === "STORE_AND_SELL"
                ? "border-emerald-200 bg-emerald-50"
                : "border-orange-200 bg-orange-50"
            }`}
          >
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-600">
                  <Sparkles size={17} />
                  Smart Recommendation
                </div>

                <h2
                  className={`text-2xl font-extrabold ${
                    decision === "STORE_AND_SELL"
                      ? "text-[#137a43]"
                      : "text-orange-700"
                  }`}
                >
                  {decision === "STORE_AND_SELL"
                    ? "STORE & SELL"
                    : "SELL NOW"}
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  {recommendationReason}
                </p>
              </div>

              <div
                className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl ${
                  decision === "STORE_AND_SELL"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-orange-100 text-orange-700"
                }`}
              >
                {decision === "STORE_AND_SELL" ? (
                  <TrendingUp size={36} />
                ) : (
                  <ArrowDown size={36} />
                )}
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              icon={<Package size={20} />}
              label="Quantity"
              value={`${formatNumber(form.quantity)} kg`}
            />

            <MetricCard
              icon={<BarChart3 size={20} />}
              label="Current Price"
              value={`${formatMoney(currentPrice)}/kg`}
            />

            <MetricCard
              icon={<TrendingUp size={20} />}
              label="Future Price"
              value={
                futurePrice
                  ? `${formatMoney(futurePrice)}/kg`
                  : "—"
              }
            />

            <MetricCard
              icon={<CalendarDays size={20} />}
              label="Storage Period"
              value={`${form.storageDays} days`}
            />
          </div>

          {/* Comparison */}
          <div className="grid gap-5 lg:grid-cols-2">
            {/* Sell Now */}
            <div className="sf-card p-5 sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">
                    Sell Now
                  </h3>

                  <p className="text-sm text-slate-500">
                    Immediate selling opportunity
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <ArrowDown size={20} />
                </div>
              </div>

              <div className="space-y-3">
                <CompareRow
                  label="Market Price"
                  value={`${formatMoney(currentPrice)}/kg`}
                />

                <CompareRow
                  label="Estimated Revenue"
                  value={
                    result?.sellNowRevenue !== undefined
                      ? formatMoney(result.sellNowRevenue)
                      : result?.currentRevenue !== undefined
                      ? formatMoney(result.currentRevenue)
                      : "—"
                  }
                />

                <CompareRow
                  label="Net Profit"
                  value={
                    result?.sellNowNetProfit !== undefined
                      ? formatMoney(result.sellNowNetProfit)
                      : result?.currentNetProfit !== undefined
                      ? formatMoney(result.currentNetProfit)
                      : "—"
                  }
                  strong
                />
              </div>
            </div>

            {/* Store */}
            <div className="sf-card p-5 sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">
                    Store & Sell
                  </h3>

                  <p className="text-sm text-slate-500">
                    Future selling opportunity
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e7f6ed] text-[#18864b]">
                  <ArrowUp size={20} />
                </div>
              </div>

              <div className="space-y-3">
                <CompareRow
                  label="Expected Future Price"
                  value={
                    futurePrice
                      ? `${formatMoney(futurePrice)}/kg`
                      : "—"
                  }
                />

                <CompareRow
                  label="Storage Cost"
                  value={formatMoney(storageCost)}
                />

                <CompareRow
                  label="Spoilage Risk"
                  value={`${formatNumber(spoilage)}%`}
                />

                <CompareRow
                  label="Expected Net Profit"
                  value={formatMoney(expectedProfit)}
                  strong
                />
              </div>
            </div>
          </div>

          {/* Profit Difference */}
          <div className="sf-card overflow-hidden">
            <div className="grid md:grid-cols-3">
              <div className="p-5 sm:p-6">
                <p className="text-sm text-slate-500">
                  Expected Profit
                </p>

                <p className="mt-1 text-2xl font-extrabold text-slate-900">
                  {formatMoney(expectedProfit)}
                </p>
              </div>

              <div className="border-t border-slate-100 p-5 sm:p-6 md:border-l md:border-t-0">
                <p className="text-sm text-slate-500">
                  Profit Difference
                </p>

                <p
                  className={`mt-1 text-2xl font-extrabold ${
                    Number(profitDifference) >= 0
                      ? "text-[#18864b]"
                      : "text-red-600"
                  }`}
                >
                  {Number(profitDifference) >= 0
                    ? "+"
                    : ""}
                  {formatMoney(profitDifference)}
                </p>
              </div>

              <div className="border-t border-slate-100 p-5 sm:p-6 md:border-l md:border-t-0">
                <p className="text-sm text-slate-500">
                  Estimated Spoilage
                </p>

                <p className="mt-1 text-2xl font-extrabold text-slate-900">
                  {formatNumber(spoilage)}%
                </p>
              </div>
            </div>
          </div>

          {/* Best Options */}
          <div className="grid gap-5 lg:grid-cols-2">
            {/* Market */}
            <div className="sf-card p-5 sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <MapPin size={21} />
                </div>

                <div>
                  <h3 className="font-bold text-slate-900">
                    Best Market
                  </h3>

                  <p className="text-sm text-slate-500">
                    Recommended selling destination
                  </p>
                </div>
              </div>

              {bestMarket ? (
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-slate-900">
                        {bestMarket.name ||
                          bestMarket.marketName ||
                          "Recommended Market"}
                      </h4>

                      <p className="mt-1 text-sm text-slate-500">
                        {bestMarket.location || "Market"}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xl font-extrabold text-[#18864b]">
                        {formatMoney(bestMarket.price)}
                      </p>

                      <p className="text-xs text-slate-500">
                        per kg
                      </p>
                    </div>
                  </div>

                  {bestMarket.change !== undefined && (
                    <div className="mt-4 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                      <ArrowUp size={13} />
                      {formatNumber(bestMarket.change)}%
                    </div>
                  )}
                </div>
              ) : (
                <EmptyBox text="No recommended market available." />
              )}
            </div>

            {/* Storage */}
            <div className="sf-card p-5 sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                  <Warehouse size={21} />
                </div>

                <div>
                  <h3 className="font-bold text-slate-900">
                    Best Cold Storage
                  </h3>

                  <p className="text-sm text-slate-500">
                    Recommended storage facility
                  </p>
                </div>
              </div>

              {bestStorage ? (
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-slate-900">
                        {bestStorage.name ||
                          bestStorage.storageName ||
                          "Recommended Storage"}
                      </h4>

                      <p className="mt-1 text-sm text-slate-500">
                        {bestStorage.location || "Location unavailable"}
                      </p>
                    </div>

                    {bestStorage.verified && (
                      <CheckCircle2
                        size={20}
                        className="shrink-0 text-[#18864b]"
                      />
                    )}
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <SmallInfo
                      icon={<MapPin size={15} />}
                      label="Distance"
                      value={
                        bestStorage.distance !== undefined
                          ? `${bestStorage.distance} km`
                          : "—"
                      }
                    />

                    <SmallInfo
                      icon={<Clock3 size={15} />}
                      label="Rent"
                      value={
                        bestStorage.rentPerKgPerDay !==
                        undefined
                          ? `₹${bestStorage.rentPerKgPerDay}/kg/day`
                          : "—"
                      }
                    />
                  </div>

                  {decision === "STORE_AND_SELL" && (
                    <button
                      type="button"
                      onClick={() => {
                        const id =
                          bestStorage.id ||
                          bestStorage.storageId;

                        if (id) {
                          navigate(
                            `/farmer/storage/${id}?from=profit`
                          );
                        } else {
                          navigate("/farmer/storage");
                        }
                      }}
                      className="sf-button sf-button-primary mt-4 w-full"
                    >
                      View & Book This Storage
                    </button>
                  )}
                </div>
              ) : (
                <EmptyBox text="No recommended storage available." />
              )}
            </div>
          </div>
        </>
      )}

      {/* Empty State */}
      {!loading && !result && !recommendation && (
        <div className="sf-card flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#e7f6ed] text-[#18864b]">
            <Sparkles size={30} />
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-900">
            Find Your Best Selling Strategy
          </h2>

          <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">
            Enter your crop, quantity and storage period above.
            Smart Farmer will compare available opportunities
            and suggest the better option.
          </p>
        </div>
      )}
    </div>
  );
}

function MetricCard({ icon, label, value }) {
  return (
    <div className="sf-card p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e7f6ed] text-[#18864b]">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {label}
          </p>

          <p className="mt-0.5 truncate text-lg font-extrabold text-slate-900">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function CompareRow({ label, value, strong = false }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-slate-500">
        {label}
      </span>

      <span
        className={`text-sm ${
          strong
            ? "font-extrabold text-slate-900"
            : "font-semibold text-slate-700"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function SmallInfo({ icon, label, value }) {
  return (
    <div className="rounded-xl bg-white p-3">
      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        {icon}
        {label}
      </div>

      <p className="mt-1 text-sm font-bold text-slate-800">
        {value}
      </p>
    </div>
  );
}

function EmptyBox({ text }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">
      {text}
    </div>
  );
}