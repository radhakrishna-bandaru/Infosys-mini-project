/* ============================================================
   SMART FARMER — App shell: navigation, auth guard, toast,
   number counters, modal helper, mobile menu.
   Voice assistant lives in voice-assistant.js
   ============================================================ */

const SF_NAV_ITEMS = [
  {href:"dashboard.html", icon:"bi-grid-1x2", label:"Dashboard", key:"dashboard"},
  {href:"crops.html", icon:"bi-flower3", label:"My Crops", key:"crops"},
  {href:"cold-storage.html", icon:"bi-snow", label:"Cold Storage", key:"storage"},
  {href:"market-prices.html", icon:"bi-graph-up-arrow", label:"Market Prices", key:"market"},
  {href:"sell-smart.html", icon:"bi-handshake", label:"Sell Smart", key:"sell"},
  {href:"map.html", icon:"bi-geo-alt", label:"Map", key:"map"},
  {href:"notifications.html", icon:"bi-bell", label:"Notifications", key:"notifications"},
  {href:"profile.html", icon:"bi-person-circle", label:"Profile", key:"profile"},
];

const SF_BOTTOM_ITEMS = [
  {href:"dashboard.html", icon:"bi-house-door", label:"Home", key:"dashboard"},
  {href:"crops.html", icon:"bi-flower3", label:"Crops", key:"crops"},
  {href:"cold-storage.html", icon:"bi-snow", label:"Storage", key:"storage"},
  {href:"market-prices.html", icon:"bi-graph-up-arrow", label:"Market", key:"market"},
  {href:"profile.html", icon:"bi-person-circle", label:"Profile", key:"profile"},
];

function sfRequireAuth(){
  if (localStorage.getItem("sf_logged_in") !== "true"){
    window.location.href = "login.html";
  }
}

function sfLogout(){
  localStorage.removeItem("sf_logged_in");
  window.location.href = "login.html";
}

/* ---------------- App shell builder (sidebar + topbar + bottom nav) --------------- */
function sfBuildAppShell(activeKey, pageTitle){
  const root = document.getElementById("app-shell-root");
  if (!root) return;

  const sidebarLinks = SF_NAV_ITEMS.map(item => `
    <a href="${item.href}" class="${item.key===activeKey?'active':''}">
      <i class="bi ${item.icon}"></i><span>${item.label}</span>
    </a>`).join("");

  const bottomLinks = SF_BOTTOM_ITEMS.map(item => `
    <a href="${item.href}" class="${item.key===activeKey?'active':''}">
      <i class="bi ${item.icon}"></i><span>${item.label}</span>
    </a>`).join("");

  root.insertAdjacentHTML("afterbegin", `
    <div class="app-shell">
      <aside class="sidebar" id="sf-sidebar">
        <div class="sidebar-brand"><span style="font-size:22px;">🌾</span><span>Smart Farmer</span></div>
        <nav class="sidebar-nav">${sidebarLinks}
          <a href="#" onclick="sfLogout();return false;"><i class="bi bi-box-arrow-right"></i><span>Logout</span></a>
        </nav>
        <button class="sidebar-collapse-btn" id="sf-collapse-btn"><i class="bi bi-chevron-double-left"></i><span>Collapse</span></button>
      </aside>
      <div style="flex:1;min-width:0;display:flex;flex-direction:column;">
        <div class="topbar">
          <div class="brand" style="font-size:18px;"><span class="brand-mark" style="width:32px;height:32px;font-size:16px;">🌾</span>${pageTitle||'Smart Farmer'}</div>
          <div class="flex gap-12" style="align-items:center;">
            <a href="notifications.html" style="position:relative;font-size:20px;color:var(--forest-700);"><i class="bi bi-bell"></i><span id="sf-badge-mobile" class="badge badge-red" style="position:absolute;top:-8px;right:-10px;padding:1px 6px;font-size:10px;display:none;"></span></a>
          </div>
        </div>
        <main class="app-main" id="app-main-content"></main>
      </div>
    </div>
    <nav class="bottom-nav">${bottomLinks}</nav>
  `);

  const collapseBtn = document.getElementById("sf-collapse-btn");
  const sidebar = document.getElementById("sf-sidebar");
  collapseBtn.addEventListener("click", ()=>{
    sidebar.classList.toggle("collapsed");
    collapseBtn.querySelector("i").className = sidebar.classList.contains("collapsed") ? "bi bi-chevron-double-right" : "bi bi-chevron-double-left";
  });

  const unread = unreadNotificationCount();
  const badge = document.getElementById("sf-badge-mobile");
  if (unread>0 && badge){ badge.style.display="inline-flex"; badge.textContent = unread; }
}

/* ---------------- Mobile marketing-page menu ---------------- */
function sfInitMobileMenu(){
  const btn = document.getElementById("hamburger-btn");
  const menu = document.getElementById("mobile-menu");
  if (!btn || !menu) return;
  btn.addEventListener("click", ()=>{
    menu.classList.toggle("open");
    btn.innerHTML = menu.classList.contains("open") ? '<i class="bi bi-x-lg"></i>' : '<i class="bi bi-list"></i>';
  });
}

/* ---------------- Toast ---------------- */
function sfToast(message, duration=2600){
  let wrap = document.querySelector(".toast-wrap");
  if (!wrap){ wrap = document.createElement("div"); wrap.className="toast-wrap"; document.body.appendChild(wrap); }
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = message;
  wrap.appendChild(t);
  setTimeout(()=>{ t.style.opacity="0"; t.style.transition="opacity .3s"; setTimeout(()=>t.remove(), 300); }, duration);
}

/* ---------------- Modal helper ---------------- */
function sfOpenModal(id){ document.getElementById(id)?.classList.add("open"); }
function sfCloseModal(id){ document.getElementById(id)?.classList.remove("open"); }

/* ---------------- Animated number counters ---------------- */
function sfAnimateCounters(){
  document.querySelectorAll("[data-counter]").forEach(el=>{
    const target = parseFloat(el.getAttribute("data-counter"));
    const suffix = el.getAttribute("data-suffix") || "";
    const prefix = el.getAttribute("data-prefix") || "";
    const decimals = el.getAttribute("data-decimals") ? parseInt(el.getAttribute("data-decimals")) : 0;
    const duration = 900;
    const start = performance.now();
    function tick(now){
      const p = Math.min(1, (now-start)/duration);
      const eased = 1 - Math.pow(1-p, 3);
      const val = target * eased;
      el.textContent = prefix + val.toLocaleString('en-IN', {maximumFractionDigits:decimals, minimumFractionDigits:decimals}) + suffix;
      if (p<1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}

/* ---------------- Reveal on scroll ---------------- */
function sfInitScrollReveal(){
  const els = document.querySelectorAll(".reveal-on-scroll");
  if (!els.length) return;
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if (e.isIntersecting){ e.target.classList.add("reveal"); io.unobserve(e.target);} });
  }, {threshold:0.15});
  els.forEach(el=>io.observe(el));
}

document.addEventListener("DOMContentLoaded", ()=>{
  sfInitMobileMenu();
  sfInitScrollReveal();
});
