import { createContext, useContext, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

const LayoutContext = createContext(false);

export default function DashboardLayout({ children }) {
  const alreadyInside = useContext(LayoutContext);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (alreadyInside) {
    return children;
  }

  return (
    <LayoutContext.Provider value={true}>
      <div className="sf-app-shell">
        <Sidebar
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
        />

        <div className="sf-app-main">
          <Topbar
            onMenuClick={() => setMobileOpen(true)}
          />

          <main className="sf-main">
            <div className="sf-content px-2 sm:px-4 lg:px-6">
    {children}
            </div>
          </main>
        </div>
      </div>
    </LayoutContext.Provider>
  );
}