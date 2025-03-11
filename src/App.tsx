
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Account from "./pages/Account";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";
import { analyticsService } from "./services/analyticsService";

const queryClient = new QueryClient();

const App = () => {
  // Initialize analytics when the app loads
  useEffect(() => {
    // Check if this is a returning user
    const isReturningUser = localStorage.getItem('hasSeenWelcome') === 'true';
    if (isReturningUser) {
      analyticsService.startSession(false);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/account" element={<Account />} />
            <Route path="/privacy" element={<Privacy />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
