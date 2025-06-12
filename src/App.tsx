import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
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
import LandingPage from "./pages/LandingPage";

const queryClient = new QueryClient();

const App = () => {
  // Check if user is authenticated (mock for now)
  const isAuthenticated = localStorage.getItem('expenza-auth') === 'true';

  if (!isAuthenticated) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system" storageKey="expenza-ui-theme">
          <TooltipProvider>
            <div className="min-h-screen w-full">
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="*" element={<LandingPage />} />
                </Routes>
              </BrowserRouter>
            </div>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="expenza-ui-theme">
        <TooltipProvider>
          <div className="min-h-screen w-full">
            <Toaster />
            <Sonner />
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
                  <Route path="profile" element={<Profile />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
