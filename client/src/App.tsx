import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import LocalWave from "./pages/LocalWave";
import HomePage from "./pages/HomePage";
import AuthPage from "@/pages/AuthPage";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./context/AuthContext";
import { LocalWaveProvider } from "./context/LocalWaveContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LocalWave} />
      <ProtectedRoute path="/home" component={HomePage} />
      <ProtectedRoute path="/chat" component={LocalWave} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LocalWaveProvider>
          <Router />
          <Toaster />
        </LocalWaveProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
