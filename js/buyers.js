function sfRenderSellSmart(){
  const crop = document.getElementById("sell-crop").value;
  const buyers = getBuyers({crop}).slice(0,6);
  const wrap = document.getElementById("recommended-buyers");
  const saved = getSavedBuyers();

  if (!buyers.length){
    wrap.innerHTML = `<div class="card" style="text-align:center;padding:40px;"><p class="text-muted">No buyers currently listed for ${crop}. Try another crop.</p></div>`;
    document.getElementById("comparison-section").style.display = "none";
    return;
  }
  document.getElementById("comparison-section").style.display = "block";

  wrap.innerHTML = buyers.map((b,i)=>{
    const match = Math.min(98, 70 + Math.round(b.rating*4) - Math.round(b.distanceKm/20));
    const reasons = [];
    if (i===0) reasons.push("Better price");
    if (b.distanceKm < 25) reasons.push("Nearby");
    reasons.push(`Accepts ${document.getElementById("sell-quality")?.value || 'Grade A'}`);
    if (b.payment.includes("24")) reasons.push("Fast payment");
    return `
    <div class="card shadow-card reveal">
      <div class="flex-between">
        <div class="flex gap-8" style="align-items:center;">
          ${i===0 ? '<span style="font-size:18px;">🏆</span>' : ''}
          <strong style="font-size:16px;">${b.name}</strong>
        </div>
        <span class="badge badge-green">${match}% Match</span>
      </div>
      <div class="grid-2 mt-16" style="gap:10px;">
        <div><div class="text-sm text-muted">Offer</div><div style="font-weight:700;color:var(--forest-700);font-size:17px;">₹${b.offer.toLocaleString('en-IN')} / Quintal</div></div>
        <div><div class="text-sm text-muted">Distance</div><div style="font-weight:600;">${b.distanceKm} KM</div></div>
        <div><div class="text-sm text-muted">Rating</div><div class="stars">${sfStarString ? sfStarString(b.rating) : ''} ${b.rating}</div></div>
        <div><div class="text-sm text-muted">Payment</div><div style="font-weight:600;">${b.payment}</div></div>
      </div>
      <div class="mt-16">
        ${reasons.map(r=>`<div class="text-sm" style="color:var(--forest-600);margin-bottom:4px;"><i class="bi bi-check-circle-fill"></i> ${r}</div>`).join("")}
      </div>
      <div class="flex gap-8 mt-16">
        <button class="btn btn-primary btn-sm" style="flex:1;" onclick="sfSellToBuyer('${b.id}','${crop}')">Sell to Buyer</button>
        <button class="btn-ghost" style="padding:6px;font-size:17px;color:${saved.includes(b.id)?'var(--sun-600)':'var(--ink-300)'};" onclick="sfToggleSaveBuyer('${b.id}', this)"><i class="bi ${saved.includes(b.id)?'bi-star-fill':'bi-star'}"></i></button>
      </div>
    </div>`;
  }).join("");

  // Comparison table — top 3
  const top3 = buyers.slice(0,3);
  const rows = [
    {label:"Price", fn:b=>`₹${b.offer.toLocaleString('en-IN')}`},
    {label:"Distance", fn:b=>`${b.distanceKm} km`},
    {label:"Rating", fn:b=>b.rating},
    {label:"Payment", fn:b=>b.payment},
  ];
  const bestIdx = top3.reduce((best,b,i,arr)=> b.offer>arr[best].offer ? i : best, 0);
  let html = `<table class="table"><thead><tr><th>Feature</th>${top3.map((b,i)=>`<th style="${i===bestIdx?'color:var(--forest-700);':''}">${b.name}${i===bestIdx?' 🏆':''}</th>`).join("")}</tr></thead><tbody>`;
  rows.forEach(r=>{
    html += `<tr>${''}<td>${r.label}</td>${top3.map((b,i)=>`<td class="${i===bestIdx?'':''}" style="${i===bestIdx?'font-weight:700;color:var(--forest-700);':''}">${r.fn(b)}</td>`).join("")}</tr>`;
  });
  html += `</tbody></table>`;
  document.getElementById("buyer-comparison-table").innerHTML = html;
}

function sfSellToBuyer(buyerId, crop){
  const b = getBuyerById(buyerId);
  const notifs = getNotifications();
  notifs.unshift({id:Date.now(), icon:"🤝", title:"Deal initiated", body:`You accepted ${b.name}'s offer for your ${crop}.`, time:"Just now", read:false, type:"buyer"});
  localStorage.setItem("sf_notifications", JSON.stringify(notifs));
  sfToast(`Deal started with ${b.name}! They'll contact you shortly.`);
}

function sfToggleSaveBuyer(id, btn){
  const saved = toggleSavedBuyer(id);
  const icon = btn.querySelector("i");
  const isSaved = saved.includes(id);
  icon.className = isSaved ? "bi bi-star-fill" : "bi bi-star";
  btn.style.color = isSaved ? "var(--sun-600)" : "var(--ink-300)";
}

function sfInitSellSmart(){
  const params = new URLSearchParams(window.location.search);
  const cropSelect = document.getElementById("sell-crop");
  SF_DATA.cropCatalog.forEach(c=>{ const o=document.createElement("option"); o.value=c; o.textContent=(CROP_ICONS[c]||"🌱")+" "+c; cropSelect.appendChild(o); });
  if (params.get("crop")) cropSelect.value = params.get("crop");

  const profile = getFarmerProfile();
  const crops = getCropData();
  const matchCrop = crops.find(c=>c.name===cropSelect.value);
  document.getElementById("sell-quantity").value = matchCrop ? matchCrop.quantityKg : 5000;
  document.getElementById("sell-location").value = `${profile.village}, ${profile.state}`;

  cropSelect.addEventListener("change", sfRenderSellSmart);
  document.getElementById("sell-quality").addEventListener("change", sfRenderSellSmart);

  sfRenderSellSmart();
}

/* --------------- All buyers directory (buyers.html) --------------- */
function sfInitBuyersDirectory(){
  const cropSelect = document.getElementById("buyers-filter-crop");
  SF_DATA.cropCatalog.forEach(c=>{ const o=document.createElement("option"); o.value=c; o.textContent=(CROP_ICONS[c]||"🌱")+" "+c; cropSelect.appendChild(o); });

  function render(){
    const crop = cropSelect.value;
    const buyers = crop ? getBuyers({crop}) : SF_DATA.buyers.map(b=>({...b, offer:Object.values(b.pricePerQuintal)[0]}));
    const saved = getSavedBuyers();
    document.getElementById("buyers-directory-list").innerHTML = buyers.map(b=>`
      <div class="card shadow-card reveal">
        <div class="flex-between">
          <strong style="font-size:16px;">${b.name}</strong>
          <button class="btn-ghost" style="padding:4px;font-size:17px;color:${saved.includes(b.id)?'var(--sun-600)':'var(--ink-300)'};" onclick="sfToggleSaveBuyer('${b.id}', this)"><i class="bi ${saved.includes(b.id)?'bi-star-fill':'bi-star'}"></i></button>
        </div>
        <div class="text-sm text-muted mt-8"><i class="bi bi-geo-alt"></i> ${b.city} · ${b.distanceKm} km · <span class="stars">${sfStarString(b.rating)}</span> ${b.rating}</div>
        <div class="flex gap-6 mt-16" style="flex-wrap:wrap;">${b.crops.map(c=>`<span class="chip" style="padding:5px 10px;font-size:12px;">${CROP_ICONS[c]||'🌱'} ${c}</span>`).join("")}</div>
        <div class="flex-between mt-16">
          <div><div class="text-sm text-muted">Payment</div><div style="font-weight:600;font-size:13.5px;">${b.payment}</div></div>
          <a href="sell-smart.html?crop=${encodeURIComponent(crop||b.crops[0])}" class="btn btn-primary btn-sm">View Offer</a>
        </div>
      </div>`).join("");
  }
  cropSelect.addEventListener("change", render);
  render();
}
