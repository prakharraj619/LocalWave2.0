import { useEffect } from "react";
import { Route, useLocation } from "wouter";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType;
}

export function ProtectedRoute({ path, component }: ProtectedRouteProps) {
  const { user, username, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user && !username) {
      setLocation("/auth");
    }
  }, [user, username, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return <Route path={path} component={component} />;
}
