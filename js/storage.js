function sfStarString(rating){
  const full = Math.round(rating);
  return "★".repeat(full) + "☆".repeat(5-full);
}

function sfRenderStorageList(){
  const params = new URLSearchParams(window.location.search);
  const filters = {
    query: document.getElementById("storage-search").value.trim(),
    crop: document.getElementById("filter-crop").value,
    maxDistance: document.getElementById("filter-distance").value ? parseFloat(document.getElementById("filter-distance").value) : null,
    maxPrice: document.getElementById("filter-price").value ? parseFloat(document.getElementById("filter-price").value) : null,
    minRating: document.getElementById("filter-rating").value ? parseFloat(document.getElementById("filter-rating").value) : null,
    sort: document.getElementById("filter-sort").value,
  };
  const list = getColdStorages(filters);
  const wrap = document.getElementById("storage-list");
  const countEl = document.getElementById("storage-count");
  countEl.textContent = `${list.length} facilities found`;

  if (!list.length){
    wrap.innerHTML = `<div class="card" style="text-align:center;padding:50px;grid-column:1/-1;"><div style="font-size:32px;">🔍</div><p class="mt-16 text-muted">No cold storage matches your filters. Try widening your search.</p></div>`;
    return;
  }

  const saved = getSavedStorages();
  wrap.innerHTML = list.map(s=>`
    <div class="card shadow-card reveal">
      <div class="flex-between">
        <strong style="font-size:16.5px;">${s.name}</strong>
        <button class="btn-ghost" style="padding:4px;font-size:18px;color:${saved.includes(s.id)?'var(--sun-600)':'var(--ink-300)'};" onclick="sfToggleSaveStorage('${s.id}', this)" aria-label="Save"><i class="bi ${saved.includes(s.id)?'bi-star-fill':'bi-star'}"></i></button>
      </div>
      <div class="flex gap-8 text-sm text-muted mt-8" style="align-items:center;">
        <span class="stars">${sfStarString(s.rating)}</span> ${s.rating} (${s.reviews}) · <i class="bi bi-geo-alt"></i> ${s.distanceKm} km away
      </div>
      <div class="grid-2 mt-16" style="gap:10px;">
        <div><div class="text-sm text-muted">Capacity</div><div style="font-weight:600;">${s.capacityTons.toLocaleString('en-IN')} Tons</div></div>
        <div><div class="text-sm text-muted">Available</div><div style="font-weight:600;color:var(--forest-600);">${s.availableTons.toLocaleString('en-IN')} Tons</div></div>
        <div><div class="text-sm text-muted">Temperature</div><div style="font-weight:600;">${s.tempMin}°C – ${s.tempMax}°C</div></div>
        <div><div class="text-sm text-muted">Price</div><div style="font-weight:600;">₹${s.pricePerKgDay.toFixed(2)} / KG / Day</div></div>
      </div>
      <div class="flex gap-6 mt-16" style="flex-wrap:wrap;">
        ${s.crops.map(c=>`<span class="chip" style="padding:5px 10px;font-size:12px;">${CROP_ICONS[c]||'🌱'} ${c}</span>`).join("")}
      </div>
      <div class="flex gap-8 mt-16" style="flex-wrap:wrap;">
        <a href="storage-details.html?id=${s.id}" class="btn btn-outline btn-sm">View Details</a>
        <a href="map.html?focus=${s.id}" class="btn btn-outline btn-sm">Navigate</a>
        <button class="btn btn-primary btn-sm" onclick="sfBookStorage('${s.id}')">Book Storage</button>
      </div>
    </div>
  `).join("");
}

function sfToggleSaveStorage(id, btn){
  const saved = toggleSavedStorage(id);
  const icon = btn.querySelector("i");
  const isSaved = saved.includes(id);
  icon.className = isSaved ? "bi bi-star-fill" : "bi bi-star";
  btn.style.color = isSaved ? "var(--sun-600)" : "var(--ink-300)";
  sfToast(isSaved ? "Saved to favourites" : "Removed from favourites");
}

function sfBookStorage(id){
  const s = getStorageById(id);
  const notifs = getNotifications();
  notifs.unshift({id:Date.now(), icon:"✅", title:"Storage booking confirmed", body:`Your booking at ${s.name} is confirmed.`, time:"Just now", read:false, type:"storage"});
  localStorage.setItem("sf_notifications", JSON.stringify(notifs));
  sfToast(`Booking confirmed at ${s.name}!`);
}

function sfInitStorageFilters(){
  const cropSelect = document.getElementById("filter-crop");
  SF_DATA.cropCatalog.forEach(c=>{ const o=document.createElement("option"); o.value=c; o.textContent=(CROP_ICONS[c]||"🌱")+" "+c; cropSelect.appendChild(o); });

  const params = new URLSearchParams(window.location.search);
  if (params.get("crop")) cropSelect.value = params.get("crop");

  ["storage-search","filter-crop","filter-distance","filter-price","filter-rating","filter-sort"].forEach(id=>{
    document.getElementById(id).addEventListener("input", sfRenderStorageList);
    document.getElementById(id).addEventListener("change", sfRenderStorageList);
  });

  sfRenderStorageList();
}

/* ---------------- Storage details page ---------------- */
function sfInitStorageDetails(){
  const params = new URLSearchParams(window.location.search);
  const s = getStorageById(params.get("id")) || SF_DATA.storages[0];

  document.getElementById("sd-name").textContent = s.name;
  document.getElementById("sd-rating").innerHTML = `<span class="stars">${sfStarString(s.rating)}</span> ${s.rating} (${s.reviews} reviews)`;
  document.getElementById("sd-address").textContent = s.address;
  document.getElementById("sd-capacity").textContent = `${s.capacityTons.toLocaleString('en-IN')} Tons`;
  document.getElementById("sd-available").textContent = `${s.availableTons.toLocaleString('en-IN')} Tons`;
  document.getElementById("sd-temp").textContent = `${s.tempMin}°C – ${s.tempMax}°C`;
  document.getElementById("sd-humidity").textContent = s.humidity;
  document.getElementById("sd-security").textContent = s.security;
  document.getElementById("sd-power").textContent = s.power;
  document.getElementById("sd-price").textContent = `₹${s.pricePerKgDay.toFixed(2)} / KG / Day`;
  document.getElementById("sd-crops").innerHTML = s.crops.map(c=>`<span class="chip">${CROP_ICONS[c]||'🌱'} ${c}</span>`).join("");

  const availPct = Math.round((s.availableTons/s.capacityTons)*100);
  document.getElementById("sd-avail-bar").innerHTML = `<span style="width:${availPct}%;"></span>`;
  document.getElementById("sd-avail-pct").textContent = `${availPct}% space free`;

  document.getElementById("sd-book-btn").addEventListener("click", ()=> sfBookStorage(s.id));
  document.getElementById("sd-navigate-btn").href = `map.html?focus=${s.id}`;

  // Calculator
  const calcCrop = document.getElementById("calc-crop");
  SF_DATA.cropCatalog.forEach(c=>{ const o=document.createElement("option"); o.value=c; o.textContent=c; calcCrop.appendChild(o); });
  document.getElementById("calc-price").value = s.pricePerKgDay;

  function recalc(){
    const qty = parseFloat(document.getElementById("calc-qty").value) || 0;
    const days = parseFloat(document.getElementById("calc-days").value) || 0;
    const price = parseFloat(document.getElementById("calc-price").value) || 0;
    const total = qty * days * price;
    document.getElementById("calc-result").textContent = `₹${Math.round(total).toLocaleString('en-IN')}`;
  }
  ["calc-qty","calc-days","calc-price"].forEach(id=>document.getElementById(id).addEventListener("input", recalc));
  recalc();

  // reviews (mock)
  const reviews = [
    {name:"Ramesh K.", rating:5, text:"Kept my tomatoes fresh for 10 days, great cooling consistency."},
    {name:"Lakshmi P.", rating:4, text:"Good service, slightly far from my village but worth it."},
    {name:"Aditya S.", rating:5, text:"Staff helped load and unload quickly. Highly recommend."},
  ];
  document.getElementById("sd-reviews").innerHTML = reviews.map(r=>`
    <div class="card-flat" style="padding:14px 16px;">
      <div class="flex-between"><strong style="font-size:14px;">${r.name}</strong><span class="stars">${sfStarString(r.rating)}</span></div>
      <p class="text-sm text-muted mt-8">${r.text}</p>
    </div>`).join("");
}
