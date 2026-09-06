import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Bot,
  Sprout,
  TrendingUp,
  Warehouse,
  Map,
  Users,
  CalendarCheck,
  Bell,
  User,
  Package,
  ClipboardList,
  BarChart3,
  ShoppingBasket,
  ShoppingCart,
  Settings,
  LogOut,
  Leaf,
  X,
  Menu,
} from "lucide-react";

const menus = {
  farmer: [
    ["Dashboard", "/farmer", LayoutDashboard],
    ["AI Assistant", "/farmer/ai", Bot],
    ["My Crops", "/farmer/crops", Sprout],
    ["Market Intelligence", "/farmer/market", TrendingUp],
    ["Profit Advisor", "/farmer/profit", TrendingUp],
    ["Cold Storages", "/farmer/storage", Warehouse],
    ["Explore Map", "/farmer/map", Map],
    ["Buyers", "/farmer/buyers", Users],
    ["My Bookings", "/farmer/bookings", CalendarCheck],
    ["My Orders", "/farmer/orders", ShoppingCart],
    ["Notifications", "/farmer/notifications", Bell],
    ["Profile", "/farmer/profile", User],
  ],

  storage: [
    ["Dashboard", "/storage", LayoutDashboard],
    ["Inventory", "/storage/inventory", Package],
    ["Booking Requests", "/storage/bookings", ClipboardList],
    ["Analytics", "/storage/analytics", BarChart3],
    ["Profile", "/storage/profile", User],
  ],

  buyer: [
    ["Dashboard", "/buyer", LayoutDashboard],
    ["Requirements", "/buyer/requirements", ClipboardList],
    ["Available Crops", "/buyer/crops", ShoppingBasket],
    ["Orders", "/buyer/orders", ShoppingCart],
    ["Analytics", "/buyer/analytics", BarChart3],
    ["Profile", "/buyer/profile", User],
  ],

  admin: [
    ["Dashboard", "/admin", LayoutDashboard],
    ["Users", "/admin/users", Users],
    ["Storages", "/admin/storages", Warehouse],
    ["Buyers", "/admin/buyers", ShoppingBasket],
    ["Analytics", "/admin/analytics", BarChart3],
    ["Settings", "/admin/settings", Settings],
  ],
};

function getRole(pathname) {
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/storage")) return "storage";
  if (pathname.startsWith("/buyer")) return "buyer";
  return "farmer";
}

export default function Sidebar({ mobileOpen, onClose }) {
   const [collapsed, setCollapsed] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const role = getRole(location.pathname);

  const roleLabel = {
    farmer: "Farmer",
    storage: "Storage Owner",
    buyer: "Buyer",
    admin: "Administrator",
  };

  const homePath = {
    farmer: "/farmer",
    storage: "/storage",
    buyer: "/buyer",
    admin: "/admin",
  };

  const logout = () => {
    localStorage.removeItem("farmerUser");
    localStorage.removeItem("storageUser");
    localStorage.removeItem("buyerUser");
    localStorage.removeItem("adminUser");
    localStorage.removeItem("smartFarmerToken");

    navigate("/login", { replace: true });
    onClose?.();
  };

  const isActive = (path) => {
    if (path === homePath[role]) {
      return location.pathname === path;
    }

    return (
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
    );
  };

  return (
    <>
      {/* =========================
          MOBILE OVERLAY
      ========================= */}

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={onClose}
          className="
            fixed inset-0 z-40
            bg-black/30
            backdrop-blur-[2px]
            lg:hidden
          "
        />
      )}

      {/* =========================
          SIDEBAR
      ========================= */}

      <aside
        className={`
           ${collapsed ? "sf-sidebar-collapsed" : ""}
          fixed inset-y-0 left-0 z-50
          flex flex-col


          border-r border-[#dfeae2]

          bg-[#fbfdf9]

          shadow-[8px_0_30px_rgba(20,70,35,0.07)]

          transition-all duration-300 ease-out

          lg:translate-x-0
          lg:shadow-none
       ${collapsed ? "lg:w-[82px] w-[270px]" : "w-[270px]"}

          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >

      {/* =========================
    HEADER
========================= */}

<div
  className={`
    relative shrink-0
    ${collapsed ? "h-[78px]" : "h-[78px]"}
    border-b border-[#e6eee8]
    flex items-center
    ${collapsed ? "justify-center px-2" : "justify-between px-4"}
  `}
>
  {/* Logo */}
  <button
    type="button"
    onClick={() => {
      navigate(homePath[role]);
      onClose?.();
    }}
    className="flex shrink-0 items-center"
    aria-label="Smart Farmer"
  >
    <div
      className="
        flex h-10 w-10 shrink-0
        items-center justify-center
        rounded-2xl
        bg-[#dff4e4]
        text-[#168348]
        shadow-sm
      "
    >
      <Leaf size={21} strokeWidth={2.5} />
    </div>

    {!collapsed && (
      <div className="ml-3 text-left">
        <div className="text-[17px] font-extrabold tracking-tight text-[#173021]">
          Smart Farmer
        </div>

        <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#78907d]">
          {roleLabel[role]}
        </div>
      </div>
    )}
  </button>

  {/* Hamburger */}
  <button
    type="button"
    onClick={() => setCollapsed((value) => !value)}
    className={`
      hidden lg:flex
      h-9 w-9 shrink-0
      items-center justify-center
      rounded-xl
      text-[#66746a]
      transition
      hover:bg-[#e8f4ea]
      hover:text-[#16713a]
      ${collapsed ? "absolute left-1/2 -translate-x-1/2 bottom-1" : ""}
    `}
    aria-label="Toggle sidebar"
  >
    <Menu size={20} strokeWidth={2} />
  </button>

  {/* Mobile Close */}
  <button
    type="button"
    onClick={onClose}
    className="
      rounded-xl p-2
      text-[#718078]
      transition
      hover:bg-[#edf5ee]
      hover:text-[#176638]
      lg:hidden
    "
    aria-label="Close navigation"
  >
    <X size={19} />
  </button>
</div>

        {/* =========================
            NAVIGATION
        ========================= */}

        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto

            px-2
            py-1
          "
        >

          {/* Section */}

       

          <nav className="space-y-1">
            {menus[role].map(
              ([label, path, Icon]) => {
                const active = isActive(path);

                return (
                  <NavLink
                    key={path}
                    to={path}
                    onClick={() => {
  if (window.innerWidth < 1024) {
    onClose();
  }
}}
                    aria-current={
                      active
                        ? "page"
                        : undefined
                    }
                    className={`
                      group

                      flex
                      min-w-0
                      items-center
                     ${collapsed ? "justify-center px-0" : ""}

                      rounded-2xl

                      
                      py-2.5
                      ${collapsed ? "justify-center px-0" : "gap-3 px-3.5"}
                      text-[13px]
                      font-semibold

                      transition-all
                      duration-150

                      ${
                        active
                          ? `
                            bg-[#e2f5e7]
                            text-[#137641]
                          `
                          : `
                            text-[#66746a]
                            hover:bg-[#f0f6f1]
                            hover:text-[#244b31]
                          `
                      }
                    `}
                  >

                    {/* Icon box */}

                    <span
                      className={`
                        flex
                        h-9
                        w-9
                        shrink-0

                        items-center
                        justify-center

                        rounded-xl

                        transition

                        ${
                          active
                            ? `
                              bg-white
                              text-[#18864b]
                              shadow-sm
                            `
                            : `
                              bg-transparent
                              text-[#7d8b81]
                              group-hover:bg-white
                              group-hover:text-[#356345]
                            `
                        }
                      `}
                    >
                      <Icon
                        size={18}
                        strokeWidth={
                          active
                            ? 2.3
                            : 2
                        }
                      />
                    </span>

                    {/* Label */}

{!collapsed && (
  <span className="min-w-0 truncate">
    {label}
  </span>
)}

                    {/* Active dot */}

                    {active && !collapsed && (
  <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-[#18864b]" />
)}
                  </NavLink>
                );
              }
            )}
          </nav>
        </div>

        {/* =========================
            BOTTOM AREA
        ========================= */}

        <div
          className="
            shrink-0

            border-t
            border-[#e6eee8]

            p-3
          "
        >

          {/* Smart farming card */}

          <div
            className={`
  rounded-2xl
  border
  border-[#dfece2]
  bg-[#eef8f0]
  transition-all
  duration-300
  ${
    collapsed
      ? "mx-auto mb-2 flex h-12 w-12 items-center justify-center p-0"
      : "mb-3 p-3"
  }
`}
          >
            <div className={collapsed ? "flex items-center justify-center" : "flex items-center gap-2"}>

              {/* Icon */}

              <div
                className="
                  flex
                  h-9
                  w-9
                  shrink-0

                  items-center
                  justify-center

                  rounded-xl

                  bg-white
                  text-[#18864b]

                  shadow-sm
                "
              >
                <Leaf
                  size={16}
                  strokeWidth={2.3}
                />
              </div>

              {/* Text */}

             <div
  className={`
    min-w-0
    overflow-hidden
    transition-all
    duration-300

    ${
      collapsed
        ? "lg:w-0 lg:opacity-0"
        : "lg:w-auto lg:opacity-100"
    }
  `}
>
  <p className="text-xs font-bold text-[#31503a]">
    Smart Farming
  </p>

  <p className="text-[10px] text-[#7b8c7f]">
    Better decisions. Better profits.
  </p>
</div>

            </div>
          </div>

          {/* Logout */}

        <button
  type="button"
  onClick={logout}
  title={collapsed ? "Sign out" : undefined}
  className={`flex w-full items-center rounded-2xl py-3 text-sm font-semibold text-gray-500 transition hover:bg-red-50 hover:text-red-600 ${
    collapsed ? "justify-center px-0" : "gap-3 px-3.5"
  }`}
>
  <LogOut size={18} />

  {!collapsed && <span>Sign out</span>}
</button>

        </div>
      </aside>
    </>
  );
}