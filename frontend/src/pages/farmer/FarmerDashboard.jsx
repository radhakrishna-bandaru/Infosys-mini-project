import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Box,
  ChevronRight,
  Leaf,
  Loader2,
  MapPin,
  Package,
  Plus,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Warehouse,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout";
import { getLoggedInUser } from "../../utils/auth";
import {
  getCrops,
  getMarkets,
  getOrders,
  getStorages,
} from "../../services/api";

export default function FarmerDashboard() {
  const navigate = useNavigate();

  const user = getLoggedInUser("farmer");

  const [crops, setCrops] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [orders, setOrders] = useState([]);
  const [storages, setStorages] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const farmerId =
    user?.id ||
    user?._id ||
    "";

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const [
        cropsResponse,
        marketsResponse,
        ordersResponse,
        storageResponse,
      ] = await Promise.all([
        getCrops(),
        getMarkets(),
        getOrders({ farmerId }),
        getStorages(),
      ]);

      const farmerCrops = (
        cropsResponse?.crops || []
      ).filter(
        (crop) =>
          crop.farmerId === farmerId
      );

      setCrops(farmerCrops);
      setMarkets(
        marketsResponse?.markets || []
      );
      setOrders(
        ordersResponse?.orders || []
      );
      setStorages(
        storageResponse?.storages || []
      );
    } catch (err) {
      console.error(
        "Dashboard loading error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const totalQuantity = useMemo(
    () =>
      crops.reduce(
        (sum, crop) =>
          sum +
          Number(crop.quantity || 0),
        0
      ),
    [crops]
  );

  const estimatedValue = useMemo(
    () =>
      crops.reduce(
        (sum, crop) =>
          sum +
          Number(crop.quantity || 0) *
            Number(
              crop.expectedPrice || 0
            ),
        0
      ),
    [crops]
  );

  const activeOrders = orders.filter(
    (order) =>
      [
        "pending",
        "confirmed",
        "processing",
      ].includes(order.status)
  );

  const completedOrders =
    orders.filter(
      (order) =>
        order.status === "completed"
    );

  const topMarket = useMemo(() => {
    if (!markets.length) return null;

    return [...markets].sort(
      (a, b) =>
        Number(b.price || 0) -
        Number(a.price || 0)
    )[0];
  }, [markets]);

  const recentCrops =
    crops.slice(0, 4);

  const recentOrders =
    orders.slice(0, 4);

  const nearbyStorages =
    storages
      .filter(
        (storage) =>
          storage.active !== false
      )
      .sort(
        (a, b) =>
          Number(a.distance || 999) -
          Number(b.distance || 999)
      )
      .slice(0, 3);

  const firstName =
    user?.name?.split(" ")[0] ||
    "Farmer";

  const money = (value) =>
    `₹${Number(value || 0).toLocaleString(
      "en-IN"
    )}`;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="sf-dashboard-loading">
          <div className="sf-loader-orb">
            <Leaf size={28} />
          </div>

          <h3>
            Preparing your farm workspace
          </h3>

          <p>
            Fetching crops, markets,
            orders and storage...
          </p>

          <Loader2
            size={20}
            className="sf-spin"
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <style>{`
/* =========================================
   FARMER DASHBOARD — FINAL UI FIX
========================================= */

.fd-page {
  width: 100% !important;
  max-width: 1400px;
  margin: 0 auto;
  padding: 4px 0 32px;
  color: #172018 !important;
}

/* ---------- HERO ---------- */

.fd-hero {
  position: relative !important;
  width: 100% !important;
  min-height: 270px !important;
  padding: 34px 38px !important;
  border-radius: 24px !important;
  overflow: hidden !important;

  background: linear-gradient(
    135deg,
    #155b32 0%,
    #168047 55%,
    #0c9652 100%
  ) !important;

  border: none !important;
  box-shadow: 0 18px 45px rgba(20, 90, 45, .14) !important;
}

.fd-hero-content {
  position: relative !important;
  z-index: 5 !important;
  max-width: 720px !important;
}

.fd-eyebrow {
  display: inline-flex !important;
  width: fit-content !important;
  align-items: center !important;
  gap: 8px !important;

  padding: 7px 12px !important;
  border-radius: 999px !important;

  color: #d9f8df !important;
  background: rgba(255,255,255,.10) !important;
  border: 1px solid rgba(255,255,255,.18) !important;

  font-size: 11px !important;
  font-weight: 800 !important;
}

.fd-live-dot {
  width: 7px !important;
  height: 7px !important;
  flex: 0 0 7px !important;
  border-radius: 50% !important;
  background: #9cf3ae !important;
}

.fd-hero h1 {
  margin: 18px 0 0 !important;
  color: #ffffff !important;
  font-size: clamp(34px, 4vw, 48px) !important;
  line-height: 1.08 !important;
  letter-spacing: -.04em !important;
  font-weight: 850 !important;
}

.fd-name {
  color: #9af0ae !important;
}

.fd-hero p {
  max-width: 680px !important;
  margin-top: 14px !important;
  color: #e0f4e5 !important;
  font-size: 15px !important;
  line-height: 1.65 !important;
}

.fd-hero-actions {
  display: flex !important;
  flex-wrap: wrap !important;
  gap: 10px !important;
  margin-top: 22px !important;
}

.fd-btn {
  height: 46px !important;
  padding: 0 18px !important;
  border-radius: 12px !important;
  font-size: 12px !important;
  font-weight: 800 !important;
}

.fd-btn-ai {
  color: #126b35 !important;
  background: #ffffff !important;
  box-shadow: 0 8px 20px rgba(0,0,0,.10) !important;
}

.fd-btn-ai:hover {
  background: #effaf2 !important;
}

.fd-btn-dark {
  color: #ffffff !important;
  background: rgba(255,255,255,.11) !important;
  border-color: rgba(255,255,255,.22) !important;
}

/* ---------- HERO ORB ---------- */

.fd-orbit {
  right: 45px !important;
  width: 175px !important;
  height: 175px !important;
  opacity: .75 !important;
}

.fd-orb-core {
  width: 88px !important;
  height: 88px !important;
}

/* ---------- STATS ---------- */

.fd-stats {
  display: grid !important;
  grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
  gap: 16px !important;
  width: 100% !important;
  margin-top: 18px !important;
}

.fd-stat {
  position: relative !important;
  min-width: 0 !important;
  min-height: 150px !important;
  padding: 20px !important;

  border-radius: 18px !important;
  background: #ffffff !important;
  border: 1px solid #e0e9e1 !important;

  box-shadow: 0 6px 20px rgba(25,65,38,.05) !important;
}

.fd-stat-icon {
  width: 40px !important;
  height: 40px !important;
  margin-bottom: 15px !important;
  border-radius: 11px !important;
}

.fd-stat-label {
  color: #718078 !important;
  font-size: 11px !important;
  font-weight: 800 !important;
  letter-spacing: .05em !important;
}

.fd-stat-value {
  margin-top: 7px !important;
  color: #17251c !important;
  font-size: 28px !important;
  line-height: 1.1 !important;
  font-weight: 850 !important;
}

.fd-stat-meta {
  margin-top: 6px !important;
  color: #8a9790 !important;
  font-size: 11px !important;
}

/* ---------- SECTIONS ---------- */

.fd-section {
  width: 100% !important;
  margin-top: 22px !important;
}

/* ---------- PANELS ---------- */

.fd-panel {
  width: 100% !important;
  min-width: 0 !important;
  padding: 20px !important;

  border-radius: 18px !important;
  background: #ffffff !important;
  border: 1px solid #e0e9e1 !important;

  box-shadow: 0 6px 22px rgba(25,65,38,.045) !important;
}

/* IMPORTANT: fixes colored full-width bars */

.fd-panel-head {
  display: flex !important;
  align-items: flex-start !important;
  justify-content: space-between !important;
  gap: 15px !important;
  margin-bottom: 16px !important;
}

.fd-panel-head > div {
  min-width: 0 !important;
}

.fd-panel-title {
  display: flex !important;
  width: fit-content !important;
  max-width: 100% !important;
  align-items: center !important;
  gap: 9px !important;

  color: #1d2b22 !important;
  font-size: 15px !important;
  font-weight: 850 !important;
}

.fd-panel-title-icon {
  width: 34px !important;
  height: 34px !important;
  min-width: 34px !important;
  max-width: 34px !important;
  flex: 0 0 34px !important;

  display: flex !important;
  align-items: center !important;
  justify-content: center !important;

  border-radius: 10px !important;
}

.fd-section-sub {
  margin-top: 5px !important;
  color: #849189 !important;
  font-size: 11px !important;
  line-height: 1.45 !important;
}

.fd-link {
  display: inline-flex !important;
  width: fit-content !important;
  align-items: center !important;
  gap: 5px !important;

  color: #168047 !important;
  font-size: 11px !important;
  font-weight: 800 !important;
  white-space: nowrap !important;
}

/* ---------- MARKET + QUICK ACTIONS ---------- */

.fd-intelligence {
  display: grid !important;
  grid-template-columns: minmax(0, 1.55fr) minmax(330px, 1fr) !important;
  gap: 16px !important;
  width: 100% !important;
}

.fd-market-list {
  display: grid !important;
  gap: 10px !important;
}

.fd-market-row {
  display: grid !important;
  grid-template-columns: minmax(0, 1fr) auto auto !important;
  align-items: center !important;
  gap: 14px !important;

  min-height: 62px !important;
  padding: 10px 12px !important;

  border-radius: 13px !important;
  background: #f7faf7 !important;
  border: 1px solid #e6eee7 !important;
}

.fd-market-name {
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
  min-width: 0 !important;
}

.fd-crop-icon {
  width: 36px !important;
  height: 36px !important;
  min-width: 36px !important;
  flex: 0 0 36px !important;
  border-radius: 10px !important;
}

.fd-market-name strong {
  display: block !important;
  color: #25342b !important;
  font-size: 12px !important;
  font-weight: 800 !important;
}

.fd-market-name span {
  display: block !important;
  margin-top: 3px !important;
  color: #87938b !important;
  font-size: 10px !important;
}

.fd-price {
  color: #1f3026 !important;
  font-size: 14px !important;
  font-weight: 850 !important;
  white-space: nowrap !important;
}

.fd-price small {
  color: #89958e !important;
  font-size: 9px !important;
}

.fd-trend {
  padding: 6px 9px !important;
  border-radius: 8px !important;
  font-size: 10px !important;
  white-space: nowrap !important;
}

/* ---------- QUICK ACTIONS ---------- */

.fd-actions {
  display: grid !important;
  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  gap: 10px !important;
}

.fd-action {
  min-width: 0 !important;
  min-height: 92px !important;
  padding: 14px !important;

  display: flex !important;
  align-items: center !important;
  gap: 11px !important;

  border-radius: 14px !important;
  background: #f8faf8 !important;
  border: 1px solid #e3ebe4 !important;
}

.fd-action-icon {
  width: 40px !important;
  height: 40px !important;
  min-width: 40px !important;
  flex: 0 0 40px !important;
  border-radius: 11px !important;
}

.fd-action > div:last-child {
  min-width: 0 !important;
}

.fd-action strong {
  display: block !important;
  color: #26352c !important;
  font-size: 12px !important;
  font-weight: 850 !important;
}

.fd-action span {
  display: block !important;
  margin-top: 4px !important;
  color: #89958e !important;
  font-size: 10px !important;
}

/* ---------- LOWER ---------- */

.fd-lower {
  display: grid !important;
  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  gap: 16px !important;
  width: 100% !important;
  margin-top: 22px !important;
}

.fd-crops,
.fd-order-list {
  display: grid !important;
  gap: 9px !important;
}

.fd-crop-row,
.fd-order-row {
  min-width: 0 !important;
  padding: 11px 12px !important;
  border-radius: 12px !important;
  background: #f7faf7 !important;
  border: 1px solid #e6eee7 !important;
}

.fd-crop-symbol,
.fd-order-icon {
  width: 36px !important;
  height: 36px !important;
  min-width: 36px !important;
  flex: 0 0 36px !important;
  border-radius: 10px !important;
}

.fd-crop-info strong,
.fd-crop-value strong,
.fd-order-info strong {
  font-size: 11px !important;
}

.fd-crop-info span,
.fd-crop-value span,
.fd-order-info span {
  font-size: 10px !important;
}

.fd-status {
  font-size: 9px !important;
  padding: 6px 9px !important;
}

/* ---------- STORAGE ---------- */

.fd-storage-list {
  display: grid !important;
  grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
  gap: 12px !important;
}

.fd-storage {
  min-width: 0 !important;
  padding: 15px !important;
  border-radius: 13px !important;
  background: #f7faf7 !important;
  border: 1px solid #e6eee7 !important;
}

.fd-storage-icon {
  width: 38px !important;
  height: 38px !important;
  border-radius: 10px !important;
}

.fd-storage strong {
  margin-top: 10px !important;
  font-size: 11px !important;
}

.fd-storage-location {
  font-size: 9px !important;
}

.fd-storage-distance {
  margin-top: 10px !important;
  font-size: 10px !important;
}

/* ---------- EMPTY ---------- */

.fd-empty {
  min-height: 120px !important;
  padding: 20px !important;
}

.fd-empty strong {
  font-size: 12px !important;
}

.fd-empty span {
  margin-top: 5px !important;
  font-size: 10px !important;
}

/* ---------- RESPONSIVE ---------- */

@media (max-width: 1100px) {
  .fd-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }

  .fd-intelligence {
    grid-template-columns: 1fr !important;
  }

  .fd-orbit {
    opacity: .25 !important;
  }
}

@media (max-width: 760px) {
  .fd-page {
    padding: 0 0 24px !important;
  }

  .fd-hero {
    padding: 25px !important;
    min-height: 300px !important;
  }

  .fd-hero h1 {
    font-size: 32px !important;
  }

  .fd-hero p {
    font-size: 13px !important;
  }

  .fd-orbit {
    display: none !important;
  }

  .fd-lower {
    grid-template-columns: 1fr !important;
  }

  .fd-storage-list {
    grid-template-columns: 1fr !important;
  }
}

@media (max-width: 520px) {
  .fd-stats {
    grid-template-columns: 1fr !important;
  }

  .fd-actions {
    grid-template-columns: 1fr !important;
  }

  .fd-market-row {
    grid-template-columns: minmax(0,1fr) auto !important;
  }

  .fd-price {
    display: none !important;
  }
}
  /* =========================================
   HERO LEAF OVERLAP FIX
========================================= */

.fd-orbit {
  display: none !important;
}

.fd-hero-actions {
  position: relative !important;
  z-index: 20 !important;

  display: flex !important;
  align-items: center !important;
  gap: 12px !important;
  margin-top: 22px !important;
}

.fd-btn {
  position: relative !important;
  z-index: 21 !important;

  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 8px !important;

  min-width: 0 !important;
  white-space: nowrap !important;
}

.fd-btn-ai {
  width: auto !important;
  min-height: 46px !important;
}

.fd-btn-dark {
  width: auto !important;
  min-height: 46px !important;
}
`}</style>
     


      <div className="fd-page">

        {/* =========================================
            HERO
        ========================================= */}

        <section className="fd-hero">

          <div className="fd-hero-content">

            <div className="fd-eyebrow">
              <span className="fd-live-dot" />
              FARMER WORKSPACE
            </div>

            <h1>
              Good day,{" "}
              <span className="fd-name">
                {firstName}
              </span>
              .
            </h1>

            <p>
              Everything you need to manage
              your farm, understand the market,
              protect your harvest and make
              better selling decisions.
            </p>

            <div className="fd-hero-actions">

              <button
                className="
                  fd-btn
                  fd-btn-ai
                "
                onClick={() =>
                  navigate("/farmer/ai")
                }
              >
                <Sparkles size={15} />
                Open AI Advisor
                <ArrowRight size={13} />
              </button>

              <button
                className="
                  fd-btn
                  fd-btn-dark
                "
                onClick={() =>
                  navigate("/farmer/crops")
                }
              >
                <Leaf size={15} />
                Manage Crops
              </button>

            </div>

          </div>


          <div className="fd-orbit">

            <div className="fd-orb-core">
              <Leaf size={37} />
            </div>

          </div>

        </section>


        {/* =========================================
            ERROR
        ========================================= */}

        {error && (
          <div className="fd-error">
            {error}
          </div>
        )}


        {/* =========================================
            STATS
        ========================================= */}

        <section className="fd-stats">

          <div
            className="
              fd-stat
              fd-stat-mint
            "
          >
            <div className="fd-stat-icon">
              <Leaf size={17} />
            </div>

            <div className="fd-stat-label">
              My Crops
            </div>

            <div className="fd-stat-value">
              {crops.length}
            </div>

            <div className="fd-stat-meta">
              Registered crops
            </div>

          </div>


          <div
            className="
              fd-stat
              fd-stat-blue
            "
          >
            <div className="fd-stat-icon">
              <Package size={17} />
            </div>

            <div className="fd-stat-label">
              Total Quantity
            </div>

            <div className="fd-stat-value">
              {totalQuantity.toLocaleString(
                "en-IN"
              )}{" "}
              kg
            </div>

            <div className="fd-stat-meta">
              Current farm stock
            </div>

          </div>


          <div
            className="
              fd-stat
              fd-stat-violet
            "
          >
            <div className="fd-stat-icon">
              <TrendingUp size={17} />
            </div>

            <div className="fd-stat-label">
              Estimated Value
            </div>

            <div className="fd-stat-value">
              {money(estimatedValue)}
            </div>

            <div className="fd-stat-meta">
              Based on expected prices
            </div>

          </div>


          <div
            className="
              fd-stat
              fd-stat-coral
            "
          >
            <div className="fd-stat-icon">
              <ShoppingBag size={17} />
            </div>

            <div className="fd-stat-label">
              Active Orders
            </div>

            <div className="fd-stat-value">
              {activeOrders.length}
            </div>

            <div className="fd-stat-meta">
              {completedOrders.length} completed
            </div>

          </div>

        </section>


        {/* =========================================
            MARKET + QUICK ACTIONS
        ========================================= */}

        <section className="fd-section">

          <div className="fd-intelligence">

            {/* MARKET */}

            <div className="fd-panel">

              <div className="fd-panel-head">

                <div>

                  <div className="fd-panel-title">

                    <div className="fd-panel-title-icon">
                      <BarChart3 size={15} />
                    </div>

                    Market Intelligence

                  </div>

                  <div className="fd-section-sub">
                    Latest market opportunities
                  </div>

                </div>

                <button
                  className="fd-link"
                  onClick={() =>
                    navigate(
                      "/farmer/market"
                    )
                  }
                >
                  View market
                  <ArrowRight size={12} />
                </button>

              </div>


              <div className="fd-market-list">

                {markets.length > 0 ? (
                  markets
                    .slice(0, 4)
                    .map((market, index) => {

                      const change =
                        Number(
                          market.change || 0
                        );

                      return (
                        <div
                          key={
                            market.id ||
                            market._id ||
                            index
                          }
                          className="fd-market-row"
                        >

                          <div className="fd-market-name">

                            <div className="fd-crop-icon">
                              <TrendingUp
                                size={14}
                              />
                            </div>

                            <div>
                              <strong>
                                {market.crop ||
                                  market.name ||
                                  "Market"}
                              </strong>

                              <span>
                                {market.location ||
                                  "Local market"}
                              </span>
                            </div>

                          </div>


                          <div className="fd-price">
                            {money(
                              market.price
                            )}
                            <small>
                              / kg
                            </small>
                          </div>


                          <div
                            className={`
                              fd-trend
                              ${
                                change >= 0
                                  ? "up"
                                  : "down"
                              }
                            `}
                          >

                            {change >= 0 ? (
                              <TrendingUp
                                size={11}
                              />
                            ) : (
                              <TrendingUp
                                size={11}
                              />
                            )}

                            {change >= 0
                              ? "+"
                              : ""}
                            {change}%

                          </div>

                        </div>
                      );
                    })
                ) : (
                  <div className="fd-empty">

                    <div className="fd-empty-icon">
                      <BarChart3
                        size={18}
                      />
                    </div>

                    <strong>
                      No market data yet
                    </strong>

                    <span>
                      Market intelligence will
                      appear here.
                    </span>

                  </div>
                )}

              </div>

            </div>


            {/* QUICK ACTIONS */}

            <div className="fd-panel">

              <div className="fd-panel-head">

                <div>

                  <div className="fd-panel-title">

                    <div
                      className="fd-panel-title-icon"
                      style={{
                        color:
                          "#8069df",
                        background:
                          "#eae5fc",
                      }}
                    >
                      <Zap size={15} />
                    </div>

                    Quick Actions

                  </div>

                  <div className="fd-section-sub">
                    Common farmer tasks
                  </div>

                </div>

              </div>


              <div className="fd-actions">

                <button
                  className="
                    fd-action
                    fd-action-mint
                  "
                  onClick={() =>
                    navigate(
                      "/farmer/crops"
                    )
                  }
                >
                  <div className="fd-action-icon">
                    <Plus size={16} />
                  </div>

                  <div>
                    <strong>
                      Add Crop
                    </strong>

                    <span>
                      Register new harvest
                    </span>
                  </div>

                </button>


                <button
                  className="
                    fd-action
                    fd-action-blue
                  "
                  onClick={() =>
                    navigate(
                      "/farmer/market"
                    )
                  }
                >
                  <div className="fd-action-icon">
                    <BarChart3
                      size={16}
                    />
                  </div>

                  <div>
                    <strong>
                      Check Prices
                    </strong>

                    <span>
                      Compare markets
                    </span>
                  </div>

                </button>


                <button
                  className="
                    fd-action
                    fd-action-violet
                  "
                  onClick={() =>
                    navigate(
                      "/farmer/profit"
                    )
                  }
                >
                  <div className="fd-action-icon">
                    <Sparkles
                      size={16}
                    />
                  </div>

                  <div>
                    <strong>
                      Profit Advisor
                    </strong>

                    <span>
                      Find better returns
                    </span>
                  </div>

                </button>


                <button
                  className="
                    fd-action
                    fd-action-coral
                  "
                  onClick={() =>
                    navigate(
                      "/farmer/storage"
                    )
                  }
                >
                  <div className="fd-action-icon">
                    <Warehouse
                      size={16}
                    />
                  </div>

                  <div>
                    <strong>
                      Find Storage
                    </strong>

                    <span>
                      Protect your harvest
                    </span>
                  </div>

                </button>

              </div>

            </div>

          </div>

        </section>


        {/* =========================================
            CROPS + ORDERS
        ========================================= */}

        <section className="fd-lower">

          {/* CROPS */}

          <div className="fd-panel">

            <div className="fd-panel-head">

              <div>

                <div className="fd-panel-title">

                  <div className="fd-panel-title-icon">
                    <Leaf size={15} />
                  </div>

                  Recent Crops

                </div>

                <div className="fd-section-sub">
                  Your latest farm inventory
                </div>

              </div>

              <button
                className="fd-link"
                onClick={() =>
                  navigate(
                    "/farmer/crops"
                  )
                }
              >
                View all
                <ArrowRight size={12} />
              </button>

            </div>


            <div className="fd-crops">

              {recentCrops.length > 0 ? (
                recentCrops.map(
                  (crop, index) => (
                    <div
                      key={
                        crop.id ||
                        crop._id ||
                        index
                      }
                      className="fd-crop-row"
                    >

                      <div className="fd-crop-info">

                        <div className="fd-crop-symbol">
                          <Leaf size={14} />
                        </div>

                        <div>
                          <strong>
                            {crop.cropName ||
                              crop.name ||
                              "Crop"}
                          </strong>

                          <span>
                            {crop.variety ||
                              "Standard variety"}
                          </span>
                        </div>

                      </div>


                      <div className="fd-crop-value">

                        <strong>
                          {Number(
                            crop.quantity || 0
                          ).toLocaleString(
                            "en-IN"
                          )}{" "}
                          kg
                        </strong>

                        <span>
                          {money(
                            Number(
                              crop.expectedPrice ||
                                0
                            )
                          )}
                          /kg
                        </span>

                      </div>

                    </div>
                  )
                )
              ) : (
                <div className="fd-empty">

                  <div className="fd-empty-icon">
                    <Leaf size={18} />
                  </div>

                  <strong>
                    No crops registered
                  </strong>
                  <br />
                  <span>
                    Add your first crop to
                    start tracking it.
                  </span>

                </div>
              )}

            </div>

          </div>


          {/* ORDERS */}

          <div className="fd-panel">

            <div className="fd-panel-head">

              <div>

                <div className="fd-panel-title">

                  <div
                    className="fd-panel-title-icon"
                    style={{
                      color: "#e8795a",
                      background: "#fbe6df",
                    }}
                  >
                    <ShoppingBag
                      size={15}
                    />
                  </div>

                  Recent Orders

                </div>

                <div className="fd-section-sub">
                  Latest buyer activity
                </div>

              </div>

              <button
                className="fd-link"
                onClick={() =>
                  navigate(
                    "/farmer/orders"
                  )
                }
              >
                View all
                <ArrowRight size={12} />
              </button>

            </div>


            <div className="fd-order-list">

              {recentOrders.length > 0 ? (
                recentOrders.map(
                  (order, index) => (
                    <div
                      key={
                        order.id ||
                        order._id ||
                        index
                      }
                      className="fd-order-row"
                    >

                      <div className="fd-order-icon">
                        <ShoppingBag
                          size={14}
                        />
                      </div>

                      <div className="fd-order-info">

                        <strong>
                          {order.cropName ||
                            order.crop ||
                            order.buyerName ||
                            "Crop order"}
                        </strong>

                        <span>
                          {Number(
                            order.quantity || 0
                          )}{" "}
                          kg
                        </span>

                      </div>

                      <div className="fd-status">
                        {order.status ||
                          "pending"}
                      </div>

                    </div>
                  )
                )
              ) : (
                <div className="fd-empty">

                  <div className="fd-empty-icon">
                    <ShoppingBag
                      size={18}
                    />
                  </div>

                  <strong>
                    No orders yet
                  </strong>
                  <br />
                  <span>
                    Your buyer orders will
                    appear here.
                  </span>

                </div>
              )}

            </div>

          </div>

        </section>


        {/* =========================================
            STORAGE
        ========================================= */}

        <section className="fd-section">

          <div className="fd-panel">

            <div className="fd-panel-head">

              <div>

                <div className="fd-panel-title">

                  <div
                    className="fd-panel-title-icon"
                    style={{
                      color: "#3d8ed8",
                      background: "#e4f0fb",
                    }}
                  >
                    <Warehouse size={15} />
                  </div>

                  Nearby Cold Storage

                </div>

                <div className="fd-section-sub">
                  Storage options closest to you
                </div>

              </div>

              <button
                className="fd-link"
                onClick={() =>
                  navigate(
                    "/farmer/storage"
                  )
                }
              >
                Explore storage
                <ArrowRight size={12} />
              </button>

            </div>


            {nearbyStorages.length > 0 ? (

              <div className="fd-storage-list">

                {nearbyStorages.map(
                  (storage, index) => (
                    <div
                      key={
                        storage.id ||
                        storage._id ||
                        index
                      }
                      className="fd-storage"
                    >

                      <div className="fd-storage-icon">
                        <Warehouse
                          size={15}
                        />
                      </div>

                      <strong>
                        {storage.name ||
                          "Cold Storage"}
                      </strong>

                      <div className="fd-storage-location">
                        <MapPin
                          size={10}
                        />

                        {storage.location ||
                          "Nearby location"}
                      </div>

                      <div className="fd-storage-distance">
                        {storage.distance != null
                          ? `${storage.distance} km away`
                          : "Nearby"}
                      </div>

                    </div>
                  )
                )}

              </div>

            ) : (

              <div className="fd-empty">

                <div className="fd-empty-icon">
                  <Warehouse
                    size={18}
                  />
                </div>

                <strong>
                  No nearby storage found
                </strong>

                <span>
                  Explore the storage network
                  to find available facilities.
                </span>

              </div>

            )}

          </div>

        </section>


        {/* =========================================
            BOTTOM MINI STATUS
        ========================================= */}

        <section
          className="fd-section"
          style={{
            paddingBottom: 24,
          }}
        >

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              padding: "13px 15px",
              borderRadius: 13,
              background: "#17211f",
              color: "#fff",
            }}
          >

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >

              <div
                style={{
                  width: 31,
                  height: 31,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 9,
                  background:
                    "rgba(85,214,180,.10)",
                  color: "#55d6b4",
                }}
              >
                <Bell size={15} />
              </div>

              <div>

                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 900,
                  }}
                >
                  Smart Farmer is ready
                </div>

                <div
                  style={{
                    marginTop: 3,
                    color: "#7d8985",
                    fontSize: 7,
                  }}
                >
                  Use AI Advisor to get
                  personalized selling insights.
                </div>

              </div>

            </div>


            <button
              onClick={() =>
                navigate("/farmer/ai")
              }
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "7px 10px",
                border: 0,
                borderRadius: 8,
                color: "#55d6b4",
                background:
                  "rgba(85,214,180,.08)",
                fontSize: 8,
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              Ask AI
              <ChevronRight size={11} />
            </button>

          </div>

        </section>

      </div>

    </DashboardLayout>
  );
}