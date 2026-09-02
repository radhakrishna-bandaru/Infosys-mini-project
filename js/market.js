let sfPriceChart = null;

function sfRenderPriceCards(){
  const crop = document.getElementById("market-filter-crop").value;
  const state = document.getElementById("market-filter-state").value;
  const list = getMarketPrices({crop: crop||undefined, state: state||undefined});
  const wrap = document.getElementById("market-cards");

  if (!list.length){
    wrap.innerHTML = `<div class="card" style="grid-column:1/-1;text-align:center;padding:40px;"><p class="text-muted">No records match these filters.</p></div>`;
    return;
  }

  wrap.innerHTML = list.map(m=>`
    <div class="card shadow-card reveal">
      <div class="flex-between">
        <div class="flex gap-8" style="align-items:center;"><span style="font-size:20px;">${CROP_ICONS[m.crop]||'🌱'}</span><strong>${m.crop}</strong></div>
        <span class="badge ${m.change>=0?'badge-green':'badge-red'}">${m.change>=0?'🟢':'🔴'} ${m.change>=0?'+':''}${m.change}%</span>
      </div>
      <div class="text-sm text-muted mt-8">${m.market}, ${m.state}</div>
      <div style="font-family:var(--font-display);font-size:24px;margin-top:10px;">₹${m.current.toLocaleString('en-IN')}<span class="text-sm text-muted"> / Quintal</span></div>
      <div class="grid-2 mt-16" style="gap:8px;">
        <div><div class="text-sm text-muted">Minimum</div><div style="font-weight:600;">₹${m.min.toLocaleString('en-IN')}</div></div>
        <div><div class="text-sm text-muted">Maximum</div><div style="font-weight:600;">₹${m.max.toLocaleString('en-IN')}</div></div>
      </div>
      <button class="btn btn-outline btn-sm btn-block mt-16" onclick="sfShowChartFor('${m.crop}')">View Trend</button>
    </div>`).join("");
}

function sfShowChartFor(crop){
  document.getElementById("chart-crop-select").value = crop;
  sfUpdateChart();
  document.getElementById("chart-section").scrollIntoView({behavior:"smooth", block:"start"});
}

function sfUpdateChart(){
  const crop = document.getElementById("chart-crop-select").value;
  const range = document.querySelector('input[name="chart-range"]:checked').value;
  const {labels, values} = getPriceHistory(crop, range);

  document.getElementById("chart-title").textContent = `${crop} — ${range==='7d'?'7 Day':range==='30d'?'30 Day':'3 Month'} Trend`;

  const ctx = document.getElementById("price-chart").getContext("2d");
  if (sfPriceChart) sfPriceChart.destroy();
  sfPriceChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: `${crop} price (₹/quintal)`,
        data: values,
        borderColor: "#1B4332",
        backgroundColor: "rgba(45,106,79,0.12)",
        fill: true,
        tension: 0.35,
        pointRadius: range==="7d" ? 3 : 0,
        pointBackgroundColor: "#D4A017",
        borderWidth: 2.5,
      }]
    },
    options: {
      responsive:true,
      maintainAspectRatio:false,
      animation: {duration: 700},
      plugins: { legend: {display:false} },
      scales: {
        y: { ticks: { callback: v => '₹'+v.toLocaleString('en-IN') }, grid:{color:'#EFEADD'} },
        x: { grid: {display:false} }
      }
    }
  });
}

function sfInitMarketPage(){
  const params = new URLSearchParams(window.location.search);
  const cropFilter = document.getElementById("market-filter-crop");
  const chartCrop = document.getElementById("chart-crop-select");
  SF_DATA.cropCatalog.forEach(c=>{
    cropFilter.insertAdjacentHTML("beforeend", `<option value="${c}">${CROP_ICONS[c]||'🌱'} ${c}</option>`);
    chartCrop.insertAdjacentHTML("beforeend", `<option value="${c}">${CROP_ICONS[c]||'🌱'} ${c}</option>`);
  });
  const states = [...new Set(SF_DATA.marketPrices.map(m=>m.state))];
  const stateFilter = document.getElementById("market-filter-state");
  states.forEach(s=> stateFilter.insertAdjacentHTML("beforeend", `<option value="${s}">${s}</option>`));

  if (params.get("crop")){
    cropFilter.value = params.get("crop");
    chartCrop.value = params.get("crop");
  } else {
    chartCrop.value = "Tomato";
  }

  cropFilter.addEventListener("change", sfRenderPriceCards);
  stateFilter.addEventListener("change", sfRenderPriceCards);
  chartCrop.addEventListener("change", sfUpdateChart);
  document.querySelectorAll('input[name="chart-range"]').forEach(r=>r.addEventListener("change", sfUpdateChart));

  sfRenderPriceCards();
  sfUpdateChart();
}
