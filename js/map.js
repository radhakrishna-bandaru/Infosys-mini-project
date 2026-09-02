let sfMap = null;
let sfMarkers = [];

const SF_FARMER_LOCATION = {lat:17.4239, lng:78.4738, name:"Your Farm"};

function sfIconFor(type){
  const colors = {storage:"#2D6A4F", buyer:"#D4A017", farmer:"#B3402E", market:"#3F8863", collection:"#A9744F"};
  const emojis = {storage:"❄️", buyer:"🤝", farmer:"📍", market:"🏪", collection:"🚚"};
  return L.divIcon({
    className:"",
    html:`<div style="background:${colors[type]};width:34px;height:34px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 3px 8px rgba(0,0,0,.3);border:2px solid #fff;">
            <span style="transform:rotate(45deg);font-size:15px;">${emojis[type]}</span>
          </div>`,
    iconSize:[34,34], iconAnchor:[17,34], popupAnchor:[0,-30]
  });
}

function sfInitMap(){
  sfMap = L.map("sf-map", {zoomControl:true}).setView([SF_FARMER_LOCATION.lat, SF_FARMER_LOCATION.lng], 7);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 18
  }).addTo(sfMap);

  sfPlotMarkers();

  document.getElementById("map-locate-btn").addEventListener("click", ()=>{
    if (!navigator.geolocation){ sfToast("Geolocation not supported by this browser"); return; }
    navigator.geolocation.getCurrentPosition(
      pos=>{
        sfMap.setView([pos.coords.latitude, pos.coords.longitude], 11);
        L.marker([pos.coords.latitude, pos.coords.longitude], {icon: sfIconFor("farmer")}).addTo(sfMap).bindPopup("You are here").openPopup();
        sfToast("Location found");
      },
      ()=> sfToast("Location permission denied — showing default location"),
      {timeout:6000}
    );
  });

  document.querySelectorAll(".map-layer-toggle").forEach(cb=>{
    cb.addEventListener("change", sfPlotMarkers);
  });

  const params = new URLSearchParams(window.location.search);
  if (params.get("focus")){
    const s = getStorageById(params.get("focus"));
    if (s){ sfMap.setView([s.lat, s.lng], 12); }
  }
}

function sfPlotMarkers(){
  sfMarkers.forEach(m=>sfMap.removeLayer(m));
  sfMarkers = [];

  const showStorage = document.getElementById("layer-storage")?.checked ?? true;
  const showBuyers = document.getElementById("layer-buyers")?.checked ?? true;

  const farmerMarker = L.marker([SF_FARMER_LOCATION.lat, SF_FARMER_LOCATION.lng], {icon: sfIconFor("farmer")})
    .addTo(sfMap).bindPopup(`<strong>${SF_FARMER_LOCATION.name}</strong><br>Your registered location`);
  sfMarkers.push(farmerMarker);

  if (showStorage){
    SF_DATA.storages.forEach(s=>{
      const m = L.marker([s.lat, s.lng], {icon: sfIconFor("storage")}).addTo(sfMap);
      m.bindPopup(`
        <strong>${s.name}</strong><br>
        ⭐ ${s.rating} · ${s.distanceKm} km<br>
        ₹${s.pricePerKgDay.toFixed(2)}/kg/day<br>
        <div style="margin-top:8px;display:flex;gap:6px;">
          <a href="storage-details.html?id=${s.id}" style="color:#1B4332;font-weight:600;">View Details</a>
        </div>`);
      sfMarkers.push(m);
    });
  }
  if (showBuyers){
    SF_DATA.buyers.forEach(b=>{
      const m = L.marker([b.lat, b.lng], {icon: sfIconFor("buyer")}).addTo(sfMap);
      m.bindPopup(`<strong>${b.name}</strong><br>⭐ ${b.rating} · ${b.distanceKm} km<br>${b.payment}`);
      sfMarkers.push(m);
    });
  }
}
