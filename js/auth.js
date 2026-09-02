/* ============================================================
   SMART FARMER — Frontend demo authentication.
   NOTE: This is a FRONTEND DEMO ONLY. Nothing here is secure —
   there is no real password hashing, session token, or server
   validation. It exists to demonstrate the user flow and is
   structured so a real auth API can be swapped in later
   (see comments marked API-READY).
   ============================================================ */

function sfInitLoginPage(){
  const form = document.getElementById("login-form");
  const idTab = document.getElementById("tab-farmerid");
  const mobileTab = document.getElementById("tab-mobile");
  const idPanel = document.getElementById("panel-farmerid");
  const mobilePanel = document.getElementById("panel-mobile");

  function showPanel(which){
    const isId = which==="id";
    idTab.classList.toggle("chip", true); mobileTab.classList.toggle("chip", true);
    idTab.classList.toggle("active", isId); mobileTab.classList.toggle("active", !isId);
    idPanel.style.display = isId ? "block" : "none";
    mobilePanel.style.display = isId ? "none" : "block";
  }
  idTab.addEventListener("click", ()=>showPanel("id"));
  mobileTab.addEventListener("click", ()=>showPanel("mobile"));

  form.addEventListener("submit", (e)=>{
    e.preventDefault();
    const btn = form.querySelector("button[type=submit]");
    btn.disabled = true; btn.innerHTML = '<i class="bi bi-arrow-repeat"></i> Signing in…';

    // API-READY: replace with POST /api/auth/login { farmerId | mobile, password }
    setTimeout(()=>{
      localStorage.setItem("sf_logged_in", "true");
      if (document.getElementById("remember-me")?.checked){
        localStorage.setItem("sf_remember", "true");
      }
      getFarmerProfile(); // seeds demo profile if not present
      sfToast("Welcome back! Logging you in…");
      setTimeout(()=> window.location.href = "dashboard.html", 500);
    }, 700);
  });

  // Pre-fill demo credentials as placeholders already in markup.
}

function sfInitRegisterPage(){
  const form = document.getElementById("register-form");
  const otpBtn = document.getElementById("send-otp-btn");
  const otpRow = document.getElementById("otp-row");
  let otpSent = false;

  otpBtn?.addEventListener("click", ()=>{
    const mobile = document.getElementById("reg-mobile").value.trim();
    if (mobile.length < 10){ sfToast("Enter a valid 10-digit mobile number"); return; }
    otpBtn.disabled = true;
    otpBtn.textContent = "Sending…";
    setTimeout(()=>{
      otpSent = true;
      otpRow.style.display = "flex";
      otpBtn.textContent = "OTP Sent ✓";
      sfToast("Demo OTP sent: 1234 (frontend simulation)");
    }, 700);
  });

  form?.addEventListener("submit", (e)=>{
    e.preventDefault();
    if (otpRow.style.display !== "none" && document.getElementById("reg-otp").value.trim() !== "1234"){
      sfToast("Incorrect OTP. Try 1234 for this demo.");
      return;
    }
    const password = document.getElementById("reg-password").value;
    const confirm = document.getElementById("reg-confirm").value;
    if (password !== confirm){ sfToast("Passwords do not match"); return; }

    const profile = {
      name: document.getElementById("reg-name").value.trim() || "New Farmer",
      farmerId: document.getElementById("reg-farmerid").value.trim() || ("SF2026" + Math.floor(100+Math.random()*899)),
      mobile: document.getElementById("reg-mobile").value.trim(),
      email: document.getElementById("reg-email").value.trim(),
      village: document.getElementById("reg-village").value.trim(),
      district: document.getElementById("reg-district").value.trim(),
      state: document.getElementById("reg-state").value,
      language: document.getElementById("reg-language").value,
      mainCrop: document.getElementById("reg-crop").value,
      photo:"", memberSince: new Date().toLocaleDateString('en-IN',{month:'short', year:'numeric'})
    };
    // API-READY: replace with POST /api/auth/register
    saveFarmerProfile(profile);
    localStorage.setItem("sf_logged_in", "true");
    sfToast("Account created! Redirecting to your dashboard…");
    setTimeout(()=> window.location.href = "dashboard.html", 700);
  });
}
