import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bot,
  CheckCircle2,
  ChevronRight,
  Globe2,
  IndianRupee,
  MapPin,
  Menu,
  Mic,
  Play,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  Truck,
  Warehouse,
  X,
} from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "AI Farming Assistant",
    text: "Ask questions by voice or text and get practical farming guidance instantly.",
  },
  {
    icon: TrendingUp,
    title: "Market Intelligence",
    text: "Compare market prices and identify better selling opportunities.",
  },
  {
    icon: Warehouse,
    title: "Smart Cold Storage",
    text: "Discover storage facilities, capacity, rent and distance in one place.",
  },
  {
    icon: IndianRupee,
    title: "Profit Advisor",
    text: "Compare selling now versus storing your crop for a better return.",
  },
  {
    icon: ShoppingCart,
    title: "Buyer Discovery",
    text: "Find buyers looking for your crops and send offers directly.",
  },
  {
    icon: Truck,
    title: "Transport Intelligence",
    text: "Consider transportation cost while comparing your final profit.",
  },
];

const roles = [
  {
    icon: "🌾",
    title: "Farmers",
    text: "Grow smarter, store better and sell at the right opportunity.",
    points: [
      "AI recommendations",
      "Market comparison",
      "Cold storage discovery",
    ],
  },
  {
    icon: "🏭",
    title: "Storage Owners",
    text: "Manage inventory, bookings, occupancy and facility performance.",
    points: [
      "Capacity management",
      "Booking requests",
      "Revenue analytics",
    ],
  },
  {
    icon: "🛒",
    title: "Buyers",
    text: "Discover available crops and build a reliable procurement network.",
    points: [
      "Crop discovery",
      "Requirements",
      "Order management",
    ],
  },
];

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f7faf5] text-[#17221b]">

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-[#e4ebe2] bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1380px] items-center justify-between px-5 sm:px-7 lg:px-10">

          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#18864b] text-white shadow-lg shadow-[#18864b]/15">
              <span className="text-lg">🌱</span>
            </div>

            <div>
              <p className="text-base font-black tracking-tight">
                Smart Farmer
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#819087]">
                AI Agriculture
              </p>
            </div>
          </Link>
          <nav className="hidden items-center gap-7 md:flex">
            <a href="#features" className="text-sm font-semibold text-[#657269] hover:text-[#18864b]">
              Features
            </a>

            <a href="#how-it-works" className="text-sm font-semibold text-[#657269] hover:text-[#18864b]">
              How it works
            </a>

            <a href="#roles" className="text-sm font-semibold text-[#657269] hover:text-[#18864b]">
              For everyone
            </a>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              to="/login"
              className="rounded-xl px-4 py-2.5 text-sm font-bold text-[#31503b] hover:bg-[#f0f6ef]"
            >
              Sign in
            </Link>

            <Link
              to="/register"
              className="sf-button sf-button-primary"
            >
              Get started
              <ArrowRight size={16} />
            </Link>
          </div>

          <button
            onClick={() => setMenuOpen((value) => !value)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0f5ef] text-[#31503b] md:hidden"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-[#e4ebe2] bg-white px-5 py-5 md:hidden">
            <div className="space-y-2">
              <a
                href="#features"
                onClick={() => setMenuOpen(false)}
                className="block rounded-xl px-4 py-3 text-sm font-semibold hover:bg-[#f3f7f2]"
              >
                Features
              </a>

              <a
                href="#how-it-works"
                onClick={() => setMenuOpen(false)}
                className="block rounded-xl px-4 py-3 text-sm font-semibold hover:bg-[#f3f7f2]"
              >
                How it works
              </a>

              <a
                href="#roles"
                onClick={() => setMenuOpen(false)}
                className="block rounded-xl px-4 py-3 text-sm font-semibold hover:bg-[#f3f7f2]"
              >
                For everyone
              </a>

              <div className="grid grid-cols-2 gap-2 pt-3">
                <Link
                  to="/login"
                  className="rounded-xl border border-[#dfe8de] py-3 text-center text-sm font-bold"
                >
                  Sign in
                </Link>

                <Link
                  to="/register"
                  className="sf-button sf-button-primary"
                >
                  Get started
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <main>

        <section className="relative overflow-hidden">
          <div className="absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-[#7bd69b]/15 blur-3xl" />
          <div className="absolute -left-40 top-[40%] h-[400px] w-[400px] rounded-full bg-[#b5dca4]/10 blur-3xl" />

          <div className="relative mx-auto grid max-w-[1380px] items-center gap-14 px-5 py-16 sm:px-7 sm:py-20 lg:grid-cols-[1.02fr_0.98fr] lg:px-10 lg:py-24">

            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#d7e8d9] bg-white px-4 py-2 text-xs font-bold text-[#347149] shadow-sm">
                <Sparkles size={15} />
                AI-powered agriculture platform
              </div>

              <h1 className="text-5xl font-black leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
                Farm smarter.
                <span className="block text-[#18864b]">
                  Sell better.
                </span>
                Earn more.
              </h1>

              <p className="mt-7 max-w-xl text-base leading-7 text-[#68766d] sm:text-lg">
                Smart Farmer brings AI recommendations, market intelligence,
                cold storage, buyers and profit analysis together for modern
                agriculture.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/register"
                  className="sf-button sf-button-primary px-6 py-3.5"
                >
                  Start for free
                  <ArrowRight size={18} />
                </Link>

                <a
                  href="#how-it-works"
                  className="sf-button sf-button-secondary px-6 py-3.5"
                >
                  <Play size={16} />
                  See how it works
                </a>
              </div>

              <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3">
                {[
                  "AI recommendations",
                  "Local market data",
                  "No backend required",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 text-xs font-semibold text-[#68766d]"
                  >
                    <CheckCircle2
                      size={15}
                      className="text-[#18864b]"
                    />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* AI DASHBOARD MOCKUP */}
            <div className="relative mx-auto w-full max-w-[600px]">
              <div className="absolute -inset-5 rounded-[36px] bg-[#18864b]/8 blur-2xl" />

              <div className="relative rounded-[30px] border border-[#dfe8df] bg-white p-4 shadow-[0_30px_80px_rgba(31,67,42,0.12)] sm:p-5">

                <div className="flex items-center justify-between border-b border-[#edf1eb] pb-4">
                  <div>
                    <p className="text-xs font-semibold text-[#849087]">
                      AI MARKET ADVISOR
                    </p>
                    <p className="mt-1 text-sm font-black">
                      Today's opportunity
                    </p>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf8ef] text-[#18864b]">
                    <Bot size={18} />
                  </div>
                </div>

                <div className="mt-5 rounded-2xl bg-[#f3f8f2] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold text-[#738078]">
                        RECOMMENDED CROP
                      </p>

                      <p className="mt-1 text-2xl font-black">
                        Tomato
                      </p>

                      <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-[#18864b]">
                        <TrendingUp size={14} />
                        Price opportunity +12.4%
                      </div>
                    </div>

                    <div className="rounded-2xl bg-white p-3 text-[#18864b] shadow-sm">
                      <IndianRupee size={24} />
                    </div>
                  </div>

                  <div className="mt-5 h-24">
                    <div className="flex h-full items-end gap-2">
                      {[35, 42, 38, 55, 51, 70, 82, 76, 94].map(
                        (height, index) => (
                          <div
                            key={index}
                            className="flex-1 rounded-t-lg bg-[#83c99a]"
                            style={{ height: `${height}%` }}
                          />
                        )
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-[#e5ebe3] p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#7b877e]">
                      <MapPin size={14} />
                      Best market
                    </div>

                    <p className="mt-2 text-sm font-black">
                      Gajuwaka Market
                    </p>

                    <p className="mt-1 text-xs text-[#18864b]">
                      ₹2,850 / quintal
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#e5ebe3] p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#7b877e]">
                      <Warehouse size={14} />
                      Storage
                    </div>

                    <p className="mt-2 text-sm font-black">
                      8.4 km away
                    </p>

                    <p className="mt-1 text-xs text-[#18864b]">
                      ₹1.8 / kg / month
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3 rounded-2xl bg-[#103d27] p-4 text-white">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                    <Mic size={18} />
                  </div>

                  <div className="flex-1">
                    <p className="text-xs font-semibold text-white/50">
                      ASK SMART FARMER
                    </p>

                    <p className="mt-1 text-sm font-bold">
                      "Should I sell my tomatoes now?"
                    </p>
                  </div>

                  <ChevronRight size={18} className="text-white/50" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TRUST STRIP */}
        <section className="border-y border-[#e5ebe3] bg-white">
          <div className="mx-auto grid max-w-[1380px] gap-6 px-5 py-7 sm:grid-cols-3 sm:px-7 lg:px-10">
            {[
              [Globe2, "Multilingual", "Built for diverse farming communities"],
              [BarChart3, "Data-driven", "Compare prices, costs and opportunities"],
              [ShieldCheck, "Farmer-first", "Simple tools focused on better decisions"],
            ].map(([Icon, title, text]) => (
              <div
                key={title}
                className="flex items-center gap-4"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#edf7ee] text-[#18864b]">
                  <Icon size={20} />
                </div>

                <div>
                  <p className="text-sm font-black">
                    {title}
                  </p>

                  <p className="mt-0.5 text-xs text-[#77837a]">
                    {text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="mx-auto max-w-[1380px] px-5 py-20 sm:px-7 lg:px-10 lg:py-28">
          <div className="max-w-2xl">
            <p className="text-sm font-black uppercase tracking-[0.15em] text-[#18864b]">
              Everything connected
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              One platform for every important decision.
            </h2>

            <p className="mt-4 text-base leading-7 text-[#6d796f]">
              From planting and storage to selling and procurement, Smart
              Farmer connects the complete agricultural journey.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="sf-card sf-card-hover p-6"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf7ee] text-[#18864b]">
                    <Icon size={22} />
                  </div>

                  <h3 className="mt-5 text-lg font-black">
                    {feature.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[#738078]">
                    {feature.text}
                  </p>

                  <div className="mt-5 flex items-center gap-1 text-xs font-bold text-[#18864b]">
                    Explore feature
                    <ArrowUpRight size={14} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* AI VOICE */}
        <section className="bg-[#103d27]">
          <div className="mx-auto grid max-w-[1380px] items-center gap-12 px-5 py-20 sm:px-7 lg:grid-cols-2 lg:px-10 lg:py-24">

            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/7 px-4 py-2 text-xs font-bold text-[#9ce0b1]">
                <Mic size={15} />
                Voice-first AI
              </div>

              <h2 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
                Just speak.
                <span className="block text-[#8be0a8]">
                  Smart Farmer listens.
                </span>
              </h2>

              <p className="mt-6 max-w-xl text-base leading-7 text-white/60">
                Ask questions naturally in your preferred language. The AI
                assistant can listen, understand your question and respond
                without requiring repeated microphone clicks.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  "Automatic voice listening",
                  "Automatic speech recognition stop",
                  "Text and voice responses",
                  "Multilingual experience",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-sm font-semibold text-white/75"
                  >
                    <CheckCircle2
                      size={17}
                      className="text-[#8be0a8]"
                    />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center">
              <div className="relative flex h-[310px] w-[310px] items-center justify-center rounded-full border border-white/10 bg-white/5">
                <div className="absolute inset-8 rounded-full border border-[#72ce91]/20" />
                <div className="absolute inset-16 rounded-full border border-[#72ce91]/20" />

                <div className="flex h-36 w-36 items-center justify-center rounded-full bg-[#18864b] shadow-[0_0_70px_rgba(68,197,113,0.35)]">
                  <Mic size={42} className="text-white" />
                </div>

                <div className="absolute bottom-5 rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-white/70 backdrop-blur">
                  Listening...
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section
          id="how-it-works"
          className="mx-auto max-w-[1380px] px-5 py-20 sm:px-7 lg:px-10 lg:py-28"
        >
          <div className="text-center">
            <p className="text-sm font-black uppercase tracking-[0.15em] text-[#18864b]">
              Simple workflow
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              From crop to better decision.
            </h2>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-4">
            {[
              ["01", "Add your crop", "Tell Smart Farmer what you're growing and how much."],
              ["02", "Understand the market", "Compare nearby markets, buyers and price opportunities."],
              ["03", "Evaluate storage", "Check cold storage, rent, transport and spoilage risk."],
              ["04", "Choose the best option", "Use AI insights to decide when and where to sell."],
            ].map(([number, title, text]) => (
              <div
                key={number}
                className="relative rounded-3xl border border-[#e1e8df] bg-white p-6"
              >
                <p className="text-4xl font-black text-[#dce9dc]">
                  {number}
                </p>

                <h3 className="mt-5 text-lg font-black">
                  {title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-[#758178]">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ROLES */}
        <section id="roles" className="bg-[#eef5ed]">
          <div className="mx-auto max-w-[1380px] px-5 py-20 sm:px-7 lg:px-10 lg:py-24">

            <div className="max-w-2xl">
              <p className="text-sm font-black uppercase tracking-[0.15em] text-[#18864b]">
                One ecosystem
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                Built for the whole agricultural network.
              </h2>
            </div>

            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {roles.map((role) => (
                <div
                  key={role.title}
                  className="rounded-3xl border border-[#dfe8dd] bg-white p-7"
                >
                  <div className="text-4xl">
                    {role.icon}
                  </div>

                  <h3 className="mt-5 text-xl font-black">
                    {role.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[#748077]">
                    {role.text}
                  </p>

                  <div className="mt-6 space-y-3">
                    {role.points.map((point) => (
                      <div
                        key={point}
                        className="flex items-center gap-2 text-sm font-semibold text-[#415047]"
                      >
                        <CheckCircle2
                          size={16}
                          className="text-[#18864b]"
                        />
                        {point}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-[1380px] px-5 py-20 sm:px-7 lg:px-10 lg:py-28">
          <div className="relative overflow-hidden rounded-[32px] bg-[#18864b] px-6 py-14 text-center sm:px-10">
            <div className="absolute -right-20 -top-32 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

            <div className="relative mx-auto max-w-2xl">
              <p className="text-sm font-bold text-[#b9efc9]">
                READY TO FARM SMARTER?
              </p>

              <h2 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">
                Your next better decision starts here.
              </h2>

              <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-white/70 sm:text-base">
                Create your Smart Farmer workspace and bring your crops,
                markets, storage and buyers together.
              </p>

              <div className="mt-8">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-black text-[#145f35] shadow-xl hover:bg-[#f4faf4]"
                >
                  Create free account
                  <ArrowRight size={17} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-[#e1e8df] bg-white">
        <div className="mx-auto flex max-w-[1380px] flex-col gap-5 px-5 py-8 sm:px-7 md:flex-row md:items-center md:justify-between lg:px-10">

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#18864b] text-sm">
              🌱
            </div>

            <div>
              <p className="text-sm font-black">
                Smart Farmer
              </p>

              <p className="text-[10px] text-[#849087]">
                AI-powered agriculture
              </p>
            </div>
          </div>

          <p className="text-xs text-[#8a958c]">
            © 2026 Smart Farmer. Frontend demo.
          </p>

          <div className="flex items-center gap-5 text-xs font-semibold text-[#6d796f]">
            <Link to="/login" className="hover:text-[#18864b]">
              Login
            </Link>

            <Link to="/register" className="hover:text-[#18864b]">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}