/* ============================================================
   SMART FARMER — Mock data + service layer
   These functions are written so a future backend can replace
   the mock array lookups with real `fetch()` calls without any
   UI code changing (GET /api/... shown in comments).
   ============================================================ */

const CROP_ICONS = {
  Tomato:"🍅", Potato:"🥔", Onion:"🧅", Rice:"🌾", Wheat:"🌾",
  Mango:"🥭", Banana:"🍌", Cotton:"☁️", Chilli:"🌶️", Maize:"🌽",
  Groundnut:"🥜", Turmeric:"🫚"
};

const SF_DATA = {

  cropCatalog: ["Tomato","Potato","Onion","Rice","Wheat","Mango","Banana","Cotton","Chilli","Maize"],

  storages: [
    {id:"CS001", name:"Green Valley Cold Storage", city:"Hyderabad", lat:17.4239, lng:78.4738, rating:4.8, reviews:214, distanceKm:4.2, capacityTons:8000, availableTons:2500, tempMin:2, tempMax:8, humidity:"85-90%", pricePerKgDay:2.50, crops:["Tomato","Potato","Onion","Mango"], security:"24x7 CCTV + Guard", power:"Diesel + Grid Backup", address:"Plot 12, Agri Market Yard, Bowenpally, Hyderabad"},
    {id:"CS002", name:"Krishna Agro Cold Chain", city:"Vijayawada", lat:16.5062, lng:80.6480, rating:4.6, reviews:156, distanceKm:12.8, capacityTons:6000, availableTons:1800, tempMin:0, tempMax:4, humidity:"80-85%", pricePerKgDay:2.20, crops:["Onion","Potato","Chilli"], security:"CCTV Surveillance", power:"Grid + Solar", address:"NH16 Service Road, Vijayawada"},
    {id:"CS003", name:"Sri Venkateswara Storage Hub", city:"Visakhapatnam", lat:17.6868, lng:83.2185, rating:4.3, reviews:98, distanceKm:22.4, capacityTons:5000, availableTons:900, tempMin:4, tempMax:10, humidity:"75-85%", pricePerKgDay:1.95, crops:["Mango","Banana","Tomato"], security:"Guard on duty", power:"Grid Backup", address:"Fishing Harbour Road, Visakhapatnam"},
    {id:"CS004", name:"Warangal Farmers Cold Store", city:"Warangal", lat:17.9784, lng:79.6003, rating:4.5, reviews:132, distanceKm:78.1, capacityTons:4500, availableTons:3000, tempMin:2, tempMax:6, humidity:"85-90%", pricePerKgDay:2.10, crops:["Cotton","Chilli","Maize"], security:"24x7 CCTV", power:"Diesel Backup", address:"Hanamkonda Bypass, Warangal"},
    {id:"CS005", name:"Guntur Chilli & Cold Storage", city:"Guntur", lat:16.3067, lng:80.4365, rating:4.7, reviews:187, distanceKm:56.3, capacityTons:9000, availableTons:4200, tempMin:2, tempMax:8, humidity:"80-88%", pricePerKgDay:2.35, crops:["Chilli","Onion","Cotton"], security:"24x7 CCTV + Guard", power:"Grid + Solar", address:"Chilli Yard Road, Guntur"},
    {id:"CS006", name:"Nandi Agro Storage", city:"Bengaluru", lat:12.9716, lng:77.5946, rating:4.4, reviews:121, distanceKm:145.0, capacityTons:7000, availableTons:2100, tempMin:0, tempMax:5, humidity:"78-85%", pricePerKgDay:2.60, crops:["Tomato","Mango","Banana"], security:"CCTV Surveillance", power:"Grid Backup", address:"Yeshwanthpur APMC Yard, Bengaluru"},
    {id:"CS007", name:"Tamil Nadu Cold Chain Co-op", city:"Chennai", lat:13.0827, lng:80.2707, rating:4.5, reviews:170, distanceKm:625.0, capacityTons:10000, availableTons:5300, tempMin:2, tempMax:7, humidity:"82-88%", pricePerKgDay:2.45, crops:["Rice","Onion","Banana"], security:"24x7 CCTV + Guard", power:"Grid + Diesel", address:"Koyambedu Market Complex, Chennai"},
    {id:"CS008", name:"Pune FarmFresh Storage", city:"Pune", lat:18.5204, lng:73.8567, rating:4.6, reviews:143, distanceKm:560.0, capacityTons:6500, availableTons:1500, tempMin:1, tempMax:5, humidity:"80-86%", pricePerKgDay:2.70, crops:["Onion","Grapes","Tomato"], security:"CCTV Surveillance", power:"Grid Backup", address:"Market Yard, Gultekdi, Pune"},
    {id:"CS009", name:"Mumbai Metro Cold Storage", city:"Mumbai", lat:19.0760, lng:72.8777, rating:4.3, reviews:88, distanceKm:710.0, capacityTons:8000, availableTons:600, tempMin:2, tempMax:6, humidity:"78-84%", pricePerKgDay:3.10, crops:["Mango","Banana","Tomato"], security:"24x7 CCTV", power:"Grid + Solar", address:"Vashi APMC Market, Mumbai"},
    {id:"CS010", name:"Delhi NCR Agro Storage", city:"Delhi", lat:28.6139, lng:77.2090, rating:4.2, reviews:112, distanceKm:1260.0, capacityTons:12000, availableTons:6800, tempMin:0, tempMax:4, humidity:"75-82%", pricePerKgDay:2.85, crops:["Potato","Wheat","Onion"], security:"24x7 CCTV + Guard", power:"Grid Backup", address:"Azadpur Mandi, Delhi"},
    {id:"CS011", name:"Hyderabad East Cold Hub", city:"Hyderabad", lat:17.3616, lng:78.5247, rating:4.1, reviews:64, distanceKm:9.6, capacityTons:3500, availableTons:1400, tempMin:3, tempMax:9, humidity:"84-90%", pricePerKgDay:1.85, crops:["Tomato","Chilli"], security:"Guard on duty", power:"Grid Backup", address:"Uppal Ring Road, Hyderabad"},
  ],

  buyers: [
    {id:"B001", name:"FreshMart Foods", city:"Hyderabad", lat:17.4400, lng:78.4983, rating:4.8, distanceKm:18, crops:["Tomato","Onion","Potato"], payment:"Within 24 hours", pricePerQuintal:{Tomato:3050,Onion:2100,Potato:1400}},
    {id:"B002", name:"AgroBest Traders", city:"Hyderabad", lat:17.3850, lng:78.4867, rating:4.6, distanceKm:15, crops:["Tomato","Chilli"], payment:"Within 48 hours", pricePerQuintal:{Tomato:2900,Chilli:14500}},
    {id:"B003", name:"Deccan Produce Co.", city:"Secunderabad", lat:17.4399, lng:78.4983, rating:4.4, distanceKm:8, crops:["Tomato","Mango","Banana"], payment:"Within 72 hours", pricePerQuintal:{Tomato:2800,Mango:6200,Banana:1900}},
    {id:"B004", name:"Telangana Farm Fresh Exports", city:"Hyderabad", lat:17.4126, lng:78.4071, rating:4.7, distanceKm:22, crops:["Chilli","Cotton","Rice"], payment:"Within 24 hours", pricePerQuintal:{Chilli:15200,Cotton:7100,Rice:2200}},
    {id:"B005", name:"Green Basket Wholesale", city:"Warangal", lat:17.9689, lng:79.5941, rating:4.3, distanceKm:65, crops:["Onion","Potato","Maize"], payment:"Within 48 hours", pricePerQuintal:{Onion:2050,Potato:1350,Maize:2100}},
    {id:"B006", name:"Krishna River Traders", city:"Vijayawada", lat:16.5193, lng:80.6305, rating:4.5, distanceKm:270, crops:["Rice","Chilli","Cotton"], payment:"Within 24 hours", pricePerQuintal:{Rice:2280,Chilli:14800,Cotton:6950}},
    {id:"B007", name:"South India Agro Exports", city:"Chennai", lat:13.0674, lng:80.2376, rating:4.6, distanceKm:625, crops:["Banana","Mango","Rice"], payment:"Within 72 hours", pricePerQuintal:{Banana:2000,Mango:6400,Rice:2350}},
    {id:"B008", name:"National Foods Ltd", city:"Bengaluru", lat:12.9634, lng:77.5855, rating:4.4, distanceKm:145, crops:["Tomato","Mango","Grapes"], payment:"Within 24 hours", pricePerQuintal:{Tomato:2950,Mango:6100}},
    {id:"B009", name:"Sunrise Agro Distributors", city:"Guntur", lat:16.2991, lng:80.4575, rating:4.2, distanceKm:56, crops:["Chilli","Cotton","Onion"], payment:"Within 48 hours", pricePerQuintal:{Chilli:14200,Cotton:6800,Onion:2000}},
    {id:"B010", name:"Metro Fresh Wholesalers", city:"Mumbai", lat:19.0670, lng:72.9375, rating:4.3, distanceKm:710, crops:["Mango","Banana","Tomato"], payment:"Within 72 hours", pricePerQuintal:{Mango:6600,Banana:2100,Tomato:3200}},
    {id:"B011", name:"Delhi Mandi Buyers Group", city:"Delhi", lat:28.7041, lng:77.1937, rating:4.1, distanceKm:1260, crops:["Wheat","Potato","Onion"], payment:"Within 24 hours", pricePerQuintal:{Wheat:2350,Potato:1450,Onion:2150}},
    {id:"B012", name:"Andhra Organic Buyers", city:"Vijayawada", lat:16.4900, lng:80.6100, rating:4.5, distanceKm:270, crops:["Rice","Turmeric","Chilli"], payment:"Within 48 hours", pricePerQuintal:{Rice:2400,Chilli:15000}},
    {id:"B013", name:"Coastal AgriTrade", city:"Visakhapatnam", lat:17.7231, lng:83.3013, rating:4.0, distanceKm:620, crops:["Mango","Banana","Rice"], payment:"Within 72 hours", pricePerQuintal:{Mango:5900,Rice:2150}},
    {id:"B014", name:"Pune Farm Connect", city:"Pune", lat:18.5308, lng:73.8474, rating:4.6, distanceKm:560, crops:["Onion","Grapes","Tomato"], payment:"Within 24 hours", pricePerQuintal:{Onion:2200,Tomato:3100}},
    {id:"B015", name:"Karnataka Cotton Mills", city:"Bengaluru", lat:12.9915, lng:77.5555, rating:4.2, distanceKm:145, crops:["Cotton","Maize"], payment:"Within 48 hours", pricePerQuintal:{Cotton:7000,Maize:2050}},
  ],

  // 30+ market price records across crops, states, markets
  marketPrices: [
    {crop:"Tomato", state:"Telangana", market:"Bowenpally", current:2850, min:2600, max:3100, change:8.4},
    {crop:"Tomato", state:"Andhra Pradesh", market:"Vijayawada", current:2700, min:2450, max:2950, change:5.1},
    {crop:"Tomato", state:"Karnataka", market:"Bengaluru", current:2950, min:2700, max:3200, change:6.7},
    {crop:"Potato", state:"Telangana", market:"Bowenpally", current:1420, min:1300, max:1550, change:-2.3},
    {crop:"Potato", state:"Uttar Pradesh", market:"Agra", current:1180, min:1050, max:1300, change:1.4},
    {crop:"Potato", state:"Delhi", market:"Azadpur", current:1450, min:1300, max:1600, change:3.0},
    {crop:"Onion", state:"Maharashtra", market:"Pune", current:2150, min:1900, max:2400, change:12.6},
    {crop:"Onion", state:"Telangana", market:"Bowenpally", current:2080, min:1850, max:2300, change:9.8},
    {crop:"Onion", state:"Karnataka", market:"Bengaluru", current:2020, min:1800, max:2250, change:4.2},
    {crop:"Rice", state:"Andhra Pradesh", market:"Vijayawada", current:2280, min:2150, max:2400, change:1.1},
    {crop:"Rice", state:"Punjab", market:"Amritsar", current:2350, min:2200, max:2500, change:2.0},
    {crop:"Rice", state:"Tamil Nadu", market:"Chennai", current:2300, min:2150, max:2450, change:0.6},
    {crop:"Wheat", state:"Punjab", market:"Ludhiana", current:2340, min:2200, max:2450, change:1.8},
    {crop:"Wheat", state:"Delhi", market:"Azadpur", current:2360, min:2220, max:2480, change:2.2},
    {crop:"Wheat", state:"Madhya Pradesh", market:"Indore", current:2280, min:2150, max:2400, change:0.9},
    {crop:"Mango", state:"Andhra Pradesh", market:"Visakhapatnam", current:6200, min:5400, max:7100, change:15.2},
    {crop:"Mango", state:"Karnataka", market:"Bengaluru", current:6100, min:5300, max:7000, change:11.4},
    {crop:"Mango", state:"Maharashtra", market:"Mumbai", current:6600, min:5800, max:7500, change:9.0},
    {crop:"Banana", state:"Tamil Nadu", market:"Chennai", current:2000, min:1800, max:2200, change:3.5},
    {crop:"Banana", state:"Karnataka", market:"Bengaluru", current:1950, min:1750, max:2150, change:2.1},
    {crop:"Cotton", state:"Telangana", market:"Warangal", current:7100, min:6600, max:7600, change:4.8},
    {crop:"Cotton", state:"Andhra Pradesh", market:"Guntur", current:6800, min:6300, max:7300, change:3.2},
    {crop:"Cotton", state:"Gujarat", market:"Ahmedabad", current:7250, min:6700, max:7700, change:5.5},
    {crop:"Chilli", state:"Andhra Pradesh", market:"Guntur", current:14800, min:13200, max:16000, change:18.9},
    {crop:"Chilli", state:"Telangana", market:"Warangal", current:14200, min:12800, max:15500, change:14.3},
    {crop:"Chilli", state:"Karnataka", market:"Bengaluru", current:14500, min:13000, max:15800, change:10.6},
    {crop:"Maize", state:"Telangana", market:"Warangal", current:2100, min:1950, max:2300, change:2.8},
    {crop:"Maize", state:"Karnataka", market:"Bengaluru", current:2050, min:1900, max:2250, change:1.5},
    {crop:"Maize", state:"Bihar", market:"Patna", current:1980, min:1830, max:2150, change:0.4},
    {crop:"Tomato", state:"Maharashtra", market:"Pune", current:3100, min:2800, max:3350, change:9.9},
    {crop:"Onion", state:"Andhra Pradesh", market:"Guntur", current:2000, min:1780, max:2220, change:6.3},
    {crop:"Rice", state:"West Bengal", market:"Kolkata", current:2260, min:2120, max:2400, change:1.7},
  ],

  // 10+ notifications
  notifications: [
    {id:1, icon:"📈", title:"Tomato price increased by 8%", body:"Bowenpally market — now ₹2,850/quintal.", time:"2 hours ago", read:false, type:"price"},
    {id:2, icon:"🤝", title:"New buyer offer received", body:"FreshMart Foods offered ₹3,050/quintal for your Tomato.", time:"4 hours ago", read:false, type:"buyer"},
    {id:3, icon:"❄️", title:"Cold storage availability changed", body:"Green Valley Cold Storage now has 2,500 tons free.", time:"6 hours ago", read:false, type:"storage"},
    {id:4, icon:"✅", title:"Storage booking confirmed", body:"Your booking at Green Valley Cold Storage is confirmed for 7 days.", time:"Yesterday", read:true, type:"storage"},
    {id:5, icon:"🔔", title:"Market price alert", body:"Onion prices in Pune crossed your alert threshold of ₹2,000.", time:"Yesterday", read:true, type:"price"},
    {id:6, icon:"🌾", title:"Crop harvest reminder", body:"Your Tomato crop is ready for harvest in 3 days.", time:"2 days ago", read:true, type:"crop"},
    {id:7, icon:"🤝", title:"Buyer match found", body:"3 new buyers match your Onion listing.", time:"2 days ago", read:true, type:"buyer"},
    {id:8, icon:"❄️", title:"Storage price dropped", body:"Krishna Agro Cold Chain reduced rates to ₹2.20/kg/day.", time:"3 days ago", read:true, type:"storage"},
    {id:9, icon:"📈", title:"Chilli prices surging", body:"Guntur market chilli prices up 18.9% this week.", time:"4 days ago", read:true, type:"price"},
    {id:10, icon:"🔔", title:"Weather advisory", body:"Light rain expected in Hyderabad — plan storage accordingly.", time:"5 days ago", read:true, type:"alert"},
    {id:11, icon:"👤", title:"Profile verified", body:"Your Farmer ID SF2026001 has been verified successfully.", time:"1 week ago", read:true, type:"account"},
  ],

  chartHistory: {}, // populated lazily by getPriceHistory()
};

/* ---------------- Deterministic pseudo-random helper (stable charts) ---------------- */
function _seedRand(seed){
  let s = seed % 2147483647; if (s<=0) s += 2147483646;
  return function(){ s = (s*16807) % 2147483647; return (s-1)/2147483646; };
}

/* ================= SERVICE FUNCTIONS (API-ready) ================= */
// Later: replace body with `await fetch('/api/...').then(r=>r.json())`

function getColdStorages(filters={}){ // GET /api/cold-storages
  let list = [...SF_DATA.storages];
  if (filters.crop) list = list.filter(s=>s.crops.includes(filters.crop));
  if (filters.city) list = list.filter(s=>s.city.toLowerCase()===filters.city.toLowerCase());
  if (filters.query){
    const q = filters.query.toLowerCase();
    list = list.filter(s=> s.name.toLowerCase().includes(q) || s.city.toLowerCase().includes(q) || s.crops.some(c=>c.toLowerCase().includes(q)));
  }
  if (filters.maxDistance) list = list.filter(s=>s.distanceKm<=filters.maxDistance);
  if (filters.maxPrice) list = list.filter(s=>s.pricePerKgDay<=filters.maxPrice);
  if (filters.minRating) list = list.filter(s=>s.rating>=filters.minRating);
  if (filters.sort==="price") list.sort((a,b)=>a.pricePerKgDay-b.pricePerKgDay);
  else if (filters.sort==="rating") list.sort((a,b)=>b.rating-a.rating);
  else list.sort((a,b)=>a.distanceKm-b.distanceKm);
  return list;
}
function getStorageById(id){ return SF_DATA.storages.find(s=>s.id===id); } // GET /api/cold-storages/:id

function getMarketPrices(filters={}){ // GET /api/market-prices
  let list = [...SF_DATA.marketPrices];
  if (filters.crop) list = list.filter(m=>m.crop===filters.crop);
  if (filters.state) list = list.filter(m=>m.state===filters.state);
  if (filters.market) list = list.filter(m=>m.market===filters.market);
  return list;
}
function getPriceHistory(crop, range="7d"){ // GET /api/market-prices/:crop/history?range=
  const base = (getMarketPrices({crop})[0]||{current:2000}).current;
  const days = range==="7d"?7:range==="30d"?30:90;
  const rand = _seedRand(crop.length*17 + days);
  let val = base * 0.9;
  const labels=[], values=[];
  const today = new Date();
  for(let i=days-1;i>=0;i--){
    const d = new Date(today); d.setDate(d.getDate()-i);
    val += (rand()-0.45) * base * 0.02;
    val = Math.max(base*0.7, Math.min(base*1.25, val));
    labels.push(d.toLocaleDateString('en-IN',{day:'2-digit',month:'short'}));
    values.push(Math.round(val));
  }
  values[values.length-1] = base;
  return {labels, values};
}

function getBuyers(filters={}){ // GET /api/buyers
  let list = [...SF_DATA.buyers];
  if (filters.crop) list = list.filter(b=>b.crops.includes(filters.crop));
  return list.map(b=>({...b, offer: b.pricePerQuintal[filters.crop] || Object.values(b.pricePerQuintal)[0]}))
             .sort((a,b)=>b.offer-a.offer);
}
function getBuyerById(id){ return SF_DATA.buyers.find(b=>b.id===id); }

function getFarmerProfile(){ // GET /api/farmer
  const stored = localStorage.getItem("sf_profile");
  if (stored) return JSON.parse(stored);
  const def = {
    name:"Suryakiran Reddy", farmerId:"SF2026001", mobile:"9876543210", email:"suryakiran@example.com",
    village:"Bowenpally", district:"Hyderabad", state:"Telangana", language:"English",
    mainCrop:"Tomato", photo:"", memberSince:"Jan 2026"
  };
  localStorage.setItem("sf_profile", JSON.stringify(def));
  return def;
}
function saveFarmerProfile(profile){ localStorage.setItem("sf_profile", JSON.stringify(profile)); }

function getCropData(){ // GET /api/crops
  const stored = localStorage.getItem("sf_crops");
  if (stored) return JSON.parse(stored);
  const def = [
    {id:"C1", name:"Tomato", variety:"Hybrid Vigor", quantityKg:5000, quality:"Grade A", harvestDate:"2026-08-25", sellByDate:"2026-09-10"},
    {id:"C2", name:"Onion", variety:"Nashik Red", quantityKg:3200, quality:"Grade A", harvestDate:"2026-08-18", sellByDate:"2026-09-05"},
    {id:"C3", name:"Chilli", variety:"Guntur Sannam", quantityKg:1800, quality:"Grade B", harvestDate:"2026-08-10", sellByDate:"2026-08-30"},
    {id:"C4", name:"Cotton", variety:"Bt Cotton", quantityKg:2500, quality:"Grade A", harvestDate:"2026-08-05", sellByDate:"2026-09-15"},
    {id:"C5", name:"Rice", variety:"Sona Masuri", quantityKg:6000, quality:"Grade A", harvestDate:"2026-07-28", sellByDate:"2026-09-20"},
  ];
  localStorage.setItem("sf_crops", JSON.stringify(def));
  return def;
}
function saveCropData(crops){ localStorage.setItem("sf_crops", JSON.stringify(crops)); }
function addCrop(crop){
  const crops = getCropData();
  crop.id = "C" + (Date.now()%100000);
  crops.unshift(crop);
  saveCropData(crops);
  return crop;
}
function deleteCrop(id){
  const crops = getCropData().filter(c=>c.id!==id);
  saveCropData(crops);
}
function cropCurrentPrice(cropName){
  const rec = getMarketPrices({crop:cropName})[0];
  return rec ? rec.current : 2000;
}

function getNotifications(){
  const stored = localStorage.getItem("sf_notifications");
  if (stored) return JSON.parse(stored);
  localStorage.setItem("sf_notifications", JSON.stringify(SF_DATA.notifications));
  return SF_DATA.notifications;
}
function markAllNotificationsRead(){
  const list = getNotifications().map(n=>({...n, read:true}));
  localStorage.setItem("sf_notifications", JSON.stringify(list));
  return list;
}
function unreadNotificationCount(){ return getNotifications().filter(n=>!n.read).length; }

function getSavedStorages(){ return JSON.parse(localStorage.getItem("sf_saved_storage")||"[]"); }
function toggleSavedStorage(id){
  let saved = getSavedStorages();
  if (saved.includes(id)) saved = saved.filter(s=>s!==id); else saved.push(id);
  localStorage.setItem("sf_saved_storage", JSON.stringify(saved));
  return saved;
}
function getSavedBuyers(){ return JSON.parse(localStorage.getItem("sf_saved_buyers")||"[]"); }
function toggleSavedBuyer(id){
  let saved = getSavedBuyers();
  if (saved.includes(id)) saved = saved.filter(s=>s!==id); else saved.push(id);
  localStorage.setItem("sf_saved_buyers", JSON.stringify(saved));
  return saved;
}
