import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import FarmerDashboard from "./pages/farmer/FarmerDashboard";
import AIAssistant from "./pages/farmer/AIAssistant";
import MyCrops from "./pages/farmer/MyCrops";
import Market from "./pages/farmer/Market";
import ProfitAdvisor from "./pages/farmer/ProfitAdvisor";
import ColdStorages from "./pages/farmer/ColdStorages";
import StorageBooking from "./pages/farmer/StorageBooking";
import Buyers from "./pages/farmer/Buyers";
import Bookings from "./pages/farmer/Bookings";
import FarmerMap from "./pages/farmer/FarmerMap";
import Notifications from "./pages/farmer/Notifications";
import Profile from "./pages/farmer/Profile";
import StorageDashboard from "./pages/storage/StorageDashboard";
import Inventory from "./pages/storage/Inventory";
import StorageBookings from "./pages/storage/StorageBookings";
import StorageAnalytics from "./pages/storage/StorageAnalytics";
import StorageProfile from "./pages/storage/StorageProfile";
import BuyerDashboard from "./pages/buyer/BuyerDashboard";
import Requirements from "./pages/buyer/Requirements";
import AvailableCrops from "./pages/buyer/AvailableCrops";
import Orders from "./pages/buyer/Orders";
import BuyerAnalytics from "./pages/buyer/BuyerAnalytics";
import BuyerProfile from "./pages/buyer/BuyerProfile";
import FarmerOrders from "./pages/farmer/Orders";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Users from "./pages/admin/Users";
import ManageStorages from "./pages/admin/ManageStorages";
import ManageBuyers from "./pages/admin/ManageBuyers";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminSettings from "./pages/admin/AdminSettings";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";

function Protected({ role, children }) {
  return (
    <ProtectedRoute role={role}>
      {children}
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ================= FARMER ================= */}

        <Route
          path="/farmer"
          element={
            <Protected role="farmer">
              <FarmerDashboard />
            </Protected>
          }
        />

        <Route
          path="/farmer/ai"
          element={
            <Protected role="farmer">
              <AIAssistant />
            </Protected>
          }
        />

        <Route
          path="/farmer/crops"
          element={
            <Protected role="farmer">
              <MyCrops />
            </Protected>
          }
        />

        <Route
          path="/farmer/market"
          element={
            <Protected role="farmer">
              <Market />
            </Protected>
          }
        />

        <Route
          path="/farmer/profit"
          element={
            <Protected role="farmer">
              <DashboardLayout>
                <ProfitAdvisor />
              </DashboardLayout>
            </Protected>
          }
        />

        <Route
          path="/farmer/storage"
          element={
            <Protected role="farmer">
              <ColdStorages />
            </Protected>
          }
        />

        <Route
          path="/farmer/storage/:id"
          element={
            <Protected role="farmer">
              <StorageBooking />
            </Protected>
          }
        />

        <Route
          path="/farmer/buyers"
          element={
            <Protected role="farmer">
              <Buyers />
            </Protected>
          }
        />

        <Route
          path="/farmer/bookings"
          element={
            <Protected role="farmer">
              <Bookings />
            </Protected>
          }
        />

        <Route
          path="/farmer/map"
          element={
            <Protected role="farmer">
              <FarmerMap />
            </Protected>
          }
        />

        <Route
          path="/farmer/notifications"
          element={
            <Protected role="farmer">
              <DashboardLayout>
                <Notifications />
              </DashboardLayout>
            </Protected>
          }
        />

        <Route
          path="/farmer/profile"
          element={
            <Protected role="farmer">
              <Profile />
            </Protected>
          }
        />

        {/* ================= STORAGE ================= */}

        <Route
          path="/storage"
          element={
            <Protected role="storage">
              
                <StorageDashboard />
              </Protected>
          }
        />

        <Route
          path="/storage/inventory"
          element={
            <Protected role="storage">
              <DashboardLayout>
                <Inventory />
              </DashboardLayout>
            </Protected>
          }
        />

        <Route
          path="/storage/bookings"
          element={
            <Protected role="storage">
              <DashboardLayout>
                <StorageBookings />
              </DashboardLayout>
            </Protected>
          }
        />

        <Route
          path="/storage/analytics"
          element={
            <Protected role="storage">
              <DashboardLayout>
                <StorageAnalytics />
              </DashboardLayout>
            </Protected>
          }
        />

        <Route
          path="/storage/profile"
          element={
            <Protected role="storage">
              <DashboardLayout>
                <StorageProfile />
              </DashboardLayout>
            </Protected>
          }
        />

        {/* ================= BUYER ================= */}

        <Route
          path="/buyer"
          element={
            <Protected role="buyer">
                <BuyerDashboard />     
            </Protected>
          }
        />

        <Route
          path="/buyer/requirements"
          element={
            <Protected role="buyer">
              
              <Requirements />
           
            </Protected>
          }
        />

        <Route
          path="/buyer/crops"
          element={
            <Protected role="buyer">
          
                <AvailableCrops />
             
            </Protected>
          }
        />

        <Route
          path="/buyer/orders"
          element={
            <Protected role="buyer">
             
              <Orders />
             
            </Protected>
          }
        />

        <Route
          path="/buyer/analytics"
          element={
            <Protected role="buyer">
              <DashboardLayout>
                <BuyerAnalytics />
              </DashboardLayout>
            </Protected>
          }
        />

        <Route
          path="/buyer/profile"
          element={
            <Protected role="buyer">
              <DashboardLayout>
                <BuyerProfile />
              </DashboardLayout>
            </Protected>
          }
        />
        {/* ================= ADMIN ================= */}
        <Route
          path="/admin"
          element={
            <Protected role="admin">
              <DashboardLayout>
              <AdminDashboard />
              </DashboardLayout>
            </Protected>
          }
        />
        <Route
          path="/admin/users"
          element={
            <Protected role="admin">
              <DashboardLayout>
                <Users />
              </DashboardLayout>
            </Protected>
          }
        />
        <Route
          path="/admin/storages"
          element={
            <Protected role="admin">
              <DashboardLayout>
                <ManageStorages />
              </DashboardLayout>
            </Protected>
          }
        />
        <Route
          path="/admin/buyers"
          element={
            <Protected role="admin">
              <DashboardLayout>
                <ManageBuyers />
              </DashboardLayout>
            </Protected>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <Protected role="admin">
              <DashboardLayout>
              <AdminAnalytics />
              </DashboardLayout>
            </Protected>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <Protected role="admin">
              <DashboardLayout>
              <AdminSettings />
              </DashboardLayout>
            </Protected>
          }
        />
        <Route
  path="/farmer/orders"
  element={
    <Protected role="farmer">
      <FarmerOrders />
    </Protected>
  }
/>
        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}