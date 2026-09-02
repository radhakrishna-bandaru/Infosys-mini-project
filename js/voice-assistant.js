/* ============================================================
   SMART FARMER — Voice Assistant
   Uses the Web Speech API (SpeechRecognition + SpeechSynthesis)
   where the browser supports it, and always provides a working
   typed / tap-to-run command fallback so the demo works everywhere.
   ============================================================ */

const SF_LANGUAGES = [
  {code:"en-IN", label:"English", native:"English"},
  {code:"te-IN", label:"Telugu", native:"తెలుగు"},
  {code:"hi-IN", label:"Hindi", native:"हिंदी"},
  {code:"ta-IN", label:"Tamil", native:"தமிழ்"},
  {code:"kn-IN", label:"Kannada", native:"ಕನ್ನಡ"},
  {code:"ml-IN", label:"Malayalam", native:"മലയാളം"},
  {code:"mr-IN", label:"Marathi", native:"मराठी"},
  {code:"bn-IN", label:"Bengali", native:"বাংলা"},
  {code:"gu-IN", label:"Gujarati", native:"ગુજરાતી"},
  {code:"pa-IN", label:"Punjabi", native:"ਪੰਜਾਬੀ"},
  {code:"or-IN", label:"Odia", native:"ଓଡ଼ିଆ"},
  {code:"as-IN", label:"Assamese", native:"অসমীয়া"},
];

const SF_COMMANDS = [
  {keywords:["cold storage","storage","find storage","నిల్వ"], page:"cold-storage.html", reply:"Here are the nearest cold storages for your crop."},
  {keywords:["tomato price","market price","price entha","today price","prices"], page:"market-prices.html", reply:"Opening today's market prices for you."},
  {keywords:["buyer","buyers","sell to","best buyer"], page:"sell-smart.html", reply:"Here are the best buyers matched to your crop."},
  {keywords:["my crops","open crops","crops"], page:"crops.html", reply:"Opening My Crops."},
  {keywords:["dashboard","home"], page:"dashboard.html", reply:"Taking you to your dashboard."},
  {keywords:["profile","my profile"], page:"profile.html", reply:"Opening your profile."},
  {keywords:["map","navigate","nearby"], page:"map.html", reply:"Opening the map view."},
  {keywords:["notification","alerts"], page:"notifications.html", reply:"Opening your notifications."},
];

const SF_DEMO_COMMANDS = ["Find cold storage","Show tomato price","Find buyers","Open my crops","Show market prices","Open dashboard"];

let sfRecognition = null;
let sfListening = false;

function sfIsAppPage(){ return !!document.getElementById("app-shell-root") || document.body.getAttribute("data-sf-page")==="app"; }

function sfBuildVoiceWidget(){
  if (document.getElementById("voice-fab")) return;

  const lang = localStorage.getItem("sf_language") || "en-IN";

  const wrap = document.createElement("div");
  wrap.innerHTML = `
    <button id="voice-fab" class="voice-fab" aria-label="Ask Smart Farmer" title="Ask Smart Farmer">
      <i class="bi bi-mic-fill"></i>
    </button>
    <div id="voice-panel" class="voice-panel" role="dialog" aria-label="Smart Farmer voice assistant">
      <div class="flex-between">
        <div class="flex gap-8" style="align-items:center;">
          <span class="voice-dot" id="voice-dot"></span>
          <strong id="voice-state-label" style="font-size:14.5px;">Ask Smart Farmer</strong>
        </div>
        <select id="voice-lang-select" style="border:1px solid var(--paper-200);border-radius:8px;padding:5px 8px;font-size:12px;background:var(--white);"></select>
      </div>
      <div class="voice-transcript" id="voice-transcript">Tap the mic and say something like "Show tomato price" or "Find cold storage".</div>
      <div class="flex gap-8">
        <button class="btn btn-primary btn-block btn-sm" id="voice-mic-btn"><i class="bi bi-mic"></i> Tap to speak</button>
      </div>
      <div class="voice-commands" id="voice-commands"></div>
    </div>
  `;
  document.body.appendChild(wrap);

  const langSelect = document.getElementById("voice-lang-select");
  SF_LANGUAGES.forEach(l=>{
    const opt = document.createElement("option");
    opt.value = l.code; opt.textContent = `${l.native}`;
    if (l.code===lang) opt.selected = true;
    langSelect.appendChild(opt);
  });
  langSelect.addEventListener("change", ()=>{
    localStorage.setItem("sf_language", langSelect.value);
    const l = SF_LANGUAGES.find(x=>x.code===langSelect.value);
    sfToast(`Voice assistant language set to ${l.native}`);
  });

  const cmdWrap = document.getElementById("voice-commands");
  SF_DEMO_COMMANDS.forEach(c=>{
    const b = document.createElement("button");
    b.textContent = c;
    b.addEventListener("click", ()=> sfHandleVoiceCommand(c));
    cmdWrap.appendChild(b);
  });

  document.getElementById("voice-fab").addEventListener("click", sfToggleVoicePanel);
  document.getElementById("voice-mic-btn").addEventListener("click", sfStartListening);

  document.addEventListener("click", (e)=>{
    const panel = document.getElementById("voice-panel");
    const fab = document.getElementById("voice-fab");
    if (panel.classList.contains("open") && !panel.contains(e.target) && !fab.contains(e.target)){
      panel.classList.remove("open");
    }
  });
}

function sfToggleVoicePanel(){
  document.getElementById("voice-panel").classList.toggle("open");
}

function sfSetVoiceState(state, text){
  const dot = document.getElementById("voice-dot");
  const label = document.getElementById("voice-state-label");
  const transcript = document.getElementById("voice-transcript");
  const fab = document.getElementById("voice-fab");
  dot.classList.toggle("live", state==="listening");
  fab.classList.toggle("listening", state==="listening");
  const labels = {idle:"Ask Smart Farmer", listening:"Listening…", processing:"Understanding your request…", response:"Smart Farmer says"};
  label.textContent = labels[state] || "Ask Smart Farmer";
  if (text) transcript.textContent = text;
}

function sfStartListening(){
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const lang = localStorage.getItem("sf_language") || "en-IN";

  if (!SpeechRecognition){
    sfSetVoiceState("idle", "Voice recognition isn't supported in this browser. Try one of the quick commands below, or type your request.");
    sfToast("Speech recognition not supported — try a quick command below");
    return;
  }
  if (sfListening) return;

  sfRecognition = new SpeechRecognition();
  sfRecognition.lang = lang;
  sfRecognition.interimResults = false;
  sfRecognition.maxAlternatives = 1;

  sfListening = true;
  sfSetVoiceState("listening", "Listening…");

  sfRecognition.onresult = (event)=>{
    const text = event.results[0][0].transcript;
    sfSetVoiceState("processing", `"${text}"`);
    setTimeout(()=> sfHandleVoiceCommand(text), 600);
  };
  sfRecognition.onerror = ()=>{
    sfListening = false;
    sfSetVoiceState("idle", "I couldn't hear that clearly. Try again or tap a quick command below.");
  };
  sfRecognition.onend = ()=>{ sfListening = false; };

  try { sfRecognition.start(); } catch(err){ sfListening=false; sfSetVoiceState("idle","Tap the mic to try again."); }
}

function sfHandleVoiceCommand(text){
  const q = text.toLowerCase();
  const match = SF_COMMANDS.find(cmd => cmd.keywords.some(k=>q.includes(k.toLowerCase())));
  sfSetVoiceState("processing", `"${text}"`);
  setTimeout(()=>{
    if (match){
      sfSetVoiceState("response", match.reply);
      sfSpeak(match.reply);
      setTimeout(()=>{
        if (!window.location.pathname.endsWith(match.page)){
          window.location.href = match.page;
        }
      }, 900);
    } else {
      const reply = "Sorry, I didn't understand that. Try 'show tomato price' or 'find cold storage'.";
      sfSetVoiceState("response", reply);
      sfSpeak(reply);
    }
  }, 500);
}

function sfSpeak(text){
  if (!("speechSynthesis" in window)) return;
  const lang = localStorage.getItem("sf_language") || "en-IN";
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang;
  utter.rate = 0.98;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

document.addEventListener("DOMContentLoaded", sfBuildVoiceWidget);
