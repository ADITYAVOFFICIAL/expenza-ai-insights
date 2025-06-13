import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Layout from "./components/Layout";
import { Wallet } from "lucide-react"; // Import the Wallet icon

const queryClient = new QueryClient();

// Lazy load page components
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const AddExpense = React.lazy(() => import("./pages/AddExpense"));
const Analytics = React.lazy(() => import("./pages/Analytics"));
const Groups = React.lazy(() => import("./pages/Groups"));
const Goals = React.lazy(() => import("./pages/Goals"));
const Recurring = React.lazy(() => import("./pages/Recurring"));
const Reports = React.lazy(() => import("./pages/Reports"));
const Profile = React.lazy(() => import("./pages/Profile"));
const PassBook = React.lazy(() => import("./pages/Passbook"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const Login = React.lazy(() => import("./pages/Login"));
const Signup = React.lazy(() => import("./pages/Signup"));
const LandingPage = React.lazy(() => import("./components/LandingPage")); // Or src/pages/LandingPage.tsx if that's the one used for routing

// A simple loader component for Suspense fallback
const PageLoader = () => (
  <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
    <p className="mt-2 text-muted-foreground">Loading...</p>
  </div>
);

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
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="*" element={<LandingPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="add-expense" element={<AddExpense />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="groups" element={<Groups />} />
            <Route path="goals" element={<Goals />} />
            <Route path="recurring" element={<Recurring />} />
            <Route path="reports" element={<Reports />} />
            <Route path="profile" element={<Profile />} />
            <Route path="passbook" element={<PassBook />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <TooltipProvider>
            <AppContent />
            <Toaster />
            <Sonner />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
