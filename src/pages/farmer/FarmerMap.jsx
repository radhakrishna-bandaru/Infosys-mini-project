import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Crosshair,
  IndianRupee,
  MapPin,
  Navigation,
  Search,
  Snowflake,
  Store,
  Warehouse,
} from "lucide-react";

import DashboardLayout from "../../layouts/DashboardLayout";

import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* -------------------------------------------------------
   LOCATION DATA
------------------------------------------------------- */

const locations = [
  {
    id: 1,
    type: "storage",
    name: "GreenFresh Cold Storage",
    location: "Vijayawada",
    lat: 16.5062,
    lng: 80.648,
    distance: 12,
    rent: 2.4,
    available: 320,
    verified: true,
  },
  {
    id: 2,
    type: "storage",
    name: "AgriSafe Storage Hub",
    location: "Guntur",
    lat: 16.3067,
    lng: 80.4365,
    distance: 28,
    rent: 2.1,
    available: 540,
    verified: true,
  },
  {
    id: 3,
    type: "storage",
    name: "FreshFarm Chillers",
    location: "Mangalagiri",
    lat: 16.4308,
    lng: 80.5688,
    distance: 35,
    rent: 2.8,
    available: 210,
    verified: true,
  },
  {
    id: 4,
    type: "market",
    name: "Vijayawada Market",
    location: "Vijayawada",
    lat: 16.5193,
    lng: 80.6305,
    distance: 18,
    price: 55,
    demand: "High",
  },
  {
    id: 5,
    type: "market",
    name: "Guntur Market",
    location: "Guntur",
    lat: 16.3058,
    lng: 80.437,
    distance: 42,
    price: 51,
    demand: "High",
  },
  {
    id: 6,
    type: "market",
    name: "Tenali Market",
    location: "Tenali",
    lat: 16.243,
    lng: 80.64,
    distance: 48,
    price: 47,
    demand: "Medium",
  },
  {
    id: 7,
    type: "buyer",
    name: "FreshMart Buyers",
    location: "Vijayawada",
    lat: 16.492,
    lng: 80.655,
    distance: 21,
    crop: "Tomato",
    requirement: "500 kg",
  },
  {
    id: 8,
    type: "buyer",
    name: "AgroTrade Foods",
    location: "Guntur",
    lat: 16.312,
    lng: 80.43,
    distance: 39,
    crop: "Tomato",
    requirement: "800 kg",
  },
];

const filters = [
  { key: "all", label: "All places" },
  { key: "storage", label: "Cold storages" },
  { key: "market", label: "Markets" },
  { key: "buyer", label: "Buyers" },
];

/* -------------------------------------------------------
   REAL MAP ICONS
------------------------------------------------------- */

function createMarkerIcon(type, active = false) {
  const colors = {
    storage: "#18864b",
    market: "#a4771d",
    buyer: "#467aa0",
    farmer: "#176b3d",
  };

  const color = colors[type] || colors.farmer;

  const symbol =
    type === "storage"
      ? "❄"
      : type === "market"
        ? "₹"
        : type === "buyer"
          ? "●"
          : "⌖";

  return L.divIcon({
    className: "custom-map-marker",
    html: `
      <div style="
        width:${active ? 48 : 42}px;
        height:${active ? 48 : 42}px;
        border-radius:50%;
        background:${color};
        border:4px solid white;
        box-shadow:0 5px 16px rgba(0,0,0,.28);
        display:flex;
        align-items:center;
        justify-content:center;
        color:white;
        font-size:${type === "farmer" ? 22 : 18}px;
        font-weight:900;
        transform:${active ? "scale(1.08)" : "scale(1)"};
        transition:all .2s ease;
      ">
        ${symbol}
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -24],
  });
}

/* -------------------------------------------------------
   MAP CENTER CONTROLLER
------------------------------------------------------- */

function MapCenterController({ position }) {
  const map = useMap();

  const centerMap = () => {
    map.flyTo(position, 12, {
      duration: 1.2,
    });
  };

  return (
    <button
      type="button"
      onClick={centerMap}
      className="absolute right-4 top-4 z-[1000] flex h-11 w-11 items-center justify-center rounded-xl border border-[#dfe6dd] bg-white text-[#526158] shadow-lg transition hover:text-[#18864b]"
      title="Center map"
    >
      <Crosshair size={18} />
    </button>
  );
}

/* -------------------------------------------------------
   GPS BUTTON
------------------------------------------------------- */

function CurrentLocationButton({ onLocationFound }) {
  const [loading, setLoading] = useState(false);

  const findLocation = () => {
    if (!navigator.geolocation) {
      alert("Your browser does not support location access.");
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = [
          position.coords.latitude,
          position.coords.longitude,
        ];

        onLocationFound(coords);
        setLoading(false);
      },
      () => {
        setLoading(false);
        alert(
          "Unable to get your location. Please allow location permission."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  return (
    <button
      type="button"
      onClick={findLocation}
      className="absolute right-4 top-[68px] z-[1000] flex h-11 w-11 items-center justify-center rounded-xl border border-[#dfe6dd] bg-white text-[#526158] shadow-lg transition hover:text-[#18864b]"
      title="Use my current location"
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#18864b] border-t-transparent" />
      ) : (
        <Navigation size={18} />
      )}
    </button>
  );
}

/* -------------------------------------------------------
   MAP CLICK POSITION
------------------------------------------------------- */

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick([e.latlng.lat, e.latlng.lng]);
    },
  });

  return null;
}

/* -------------------------------------------------------
   SELECTED LOCATION POPUP
------------------------------------------------------- */

function LocationPopup({ item, crop }) {
  return (
    <div className="min-w-[220px]">
      <div className="mb-2 flex items-start gap-2">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white ${
            item.type === "storage"
              ? "bg-[#18864b]"
              : item.type === "market"
                ? "bg-[#a4771d]"
                : "bg-[#467aa0]"
          }`}
        >
          {item.type === "storage" && <Snowflake size={17} />}
          {item.type === "market" && <Store size={17} />}
          {item.type === "buyer" && <Warehouse size={17} />}
        </div>

        <div>
          <p className="text-sm font-black text-[#26382c]">
            {item.name}
          </p>

          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-[#7c8880]">
            <MapPin size={10} />
            {item.location}
          </p>
        </div>
      </div>

      {item.type === "storage" && (
        <div className="space-y-1.5 text-[11px]">
          <p>
            <strong>Available:</strong> {item.available} kg
          </p>
          <p>
            <strong>Rent:</strong> ₹{item.rent}/kg
          </p>
          <p>
            <strong>Distance:</strong> {item.distance} km
          </p>
        </div>
      )}

      {item.type === "market" && (
        <div className="space-y-1.5 text-[11px]">
          <p>
            <strong>Price:</strong> ₹{item.price}/kg
          </p>
          <p>
            <strong>Demand:</strong> {item.demand}
          </p>
          <p>
            <strong>Distance:</strong> {item.distance} km
          </p>
        </div>
      )}

      {item.type === "buyer" && (
        <div className="space-y-1.5 text-[11px]">
          <p>
            <strong>Crop:</strong> {crop}
          </p>
          <p>
            <strong>Requirement:</strong> {item.requirement}
          </p>
          <p>
            <strong>Distance:</strong> {item.distance} km
          </p>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------
   FARMER MAP
------------------------------------------------------- */

export default function FarmerMap() {
  const navigate = useNavigate();

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(1);
  const [crop, setCrop] = useState("Tomato");

  const [farmerPosition, setFarmerPosition] = useState([
    16.5062,
    80.648,
  ]);

  const [mapCenter, setMapCenter] = useState([
    16.40,
    80.56,
  ]);

  const [mapZoom, setMapZoom] = useState(10);

  const visibleLocations = useMemo(() => {
    return locations.filter((item) => {
      const matchesFilter =
        filter === "all" || item.type === filter;

      const matchesSearch =
        `${item.name} ${item.location}`
          .toLowerCase()
          .includes(search.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [filter, search]);

  const selected = locations.find(
    (item) => item.id === selectedId
  );

  const handleCurrentLocation = (coords) => {
    setFarmerPosition(coords);
    setMapCenter(coords);
    setMapZoom(13);
  };

  const handleSelectLocation = (item) => {
    setSelectedId(item.id);
    setMapCenter([item.lat, item.lng]);
    setMapZoom(13);
  };

  return (
    <DashboardLayout>
      <div className="farmer-map-page space-y-5 pb-8">

        {/* HEADER */}
        <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
           

            <h1 className="mt-1 text-3xl font-black tracking-tight text-[#1d3024]">
              Explore nearby opportunities
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#748179]">
              Find cold storages, markets and buyers around your
              farming area.
            </p>
          </div>

          <button
            onClick={() => navigate("/farmer/storage")}
            className="sf-button sf-button-secondary"
          >
            <Warehouse size={17} />
            Find Storage
          </button>
        </section>

        {/* CONTROLS */}
        <section className="sf-card p-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

            <div className="flex gap-2 overflow-x-auto">
              {filters.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setFilter(item.key)}
                  className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                    filter === item.key
                      ? "bg-[#18864b] text-white shadow-sm"
                      : "bg-[#f0f5ef] text-[#6d7b72] hover:bg-[#e6f0e6]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">

              <div className="relative w-full sm:w-64">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a097]"
                />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search places..."
                  className="sf-input pl-10"
                />
              </div>

              <div className="relative">
                <select
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  className="sf-input appearance-none pr-9 sm:w-36"
                >
                  <option>Tomato</option>
                  <option>Onion</option>
                  <option>Potato</option>
                  <option>Chilli</option>
                </select>

                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8b978f]"
                />
              </div>

            </div>
          </div>
        </section>

        {/* MAP + LIST */}
        <section className="grid gap-5 xl:grid-cols-[1fr_390px]">

          {/* REAL MAP */}
          <div className="sf-card relative min-h-[620px] overflow-hidden">

            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              scrollWheelZoom={true}
              className="h-[620px] w-full"
            >

              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapCenterController
                position={farmerPosition}
              />

              <CurrentLocationButton
                onLocationFound={handleCurrentLocation}
              />

              <MapClickHandler
                onMapClick={(coords) => {
                  setFarmerPosition(coords);
                }}
              />

              {/* FARMER LOCATION */}
              <Marker
                position={farmerPosition}
                icon={createMarkerIcon("farmer", true)}
              >
                <Popup>
                  <div className="min-w-[170px]">
                    <p className="text-sm font-black text-[#26382c]">
                      Your Location
                    </p>

                    <p className="mt-1 text-[11px] text-[#7c8880]">
                      Current farmer location
                    </p>
                  </div>
                </Popup>
              </Marker>

              {/* STORAGE / MARKET / BUYER MARKERS */}
              {visibleLocations.map((item) => (
                <Marker
                  key={item.id}
                  position={[item.lat, item.lng]}
                  icon={createMarkerIcon(
                    item.type,
                    item.id === selectedId
                  )}
                  eventHandlers={{
                    click: () => {
                      setSelectedId(item.id);
                    },
                  }}
                >
                  <Popup>
                    <LocationPopup
                      item={item}
                      crop={crop}
                    />
                  </Popup>
                </Marker>
              ))}

            </MapContainer>

            {/* LEGEND */}
            <div className="absolute bottom-4 left-4 z-[1000] rounded-2xl border border-[#dfe6dd] bg-white/95 p-3 shadow-lg backdrop-blur">

              <p className="mb-2 text-[9px] font-black uppercase tracking-wide text-[#8b978f]">
                Map legend
              </p>

              <div className="flex flex-wrap gap-3">

                <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#68766d]">
                  <span className="h-3 w-3 rounded-full bg-[#18864b]" />
                  Storage
                </span>

                <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#68766d]">
                  <span className="h-3 w-3 rounded-full bg-[#a4771d]" />
                  Market
                </span>

                <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#68766d]">
                  <span className="h-3 w-3 rounded-full bg-[#467aa0]" />
                  Buyer
                </span>

                <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#68766d]">
                  <span className="h-3 w-3 rounded-full bg-[#176b3d]" />
                  You
                </span>

              </div>
            </div>

          </div>

          {/* SIDE LIST */}
          <aside className="sf-card flex min-h-[620px] flex-col overflow-hidden">

            <div className="border-b border-[#e7ece5] p-5">

              <div className="flex items-center justify-between">

                <div>
                  <h2 className="font-black text-[#293b30]">
                    Nearby places
                  </h2>

                  <p className="mt-1 text-[11px] text-[#89958d]">
                    {visibleLocations.length} places available
                  </p>
                </div>

                <MapPin
                  size={19}
                  className="text-[#18864b]"
                />

              </div>

            </div>

            <div className="flex-1 divide-y divide-[#edf0eb] overflow-y-auto">

              {visibleLocations.map((item) => {
                const active = selectedId === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectLocation(item)}
                    className={`w-full p-4 text-left transition ${
                      active
                        ? "bg-[#f0f8f1]"
                        : "hover:bg-[#fbfdfb]"
                    }`}
                  >
                    <div className="flex items-start gap-3">

                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white ${
                          item.type === "storage"
                            ? "bg-[#18864b]"
                            : item.type === "market"
                              ? "bg-[#a4771d]"
                              : "bg-[#467aa0]"
                        }`}
                      >
                        {item.type === "storage" && (
                          <Snowflake size={17} />
                        )}

                        {item.type === "market" && (
                          <Store size={17} />
                        )}

                        {item.type === "buyer" && (
                          <Warehouse size={17} />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">

                        <div className="flex items-start justify-between gap-2">

                          <div>
                            <p className="truncate text-sm font-black text-[#33463a]">
                              {item.name}
                            </p>

                            <p className="mt-0.5 flex items-center gap-1 text-[10px] text-[#89958d]">
                              <MapPin size={10} />
                              {item.location}
                            </p>
                          </div>

                          <span className="shrink-0 text-[10px] font-black text-[#18864b]">
                            {item.distance} km
                          </span>

                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">

                          {item.type === "storage" && (
                            <>
                              <span className="rounded-lg bg-[#edf7ee] px-2 py-1 text-[9px] font-bold text-[#25804a]">
                                {item.available} kg free
                              </span>

                              <span className="rounded-lg bg-[#f5f7f4] px-2 py-1 text-[9px] font-bold text-[#748078]">
                                ₹{item.rent}/kg
                              </span>

                              {item.verified && (
                                <span className="flex items-center gap-1 rounded-lg bg-[#edf7ee] px-2 py-1 text-[9px] font-bold text-[#25804a]">
                                  <CheckCircle2 size={9} />
                                  Verified
                                </span>
                              )}
                            </>
                          )}

                          {item.type === "market" && (
                            <>
                              <span className="flex items-center gap-1 rounded-lg bg-[#fff6df] px-2 py-1 text-[9px] font-bold text-[#906d1d]">
                                <IndianRupee size={9} />
                                ₹{item.price}/kg
                              </span>

                              <span className="rounded-lg bg-[#edf7ee] px-2 py-1 text-[9px] font-bold text-[#25804a]">
                                {item.demand} demand
                              </span>
                            </>
                          )}

                          {item.type === "buyer" && (
                            <>
                              <span className="rounded-lg bg-[#edf4f9] px-2 py-1 text-[9px] font-bold text-[#527a94]">
                                {crop}
                              </span>

                              <span className="rounded-lg bg-[#f5f7f4] px-2 py-1 text-[9px] font-bold text-[#748078]">
                                Need {item.requirement}
                              </span>
                            </>
                          )}

                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}

              {visibleLocations.length === 0 && (
                <div className="px-5 py-16 text-center">

                  <MapPin
                    size={28}
                    className="mx-auto text-[#a0aba3]"
                  />

                  <p className="mt-3 text-sm font-black text-[#405147]">
                    No places found
                  </p>

                  <p className="mt-1 text-xs text-[#8a968e]">
                    Try another search or filter.
                  </p>

                </div>
              )}

            </div>

            {/* SELECTED ACTION */}
            {selected && (
              <div className="border-t border-[#e7ece5] bg-[#f8faf7] p-4">

                <p className="text-[10px] font-black uppercase tracking-wide text-[#8b978f]">
                  Selected
                </p>

                <p className="mt-1 truncate text-sm font-black text-[#33463a]">
                  {selected.name}
                </p>

                <button
                  onClick={() => {
                    if (selected.type === "storage") {
                      navigate(`/farmer/storage/${selected.id}`);
                    }

                    if (selected.type === "market") {
                      navigate("/farmer/market");
                    }

                    if (selected.type === "buyer") {
                      navigate("/farmer/buyers");
                    }
                  }}
                  className="sf-button sf-button-primary mt-3 w-full"
                >
                  View Details
                  <ArrowRight size={15} />
                </button>

              </div>
            )}

          </aside>
        </section>

        {/* INFO CARDS */}
        <section className="grid gap-4 md:grid-cols-3">

          <div className="sf-card p-5">
            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf7ee] text-[#18864b]">
                <Snowflake size={18} />
              </div>

              <div>
                <p className="font-black text-[#33463a]">
                  Cold storage
                </p>

                <p className="text-[11px] text-[#87938b]">
                  Preserve your harvest longer.
                </p>
              </div>

            </div>
          </div>

          <div className="sf-card p-5">
            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff6df] text-[#a4771d]">
                <Store size={18} />
              </div>

              <div>
                <p className="font-black text-[#33463a]">
                  Better markets
                </p>

                <p className="text-[11px] text-[#87938b]">
                  Compare prices before selling.
                </p>
              </div>

            </div>
          </div>

          <div className="sf-card p-5">
            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf4f9] text-[#467aa0]">
                <Warehouse size={18} />
              </div>

              <div>
                <p className="font-black text-[#33463a]">
                  Direct buyers
                </p>

                <p className="text-[11px] text-[#87938b]">
                  Find demand near your location.
                </p>
              </div>

            </div>
          </div>

        </section>

      </div>
    </DashboardLayout>
  );
}