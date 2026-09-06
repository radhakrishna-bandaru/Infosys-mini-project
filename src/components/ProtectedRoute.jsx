import { Navigate, useLocation } from "react-router-dom";
import { isLoggedIn } from "../utils/auth";

export default function ProtectedRoute({
  role,
  children,
}) {
  const location = useLocation();

  if (!isLoggedIn(role)) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  return children;
}