function sfRenderCrops(){
  const crops = getCropData();
  const wrap = document.getElementById("crops-grid");
  const empty = document.getElementById("crops-empty");

  if (!crops.length){
    wrap.innerHTML = "";
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";

  wrap.innerHTML = crops.map(c => {
    const price = cropCurrentPrice(c.name);
    const estValue = Math.round(price * c.quantityKg / 100);
    return `
    <div class="card shadow-card reveal">
      <div class="flex-between">
        <div class="flex gap-8" style="align-items:center;">
          <span style="font-size:26px;">${CROP_ICONS[c.name]||'🌱'}</span>
          <div>
            <strong style="font-size:16px;">${c.name}</strong>
            <div class="text-sm text-muted">${c.variety||''}</div>
          </div>
        </div>
        <button class="btn-ghost btn-sm" style="border-radius:50%;width:32px;height:32px;padding:0;" title="Remove crop" onclick="sfDeleteCrop('${c.id}')"><i class="bi bi-trash3"></i></button>
      </div>
      <div class="divider"></div>
      <div class="grid-2" style="gap:12px;">
        <div><div class="text-sm text-muted">Quantity</div><div style="font-weight:600;">${c.quantityKg.toLocaleString('en-IN')} KG</div></div>
        <div><div class="text-sm text-muted">Quality</div><div><span class="badge ${c.quality==='Grade A'?'badge-green':'badge-gold'}">${c.quality}</span></div></div>
        <div><div class="text-sm text-muted">Harvest</div><div style="font-weight:600;">${new Date(c.harvestDate).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</div></div>
        <div><div class="text-sm text-muted">Current Price</div><div style="font-weight:600;">₹${price.toLocaleString('en-IN')}/Quintal</div></div>
      </div>
      <div class="card-flat mt-16" style="padding:12px 16px;">
        <div class="text-sm text-muted">Estimated Value</div>
        <div style="font-family:var(--font-display);font-size:22px;color:var(--forest-700);">₹${estValue.toLocaleString('en-IN')}</div>
      </div>
      <div class="flex gap-8 mt-16" style="flex-wrap:wrap;">
        <a href="cold-storage.html?crop=${encodeURIComponent(c.name)}" class="btn btn-outline btn-sm">Find Storage</a>
        <a href="market-prices.html?crop=${encodeURIComponent(c.name)}" class="btn btn-outline btn-sm">Market Price</a>
        <a href="sell-smart.html?crop=${encodeURIComponent(c.name)}" class="btn btn-primary btn-sm">Find Buyer</a>
      </div>
    </div>`;
  }).join("");
}

function sfDeleteCrop(id){
  deleteCrop(id);
  sfToast("Crop removed");
  sfRenderCrops();
}

function sfInitCropsPage(){
  sfRenderCrops();
  const cropSelect = document.getElementById("new-crop-name");
  SF_DATA.cropCatalog.forEach(c=>{
    const o = document.createElement("option"); o.value=c; o.textContent = (CROP_ICONS[c]||"🌱")+" "+c; cropSelect.appendChild(o);
  });

  document.getElementById("add-crop-form").addEventListener("submit", (e)=>{
    e.preventDefault();
    const crop = {
      name: document.getElementById("new-crop-name").value,
      variety: document.getElementById("new-crop-variety").value || "Standard",
      quantityKg: parseFloat(document.getElementById("new-crop-qty").value) || 0,
      quality: document.getElementById("new-crop-quality").value,
      harvestDate: document.getElementById("new-crop-harvest").value || new Date().toISOString().slice(0,10),
      sellByDate: document.getElementById("new-crop-sellby").value || new Date().toISOString().slice(0,10),
    };
    addCrop(crop);
    sfToast(`${crop.name} added to My Crops`);
    sfCloseModal("add-crop-modal");
    e.target.reset();
    sfRenderCrops();
  });
}
