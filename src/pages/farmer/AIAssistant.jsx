import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bot,
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Sparkles,
  Leaf,
  TrendingUp,
  Warehouse,
  Store,
  Trash2,
  X,
} from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";

const languages = [
  { code: "en-IN", name: "English" },
  { code: "te-IN", name: "తెలుగు" },
  { code: "hi-IN", name: "हिन्दी" },
  { code: "ta-IN", name: "தமிழ்" },
  { code: "kn-IN", name: "ಕನ್ನಡ" },
  { code: "ml-IN", name: "മലയാളം" },
  { code: "mr-IN", name: "मराठी" },
  { code: "bn-IN", name: "বাংলা" },
];

const suggestions = [
  {
    icon: TrendingUp,
    title: "Best market",
    text: "Where should I sell my tomatoes?",
  },
  {
    icon: Warehouse,
    title: "Storage",
    text: "Find the best cold storage for me.",
  },
  {
    icon: Store,
    title: "Best buyer",
    text: "Which buyer offers the best price?",
  },
  {
    icon: Leaf,
    title: "Profit",
    text: "Should I sell now or store my crop?",
  },
];

function generateResponse(text, lang = "en-IN") {
  const query = text.toLowerCase();

  const isTelugu =
    /[\u0C00-\u0C7F]/.test(text) ||
    lang === "te-IN";

  const isHindi =
    /[\u0900-\u097F]/.test(text) ||
    lang === "hi-IN";

  const isTamil =
    /[\u0B80-\u0BFF]/.test(text) ||
    lang === "ta-IN";

  const isKannada =
    /[\u0C80-\u0CFF]/.test(text) ||
    lang === "kn-IN";

  const isMalayalam =
    /[\u0D00-\u0D7F]/.test(text) ||
    lang === "ml-IN";

  const isMarathi =
    /[\u0900-\u097F]/.test(text) ||
    lang === "mr-IN";

  const isBengali =
    /[\u0980-\u09FF]/.test(text) ||
    lang === "bn-IN";

  // TOMATO / PRICE
  if (
    query.includes("tomato") ||
    query.includes("టమాట") ||
    query.includes("टमाटर") ||
    query.includes("தக்காளி") ||
    query.includes("ಟೊಮೇಟೊ") ||
    query.includes("തക്കാളി") ||
    query.includes("टमाटे") ||
    query.includes("টমেটো") ||
    query.includes("price") ||
    query.includes("ధర") ||
    query.includes("कीमत")
  ) {
    if (isTelugu) {
      return {
        title: "టమాటా మార్కెట్ అవకాశం",
        text:
          "ప్రస్తుతం టమాటా ధరలు పెరుగుతున్న ట్రెండ్‌లో ఉన్నాయి. మీ పంట నాణ్యత బాగుంటే, ఇంకొన్ని రోజులు వేచి చూసి అమ్మడం ద్వారా మంచి ధర పొందే అవకాశం ఉంది.",
        action: "మార్కెట్ చూడండి",
        path: "/farmer/market",
      };
    }

    if (isHindi) {
      return {
        title: "टमाटर बाजार का अवसर",
        text:
          "अभी टमाटर की कीमतें बढ़ने की दिशा में हैं। अगर आपकी फसल की गुणवत्ता अच्छी है, तो कुछ दिन इंतजार करके बेचने से आपको बेहतर कीमत मिल सकती है।",
        action: "बाजार देखें",
        path: "/farmer/market",
      };
    }

    if (isTamil) {
      return {
        title: "தக்காளி சந்தை வாய்ப்பு",
        text:
          "தற்போது தக்காளி விலை உயர்ந்து வருகிறது. உங்கள் பயிரின் தரம் நன்றாக இருந்தால், சில நாட்கள் காத்திருந்து விற்பனை செய்வதன் மூலம் நல்ல விலையைப் பெறலாம்.",
        action: "சந்தையைப் பார்க்கவும்",
        path: "/farmer/market",
      };
    }

    if (isKannada) {
      return {
        title: "ಟೊಮೇಟೊ ಮಾರುಕಟ್ಟೆ ಅವಕಾಶ",
        text:
          "ಪ್ರಸ್ತುತ ಟೊಮೇಟೊ ಬೆಲೆಗಳು ಏರಿಕೆಯಲ್ಲಿವೆ. ನಿಮ್ಮ ಬೆಳೆಯ ಗುಣಮಟ್ಟ ಉತ್ತಮವಾಗಿದ್ದರೆ, ಕೆಲವು ದಿನ ಕಾಯ್ದು ಮಾರಾಟ ಮಾಡುವುದರಿಂದ ಉತ್ತಮ ಬೆಲೆ ಪಡೆಯಬಹುದು.",
        action: "ಮಾರುಕಟ್ಟೆ ನೋಡಿ",
        path: "/farmer/market",
      };
    }

    if (isMalayalam) {
      return {
        title: "തക്കാളി വിപണി അവസരം",
        text:
          "നിലവിൽ തക്കാളിയുടെ വില ഉയരുന്ന പ്രവണതയിലാണ്. നിങ്ങളുടെ വിളയുടെ ഗുണനിലവാരം നല്ലതാണെങ്കിൽ കുറച്ച് ദിവസം കാത്തിരുന്ന് വിൽക്കുന്നത് കൂടുതൽ വില ലഭിക്കാൻ സഹായിക്കും.",
        action: "വിപണി കാണുക",
        path: "/farmer/market",
      };
    }

    if (isMarathi) {
      return {
        title: "टोमॅटो बाजाराची संधी",
        text:
          "सध्या टोमॅटोच्या किंमती वाढण्याच्या दिशेने आहेत. तुमच्या पिकाची गुणवत्ता चांगली असल्यास काही दिवस थांबून विकल्यास चांगली किंमत मिळू शकते.",
        action: "बाजार पहा",
        path: "/farmer/market",
      };
    }

    if (isBengali) {
      return {
        title: "টমেটোর বাজারের সুযোগ",
        text:
          "বর্তমানে টমেটোর দাম বাড়ার প্রবণতা দেখা যাচ্ছে। আপনার ফসলের মান ভালো থাকলে কয়েক দিন অপেক্ষা করে বিক্রি করলে আরও ভালো দাম পাওয়ার সম্ভাবনা রয়েছে।",
        action: "বাজার দেখুন",
        path: "/farmer/market",
      };
    }

    return {
      title: "Tomato market opportunity",
      text:
        "Current tomato prices are showing an upward trend. If your crop quality remains good, waiting a few days may help you get a better selling price.",
      action: "View Market Intelligence",
      path: "/farmer/market",
    };
  }

  // STORAGE
  if (
    query.includes("storage") ||
    query.includes("cold") ||
    query.includes("స్టోర") ||
    query.includes("गोदाम") ||
    query.includes("भंडारण")
  ) {
    if (isTelugu) {
      return {
        title: "కోల్డ్ స్టోరేజ్ సిఫార్సు",
        text:
          "మీకు దగ్గరలో ఉన్న కోల్డ్ స్టోరేజ్‌లను పోల్చుకోవచ్చు. దూరం, అద్దె, అందుబాటులో ఉన్న సామర్థ్యం మరియు రవాణా ఖర్చును చూసి మంచి స్టోరేజ్‌ను ఎంచుకోండి.",
        action: "కోల్డ్ స్టోరేజ్ చూడండి",
        path: "/farmer/storage",
      };
    }

    if (isHindi) {
      return {
        title: "कोल्ड स्टोरेज सुझाव",
        text:
          "आप अपने पास उपलब्ध कोल्ड स्टोरेज की तुलना कर सकते हैं। दूरी, किराया, उपलब्ध क्षमता और परिवहन लागत देखकर सही स्टोरेज चुनें।",
        action: "कोल्ड स्टोरेज देखें",
        path: "/farmer/storage",
      };
    }

    return {
      title: "Cold storage recommendation",
      text:
        "I found nearby storage options. Compare distance, rent, available capacity and transport cost before booking.",
      action: "Find Cold Storage",
      path: "/farmer/storage",
    };
  }

  // BUYER / SELL
  if (
    query.includes("buyer") ||
    query.includes("sell") ||
    query.includes("కొను") ||
    query.includes("అమ్మ") ||
    query.includes("खरीदार") ||
    query.includes("बेचना")
  ) {
    if (isTelugu) {
      return {
        title: "బయ్యర్ అవకాశం",
        text:
          "మీ పంటకు మంచి ధర ఇచ్చే బయ్యర్లను పోల్చుకోవచ్చు. వారు ఇచ్చే ధర, అవసరమైన పరిమాణం మరియు మీకు వచ్చే నికర లాభాన్ని చూసి నిర్ణయం తీసుకోండి.",
        action: "బయ్యర్లను చూడండి",
        path: "/farmer/buyers",
      };
    }

    if (isHindi) {
      return {
        title: "खरीदार का अवसर",
        text:
          "आप अलग-अलग खरीदारों की कीमत और आवश्यक मात्रा की तुलना कर सकते हैं। बेहतर कीमत और अधिक लाभ देने वाले खरीदार को चुनें।",
        action: "खरीदार देखें",
        path: "/farmer/buyers",
      };
    }

    return {
      title: "Buyer opportunity",
      text:
        "You can compare buyers based on offered price, required quantity and estimated net return. Check the buyer list before accepting an offer.",
      action: "Explore Buyers",
      path: "/farmer/buyers",
    };
  }

  // PROFIT
  if (
    query.includes("profit") ||
    query.includes("store") ||
    query.includes("లాభ") ||
    query.includes("लाभ")
  ) {
    if (isTelugu) {
      return {
        title: "లాభాల విశ్లేషణ",
        text:
          "ఇప్పుడే పంటను అమ్మడం మరియు కొన్ని రోజులు స్టోరేజ్‌లో ఉంచి తర్వాత అమ్మడం రెండింటినీ పోల్చి చూడవచ్చు. స్టోరేజ్ ఖర్చు, భవిష్యత్ ధర మరియు పంట పాడయ్యే రిస్క్‌ను పరిగణలోకి తీసుకోవచ్చు.",
        action: "ప్రాఫిట్ అడ్వైజర్ ఓపెన్ చేయండి",
        path: "/farmer/profit",
      };
    }

    if (isHindi) {
      return {
        title: "लाभ विश्लेषण",
        text:
          "मैं अभी बेचने और कुछ दिनों तक स्टोर करके बाद में बेचने के लाभ की तुलना कर सकता हूं। इसमें स्टोरेज लागत, भविष्य की कीमत और फसल खराब होने का जोखिम शामिल है।",
        action: "प्रॉफिट एडवाइजर खोलें",
        path: "/farmer/profit",
      };
    }

    return {
      title: "Profit analysis",
      text:
        "I can compare selling your crop today with storing it for a few days. Storage cost, expected price increase and spoilage risk are considered.",
      action: "Open Profit Advisor",
      path: "/farmer/profit",
    };
  }

  // DEFAULT
  if (isTelugu) {
    return {
      title: "నేను మీకు సహాయం చేస్తాను",
      text:
        "మీరు పంట ధరలు, మంచి మార్కెట్లు, కోల్డ్ స్టోరేజ్, బయ్యర్లు, అమ్మే సమయం లేదా భవిష్యత్ లాభాల గురించి నన్ను అడగవచ్చు.",
      action: "ప్రాఫిట్ అడ్వైజర్",
      path: "/farmer/profit",
    };
  }

  if (isHindi) {
    return {
      title: "मैं आपकी मदद कर सकता हूं",
      text:
        "आप मुझसे फसल की कीमत, बाजार, कोल्ड स्टोरेज, खरीदार, बेचने का सही समय और भविष्य के लाभ के बारे में पूछ सकते हैं।",
      action: "प्रॉफिट एडवाइजर",
      path: "/farmer/profit",
    };
  }

  if (isTamil) {
    return {
      title: "நான் உங்களுக்கு உதவ முடியும்",
      text:
        "பயிர் விலை, சந்தை, குளிர்சாதன சேமிப்பு, வாங்குபவர்கள், விற்பனை நேரம் மற்றும் எதிர்கால லாபம் பற்றி என்னிடம் கேட்கலாம்.",
      action: "லாப ஆலோசகர்",
      path: "/farmer/profit",
    };
  }

  if (isKannada) {
    return {
      title: "ನಾನು ನಿಮಗೆ ಸಹಾಯ ಮಾಡಬಹುದು",
      text:
        "ಬೆಳೆ ಬೆಲೆ, ಮಾರುಕಟ್ಟೆ, ಕೋಲ್ಡ್ ಸ್ಟೋರೇಜ್, ಖರೀದಿದಾರರು, ಮಾರಾಟದ ಸಮಯ ಮತ್ತು ಭವಿಷ್ಯದ ಲಾಭದ ಬಗ್ಗೆ ನನ್ನನ್ನು ಕೇಳಬಹುದು.",
      action: "ಲಾಭ ಸಲಹೆಗಾರ",
      path: "/farmer/profit",
    };
  }

  if (isMalayalam) {
    return {
      title: "എനിക്ക് നിങ്ങളെ സഹായിക്കാം",
      text:
        "വിളയുടെ വില, വിപണി, കോൾഡ് സ്റ്റോറേജ്, വാങ്ങുന്നവർ, വിൽപ്പന സമയം, ഭാവിയിലെ ലാഭം എന്നിവയെക്കുറിച്ച് എന്നോട് ചോദിക്കാം.",
      action: "ലാഭ ഉപദേഷ്ടാവ്",
      path: "/farmer/profit",
    };
  }

  if (isMarathi) {
    return {
      title: "मी तुम्हाला मदत करू शकतो",
      text:
        "तुम्ही पिकांचे दर, बाजारपेठ, कोल्ड स्टोरेज, खरेदीदार, विक्रीची योग्य वेळ आणि भविष्यातील नफ्याबद्दल मला विचारू शकता.",
      action: "प्रॉफिट अ‍ॅडव्हायझर",
      path: "/farmer/profit",
    };
  }

  if (isBengali) {
    return {
      title: "আমি আপনাকে সাহায্য করতে পারি",
      text:
        "আপনি ফসলের দাম, বাজার, কোল্ড স্টোরেজ, ক্রেতা, বিক্রির সঠিক সময় এবং ভবিষ্যতের লাভ সম্পর্কে আমাকে জিজ্ঞাসা করতে পারেন।",
      action: "প্রফিট অ্যাডভাইজার",
      path: "/farmer/profit",
    };
  }

  return {
    title: "I can help with that",
    text:
      "You can ask me about crop prices, profitable markets, cold storage, buyers, selling decisions or future profit.",
    action: "Open Profit Advisor",
    path: "/farmer/profit",
  };
}

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      text:
        "Hello! I am your Smart Farming Assistant. Tell me what you want to know about your crops, markets, storage or selling decisions.",
    },
  ]);

  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("en-IN");
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [autoListen, setAutoListen] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [supported, setSupported] = useState(true);
const [voices, setVoices] = useState([]);
  const recognitionRef = useRef(null);
  const shouldListenRef = useRef(true);
  const mountedRef = useRef(true);

  const stopListening = useCallback(() => {
    shouldListenRef.current = false;

    try {
      recognitionRef.current?.stop();
    } catch {
      // Recognition may already be stopped.
    }

    setListening(false);
  }, []);

  const speak = useCallback(
  (text) => {
    if (!voiceEnabled || !("speechSynthesis" in window)) {
      setSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Get all voices available in the browser
    const voices = window.speechSynthesis.getVoices();

    // Example:
    // te-IN -> te
    // hi-IN -> hi
    // ta-IN -> ta
    // en-IN -> en
    const languageCode = language.split("-")[0].toLowerCase();

    // First try exact language
    let selectedVoice = voices.find(
      (voice) =>
        voice.lang.toLowerCase() === language.toLowerCase()
    );

    // If exact voice is not available,
    // try the base language
    if (!selectedVoice) {
      selectedVoice = voices.find((voice) =>
        voice.lang
          .toLowerCase()
          .startsWith(languageCode)
      );
    }

    // Use the selected language voice
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.lang = language;

    // Slightly slower for Indian languages
    utterance.rate = 0.88;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      if (mountedRef.current) {
        setSpeaking(true);
      }
    };

    utterance.onend = () => {
      if (!mountedRef.current) return;

      setSpeaking(false);

      if (autoListen) {
        setTimeout(() => {
          if (mountedRef.current) {
            startListening();
          }
        }, 500);
      }
    };

    utterance.onerror = () => {
      if (mountedRef.current) {
        setSpeaking(false);
      }
    };

    window.speechSynthesis.speak(utterance);
  },
  [language, voiceEnabled, autoListen]
);

  const processMessage = useCallback(
    (text) => {
      const cleanText = text.trim();

      if (!cleanText) return;

      const userMessage = {
        id: Date.now(),
        role: "user",
        text: cleanText,
      };

      const result = generateResponse(cleanText, language);

      const assistantMessage = {
        id: Date.now() + 1,
        role: "assistant",
        text: result.text,
        title: result.title,
        action: result.action,
        path: result.path,
      };

      setMessages((prev) => [
        ...prev,
        userMessage,
        assistantMessage,
      ]);

      setInput("");

      if (autoListen) {
        shouldListenRef.current = true;
      }

      setTimeout(() => {
        speak(result.text);
      }, 150);
    },
    [autoListen, speak,language]
  );

  const startListening = useCallback(() => {
    if (!supported) return;

    const Recognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!Recognition) {
      setSupported(false);
      return;
    }

    if (listening || speaking) return;

    shouldListenRef.current = autoListen;

    const recognition = new Recognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      if (!mountedRef.current) return;

      setListening(true);
    };

    recognition.onresult = (event) => {
      const transcript =
        event.results?.[0]?.[0]?.transcript || "";

      setListening(false);

      try {
        recognition.stop();
      } catch {
        // Already stopped.
      }

      processMessage(transcript);
    };

    recognition.onerror = () => {
      if (!mountedRef.current) return;

      setListening(false);

      if (autoListen) {
        shouldListenRef.current = false;
      }
    };

    recognition.onend = () => {
      if (!mountedRef.current) return;

      setListening(false);
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      setListening(false);
    }
  }, [
    autoListen,
    language,
    listening,
    processMessage,
    speaking,
    supported,
  ]);
 useEffect(() => {
  if (!("speechSynthesis" in window)) return;

  const loadVoices = () => {
    setVoices(window.speechSynthesis.getVoices());
  };

  loadVoices();

  window.speechSynthesis.onvoiceschanged = loadVoices;

  return () => {
    window.speechSynthesis.onvoiceschanged = null;
  };
}, []);
  useEffect(() => {
    const Recognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!Recognition) {
      setSupported(false);
    }

    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      shouldListenRef.current = false;

      try {
        recognitionRef.current?.stop();
      } catch {
        // Ignore cleanup error.
      }

      window.speechSynthesis?.cancel();
    };
  }, []);

  useEffect(() => {
    if (!supported) return;

    const timer = setTimeout(() => {
      startListening();
    }, 700);

    return () => clearTimeout(timer);
  }, [supported]);
const clearHistory = useCallback(() => {
  const confirmed = window.confirm(
    "Are you sure you want to clear your chat history?"
  );

  if (!confirmed) return;

  window.speechSynthesis?.cancel();

  stopListening();

  setSpeaking(false);
  setInput("");

  setMessages([
    {
      id: Date.now(),
      role: "assistant",
      text:
        "Hello! I am your Smart Farming Assistant. Tell me what you want to know about your crops, markets, storage or selling decisions.",
    },
  ]);
}, [stopListening]);
  const sendMessage = () => {
    if (!input.trim()) return;

    stopListening();
    processMessage(input);
  };

  return (
    <DashboardLayout>
      <div className="ai-page grid min-h-[calc(100vh-120px)] gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">

        {/* Main AI */}
        <section className="sf-card flex min-h-[650px] flex-col overflow-hidden">

          {/* Header */}
          <div className="flex flex-col gap-4 border-b border-[#e7ece5] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#dff3e4] text-[#18864b]">
                <Bot size={23} />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-black text-[#1d3024]">
                    Farm AI Assistant
                  </h1>

                  <span className="flex items-center gap-1 rounded-full bg-[#eaf7ec] px-2 py-1 text-[10px] font-bold text-[#18864b]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#36a85e]" />
                    ONLINE
                  </span>
                </div>

                <p className="text-xs text-[#829087]">
                  Your voice-powered farming companion
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="rounded-xl border border-[#e0e7df] bg-white px-3 py-2 text-xs font-semibold text-[#506057] outline-none"
              >
                {languages.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.name}
                  </option>
                ))}
              </select>

              <button
                onClick={() => {
                  setVoiceEnabled((prev) => !prev);

                  if (voiceEnabled) {
                    window.speechSynthesis?.cancel();
                    setSpeaking(false);
                  }
                }}
                className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                  voiceEnabled
                    ? "border-[#cfe4d2] bg-[#eef8ef] text-[#18864b]"
                    : "border-gray-200 bg-gray-50 text-gray-400"
                }`}
              >
                
                {voiceEnabled ? (
                  <Volume2 size={17} />
                ) : (
                  <VolumeX size={17} />
                )}
              </button>
              <button
  onClick={clearHistory}
  title="Clear chat history"
  className="flex h-10 items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 text-red-600 transition hover:bg-red-100"
>
  <Trash2 size={16} />

  <span className="hidden sm:inline text-xs font-bold">
    Clear History
  </span>
</button>
            </div>
          </div>

          {/* Conversation */}
          <div className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-7">

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] ${
                    message.role === "user"
                      ? "rounded-[20px] rounded-br-md bg-[#18864b] px-5 py-3.5 text-white"
                      : "flex gap-3"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#e5f4e8] text-[#18864b]">
                      <Bot size={17} />
                    </div>
                  )}

                  <div>
                    {message.title && (
                      <p className="mb-1 font-black text-[#25382b]">
                        {message.title}
                      </p>
                    )}

                    <p
                      className={`text-sm leading-6 ${
                        message.role === "user"
                          ? "text-white"
                          : "text-[#5f6d64]"
                      }`}
                    >
                      {message.text}
                    </p>

                    {message.action && (
                      <button
                        onClick={() =>
                          window.location.href = message.path
                        }
                        className="mt-3 rounded-xl bg-[#eaf7ec] px-3 py-2 text-xs font-bold text-[#18864b]"
                      >
                        {message.action}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Listening status */}
            {listening && (
              <div className="flex items-center gap-3 rounded-2xl bg-[#f0f8f1] p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#dff3e4] text-[#18864b]">
                  <Mic size={17} />
                </div>

                <div>
                  <p className="text-sm font-bold text-[#285237]">
                    I'm listening...
                  </p>

                  <p className="text-xs text-[#79907f]">
                    Speak naturally. I'll stop listening automatically.
                  </p>
                </div>

                <div className="ml-auto flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-[#42a866]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-[#42a866] [animation-delay:120ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-[#42a866] [animation-delay:240ms]" />
                </div>
              </div>
            )}

            {speaking && (
              <div className="flex items-center gap-3 rounded-2xl bg-[#f8f4e8] p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fff5d9] text-[#a87916]">
                  <Volume2 size={17} />
                </div>

                <div>
                  <p className="text-sm font-bold text-[#68501d]">
                    Speaking...
                  </p>

                  <p className="text-xs text-[#95835a]">
                    I'll listen again when I'm finished.
                  </p>
                </div>
              </div>
            )}

            {!supported && (
              <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800">
                Voice recognition isn't supported in this browser.
                You can still type your question below.
              </div>
            )}
          </div>

          {/* Voice Orb */}
          <div className="border-t border-[#e7ece5] px-5 pb-4 pt-5">
            <div className="flex flex-col items-center">

              <div
                className={
                  listening
                    ? "sf-ai-listening"
                    : ""
                }
              >
                <button
                  onClick={() => {
                    if (listening) {
                      stopListening();
                    } else {
                      startListening();
                    }
                  }}
                  disabled={!supported}
                  className={`sf-ai-orb ${
                    !supported
                      ? "cursor-not-allowed opacity-50"
                      : ""
                  }`}
                  aria-label={
                    listening
                      ? "Stop listening"
                      : "Start listening"
                  }
                >
                  {listening ? (
                    <MicOff
                      size={35}
                      className="text-white"
                    />
                  ) : (
                    <Mic
                      size={35}
                      className="text-white"
                    />
                  )}
                </button>
              </div>

              <p className="mt-4 text-sm font-bold text-[#33463a]">
                {listening
                  ? "Listening..."
                  : speaking
                    ? "Speaking..."
                    : "Tap to speak"}
              </p>

              <p className="mt-1 text-[11px] text-[#89968e]">
                {autoListen
                  ? "Automatic voice mode is ON"
                  : "Automatic voice mode is OFF"}
              </p>
            </div>
          </div>

          {/* Text Input */}
          <div className="border-t border-[#e7ece5] p-4">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendMessage();
                  }
                }}
                placeholder="Type your farming question..."
                className="sf-input"
              />

              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl bg-[#18864b] text-white disabled:opacity-40"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </section>

        {/* Right panel */}
        <aside className="space-y-5">

          {/* AI status */}
          <div className="sf-card overflow-hidden">
            <div className="bg-[#123d26] p-6 text-white">
              <div className="flex items-center gap-2 text-[#ccebd3]">
                <Sparkles size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Voice mode
                </span>
              </div>

              <h2 className="mt-3 text-xl font-black">
                Talk naturally.
              </h2>

              <p className="mt-2 text-sm leading-5 text-[#c4d9ca]">
                No need to press the microphone for every question.
              </p>
            </div>

            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-[#34483a]">
                    Automatic listening
                  </p>

                  <p className="mt-1 text-xs text-[#849189]">
                    Listen again after each answer
                  </p>
                </div>

                <button
                  onClick={() => {
                    setAutoListen((prev) => !prev);
                    shouldListenRef.current = !autoListen;
                  }}
                  className={`relative h-6 w-11 rounded-full ${
                    autoListen
                      ? "bg-[#18864b]"
                      : "bg-[#ccd4cd]"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
                      autoListen
                        ? "left-6"
                        : "left-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Suggestions */}
          <div className="sf-card p-5">
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#94a097]">
                Try asking
              </p>

              <h2 className="mt-1 font-black text-[#26382d]">
                Smart questions
              </h2>
            </div>

            <div className="space-y-2">
              {suggestions.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.title}
                    onClick={() => {
                      setInput(item.text);
                      processMessage(item.text);
                    }}
                    className="group flex w-full items-center gap-3 rounded-2xl p-3 text-left transition hover:bg-[#f1f7f1]"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eef7ef] text-[#18864b]">
                      <Icon size={17} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#35483b]">
                        {item.title}
                      </p>

                      <p className="mt-0.5 truncate text-[11px] text-[#8a978f]">
                        {item.text}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Capabilities */}
          <div className="sf-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eaf6ec] text-[#18864b]">
                <Bot size={17} />
              </div>

              <h2 className="font-black text-[#293b30]">
                I can help with
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                "Crop prices",
                "Market comparison",
                "Cold storage",
                "Profit",
                "Buyers",
                "Selling time",
                "Future prices",
                "Storage cost",
              ].map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-[#f2f6f1] px-3 py-1.5 text-[10px] font-semibold text-[#718078]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </DashboardLayout>
  );
}