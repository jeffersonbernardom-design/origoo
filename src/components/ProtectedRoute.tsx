import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const ProtectedRoute = ({ children, requireSuperAdmin = false }: { children: JSX.Element; requireSuperAdmin?: boolean }) => {
  const { user, loading, isSuperAdmin } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-soft">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (requireSuperAdmin && !isSuperAdmin) return <Navigate to="/" replace />;
  return children;
};

export default ProtectedRoute;