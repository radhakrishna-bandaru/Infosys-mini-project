function sfInitDashboard(){
  const profile = getFarmerProfile();
  const crops = getCropData();
  const storages = getColdStorages();
  const notifications = getNotifications();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  document.getElementById("dash-greeting").textContent = `${greeting}, ${profile.name.split(" ")[0]} 👋`;
  document.getElementById("dash-farmerid").textContent = profile.farmerId;
  document.getElementById("dash-location").textContent = `${profile.village}, ${profile.state}`;

  // Overview counters
  document.getElementById("stat-crops").setAttribute("data-counter", crops.length);
  document.getElementById("stat-storage").setAttribute("data-counter", storages.length);
  document.getElementById("stat-buyers").setAttribute("data-counter", getBuyers({crop:profile.mainCrop}).length);
  const marketAvg = getMarketPrices({crop:profile.mainCrop});
  const change = marketAvg.length ? (marketAvg.reduce((s,m)=>s+m.change,0)/marketAvg.length) : 0;
  const trendEl = document.getElementById("stat-trend");
  trendEl.setAttribute("data-counter", change.toFixed(1));
  trendEl.setAttribute("data-decimals","1");
  trendEl.setAttribute("data-suffix","%");
  trendEl.setAttribute("data-prefix", change>=0?"+":"");
  sfAnimateCounters();

  // Smart recommendation — based on main crop
  const rec = getMarketPrices({crop:profile.mainCrop})[0] || {current:2000, change:5};
  const expected = Math.round(rec.current * (1 + Math.max(rec.change,3)/100));
  const bestStorage = getColdStorages({crop:profile.mainCrop})[0];
  const cropQty = (crops.find(c=>c.name===profile.mainCrop) || crops[0] || {quantityKg:1000}).quantityKg;
  const potentialValue = Math.round((expected - rec.current) * cropQty / 100);

  document.getElementById("rec-crop-icon").textContent = CROP_ICONS[profile.mainCrop] || "🌱";
  document.getElementById("rec-crop-name").textContent = profile.mainCrop;
  document.getElementById("rec-current-price").textContent = `₹${rec.current.toLocaleString('en-IN')} / Quintal`;
  document.getElementById("rec-expected-price").textContent = `₹${expected.toLocaleString('en-IN')} / Quintal`;
  document.getElementById("rec-storage-status").textContent = bestStorage ? `Available (${bestStorage.name})` : "Limited";
  document.getElementById("rec-days").textContent = rec.change > 6 ? "Store for 5–7 days" : "Sell now — prices are stable";
  document.getElementById("rec-value").textContent = `₹${Math.max(potentialValue,1500).toLocaleString('en-IN')}`;

  document.getElementById("rec-find-storage").addEventListener("click", ()=> window.location.href = `cold-storage.html?crop=${encodeURIComponent(profile.mainCrop)}`);
  document.getElementById("rec-sell-now").addEventListener("click", ()=> window.location.href = `sell-smart.html?crop=${encodeURIComponent(profile.mainCrop)}`);

  // Recent crops preview
  const cropsWrap = document.getElementById("dash-crops-preview");
  cropsWrap.innerHTML = crops.slice(0,3).map(c => `
    <div class="card shadow-card">
      <div class="flex-between">
        <div class="flex gap-8" style="align-items:center;"><span style="font-size:22px;">${CROP_ICONS[c.name]||'🌱'}</span><strong>${c.name}</strong></div>
        <span class="badge badge-green">${c.quality}</span>
      </div>
      <div class="text-sm text-muted mt-16">${c.quantityKg.toLocaleString('en-IN')} KG · Harvested ${new Date(c.harvestDate).toLocaleDateString('en-IN',{day:'2-digit',month:'short'})}</div>
      <div style="font-family:var(--font-display);font-size:20px;margin-top:10px;">₹${cropCurrentPrice(c.name).toLocaleString('en-IN')}<span class="text-sm text-muted"> /quintal</span></div>
    </div>`).join("");

  // Notifications preview
  const notifWrap = document.getElementById("dash-notif-preview");
  notifWrap.innerHTML = notifications.slice(0,4).map(n=>`
    <div class="flex gap-12" style="align-items:flex-start;padding:12px 0;border-bottom:1px solid var(--paper-200);">
      <span style="font-size:18px;">${n.icon}</span>
      <div>
        <div style="font-size:14px;font-weight:600;">${n.title}</div>
        <div class="text-sm text-muted">${n.time}</div>
      </div>
      ${!n.read ? '<span class="badge badge-red" style="margin-left:auto;">New</span>' : ''}
    </div>`).join("");
}
