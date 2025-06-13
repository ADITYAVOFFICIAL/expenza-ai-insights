import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import AddExpense from "./pages/AddExpense";
import Analytics from "./pages/Analytics";
import Groups from "./pages/Groups";
import Goals from "./pages/Goals";
import Recurring from "./pages/Recurring";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import LandingPage from "./components/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PassBook from "./pages/Passbook";
import { Wallet } from "lucide-react"; // Import the Wallet icon

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background">
        <div className="text-center">
          <div className="relative flex items-center justify-center mb-6">
            {/* Pulsing background circles */}
            <div className="absolute w-20 h-20 bg-primary/10 rounded-full animate-ping opacity-75"></div>
            <div
              className="absolute w-28 h-28 bg-primary/5 rounded-full animate-ping opacity-50"
              style={{ animationDelay: "0.3s" }}
            ></div>

            {/* DigiSamahārta Icon */}
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl">
              <Wallet className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <p className="text-lg font-medium text-foreground animate-pulse">
            Loading DigiSamahārta...
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Please wait a moment.
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="add-expense" element={<AddExpense />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="groups" element={<Groups />} />
          <Route path="goals" element={<Goals />} />
          <Route path="recurring" element={<Recurring />} />
          <Route path="reports" element={<Reports />} />
          <Route path="passbook" element={<PassBook />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider> {/* Moved AuthProvider to wrap ThemeProvider */}
        <ThemeProvider defaultTheme="system" storageKey="digisamaharta-ui-theme">
          <TooltipProvider>
            <div className="min-h-screen w-full">
              <Toaster />
              <Sonner />
              <AppContent />
            </div>
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider> {/* AuthProvider ends */}
    </QueryClientProvider>
  );
};

export default App;
