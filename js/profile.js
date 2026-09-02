function sfInitProfile(){
  const profile = getFarmerProfile();
  document.getElementById("pf-name").textContent = profile.name;
  document.getElementById("pf-farmerid").textContent = profile.farmerId;
  document.getElementById("pf-avatar-initial").textContent = profile.name.charAt(0).toUpperCase();
  document.getElementById("pf-mobile").textContent = profile.mobile || "—";
  document.getElementById("pf-village").textContent = profile.village || "—";
  document.getElementById("pf-district").textContent = profile.district || "—";
  document.getElementById("pf-state").textContent = profile.state || "—";
  document.getElementById("pf-language").textContent = profile.language || "English";
  document.getElementById("pf-member-since").textContent = profile.memberSince || "—";
  document.getElementById("pf-main-crop").textContent = (CROP_ICONS[profile.mainCrop]||"🌱")+" "+profile.mainCrop;

  const crops = getCropData();
  document.getElementById("pf-crops-list").innerHTML = crops.map(c=>`<span class="chip">${CROP_ICONS[c.name]||'🌱'} ${c.name}</span>`).join("") || '<span class="text-sm text-muted">No crops added yet</span>';

  const savedStorage = getSavedStorages().map(id=>getStorageById(id)).filter(Boolean);
  document.getElementById("pf-saved-storage").innerHTML = savedStorage.length
    ? savedStorage.map(s=>`<div class="card-flat" style="padding:10px 14px;">${s.name} <span class="text-sm text-muted">· ${s.distanceKm} km</span></div>`).join("")
    : '<span class="text-sm text-muted">No saved storage facilities yet</span>';

  const savedBuyers = getSavedBuyers().map(id=>getBuyerById(id)).filter(Boolean);
  document.getElementById("pf-saved-buyers").innerHTML = savedBuyers.length
    ? savedBuyers.map(b=>`<div class="card-flat" style="padding:10px 14px;">${b.name} <span class="text-sm text-muted">· ${b.city}</span></div>`).join("")
    : '<span class="text-sm text-muted">No saved buyers yet</span>';

  // Edit form pre-fill
  document.getElementById("edit-name").value = profile.name;
  document.getElementById("edit-mobile").value = profile.mobile;
  document.getElementById("edit-village").value = profile.village;
  document.getElementById("edit-district").value = profile.district;
  document.getElementById("edit-state").value = profile.state;
  const langSel = document.getElementById("edit-language");
  SF_LANGUAGES.forEach(l=>{ const o=document.createElement("option"); o.value=l.label; o.textContent=l.native; if(l.label===profile.language) o.selected=true; langSel.appendChild(o); });

  document.getElementById("edit-profile-form").addEventListener("submit",(e)=>{
    e.preventDefault();
    const updated = {...profile,
      name: document.getElementById("edit-name").value,
      mobile: document.getElementById("edit-mobile").value,
      village: document.getElementById("edit-village").value,
      district: document.getElementById("edit-district").value,
      state: document.getElementById("edit-state").value,
      language: document.getElementById("edit-language").value,
    };
    saveFarmerProfile(updated);
    localStorage.setItem("sf_language", (SF_LANGUAGES.find(l=>l.label===updated.language)||{code:'en-IN'}).code);
    sfToast("Profile updated");
    sfCloseModal("edit-profile-modal");
    sfInitProfile();
  });

  document.getElementById("notif-toggle").checked = localStorage.getItem("sf_pref_notif") !== "off";
  document.getElementById("notif-toggle").addEventListener("change",(e)=>{
    localStorage.setItem("sf_pref_notif", e.target.checked ? "on":"off");
    sfToast(e.target.checked ? "Notifications enabled" : "Notifications muted");
  });
  document.getElementById("voice-toggle").checked = localStorage.getItem("sf_pref_voice") !== "off";
  document.getElementById("voice-toggle").addEventListener("change",(e)=>{
    localStorage.setItem("sf_pref_voice", e.target.checked ? "on":"off");
    sfToast(e.target.checked ? "Voice assistant enabled" : "Voice assistant disabled");
  });
  document.getElementById("location-toggle").checked = localStorage.getItem("sf_pref_location") !== "off";
  document.getElementById("location-toggle").addEventListener("change",(e)=>{
    localStorage.setItem("sf_pref_location", e.target.checked ? "on":"off");
  });
}
