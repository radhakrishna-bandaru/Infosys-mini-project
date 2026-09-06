import { useEffect, useState } from "react";
import {
  Bell,
  Search,
  Sparkles,
  Menu,
} from "lucide-react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";

export default function Topbar({ onMenuClick }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const getRole = () => {
    if (location.pathname.startsWith("/admin")) {
      return "admin";
    }

    if (location.pathname.startsWith("/storage")) {
      return "storage";
    }

    if (location.pathname.startsWith("/buyer")) {
      return "buyer";
    }

    return "farmer";
  };

  const role = getRole();
  useEffect(() => {
  const fetchUnreadNotifications = async () => {
    try {
      const token = localStorage.getItem("smartFarmerToken");

      if (!token) {
        setUnreadCount(0);
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/notifications",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success && Array.isArray(data.notifications)) {
        const unread = data.notifications.filter(
          (notification) => !notification.read
        ).length;

        setUnreadCount(unread);
      } else {
        setUnreadCount(0);
      }
    } catch {
      setUnreadCount(0);
    }
  };

  fetchUnreadNotifications();
}, [role, location.pathname]);

  useEffect(() => {
    const keys = {
      farmer: "farmerUser",
      storage: "storageUser",
      buyer: "buyerUser",
      admin: "adminUser",
    };

    try {
      const stored = localStorage.getItem(keys[role]);

      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, [role, location.pathname]);

  const roleLabel = {
    farmer: "Farmer",
    storage: "Storage Owner",
    buyer: "Buyer",
    admin: "Administrator",
  };

  const getName = () => {
    if (!user) {
      return "User";
    }

    return (
      user.name ||
      user.fullName ||
      user.ownerName ||
      user.businessName ||
      user.companyName ||
      "User"
    );
  };

  const getInitial = () => {
    return getName().charAt(0).toUpperCase();
  };

  const goToNotifications = () => {
    const paths = {
      farmer: "/farmer/notifications",
      storage: "/storage/bookings",
      buyer: "/buyer/orders",
      admin: "/admin/users",
    };

    navigate(paths[role]);
  };

  const goToAI = () => {
    if (role === "farmer") {
      navigate("/farmer/ai");
    }
  };

  const goToProfile = () => {
    const paths = {
      farmer: "/farmer/profile",
      storage: "/storage/profile",
      buyer: "/buyer/profile",
      admin: "/admin/settings",
    };

    navigate(paths[role]);
  };

  return (
    <header className="sticky top-0 z-30 h-[76px] border-b border-[#e3e9e1] bg-[#f8faf6]/95 backdrop-blur-xl">
      <div className="flex h-full min-w-0 items-center justify-between gap-4 px-4 sm:px-6 lg:px-7">

        {/* LEFT */}
        <div className="flex min-w-0 items-center gap-3">

          {/* MOBILE MENU */}
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            className="
              flex h-10 w-10 shrink-0
              items-center justify-center
              rounded-xl
              border border-[#dfe7dc]
              bg-white
              text-[#536158]
              shadow-sm
              transition
              hover:bg-[#f0f5ef]
              hover:text-[#18864b]
              lg:hidden
            "
          >
            <Menu size={21} />
          </button>

          {/* DESKTOP TITLE */}
          <div className="hidden w-[210px] shrink-0 min-w-0 md:block">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#8a998e]">
              {roleLabel[role]}
            </p>

            <p className="mt-1 truncate text-sm font-bold text-[#203128]">
              Smart Farmer Platform
            </p>
          </div>

          {/* MOBILE TITLE */}
          <div className="min-w-0 md:hidden">
            <p className="truncate text-[15px] font-extrabold text-[#203128]">
              Smart Farmer
            </p>

            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#829087]">
              {roleLabel[role]}
            </p>
          </div>
        </div>

        {/* SEARCH */}
        <div className="hidden min-w-0 max-w-[560px] flex-1 md:block">
          <div className="relative">
            <Search
              size={17}
              className="
                pointer-events-none
                absolute left-4 top-1/2
                -translate-y-1/2
                text-[#91a097]
              "
            />

            <input
              type="text"
              placeholder="Search crops, markets, storages..."
              className="
                w-full
                rounded-2xl
                border border-[#e1e8df]
                bg-white/90
                h-12
                pl-11
                pr-4
                text-sm
                text-[#25352b]
                outline-none
                transition
                placeholder:text-[#9aa69d]
                focus:border-[#62b47e]
                focus:ring-4
                focus:ring-[#62b47e]/10
              "
            />
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">

          {/* AI BUTTON */}
          {role === "farmer" && (
            <button
              type="button"
              onClick={goToAI}
              className="
                hidden
                items-center
                gap-2
                rounded-2xl
                bg-[#e3f5e7]
                px-3.5
                py-2.5
                text-xs
                font-bold
                text-[#187443]
                transition
                hover:bg-[#d8efdd]
                sm:flex
              "
            >
              <Sparkles size={16} />
              Ask AI
            </button>
          )}

          {/* NOTIFICATIONS */}
          <button
            type="button"
            onClick={goToNotifications}
            aria-label="Notifications"
            className="
              relative
              flex h-10 w-10
              items-center justify-center
              rounded-xl
              border border-[#e1e8df]
              bg-white
              text-[#617066]
              shadow-sm
              transition
              hover:border-[#cbd9cc]
              hover:text-[#18864b]
              sm:h-11
              sm:w-11
              sm:rounded-2xl
            "
          >
            <Bell size={20} />
            {unreadCount > 0 && (
  <span
    className="
      absolute right-2 top-2
      h-2.5 w-2.5
      rounded-full
      bg-[#e34f4f]
      ring-2 ring-white
    "
  />
)}
          
          </button>

          {/* USER */}
          <button
            type="button"
            onClick={goToProfile}
            aria-label="Open profile"
            className="
              flex items-center
              gap-2
              rounded-2xl
              border border-[#e1e8df]
              bg-white
              p-1.5
              pr-2
              shadow-sm
              transition
              hover:border-[#cbd9cc]
              hover:bg-[#fbfdf9]
              sm:pr-3
            "
          >
            {/* Avatar */}
            <div
              className="
                flex h-9 w-9
                shrink-0
                items-center justify-center
                rounded-xl
                bg-[#dff3e4]
                text-sm
                font-extrabold
                text-[#18864b]
              "
            >
              {getInitial()}
            </div>

            {/* User details */}
            <div className="hidden max-w-[130px] text-left sm:block">
              <p className="truncate text-xs font-bold text-[#25352b]">
                {getName()}
              </p>

              <p className="mt-0.5 truncate text-[10px] text-[#829087]">
                {roleLabel[role]}
              </p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}