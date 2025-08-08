import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { Navigation } from "@/components/navigation";
import { PlaceholderPage } from "@/components/placeholder-page";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="codecrack-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background text-foreground">
            <Navigation />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route
                path="/problems"
                element={
                  <PlaceholderPage
                    title="Problems"
                    description="Browse coding challenges by difficulty, topic, and company."
                  />
                }
              />
              <Route
                path="/dashboard"
                element={
                  <PlaceholderPage
                    title="Dashboard"
                    description="View your progress, stats, and recent submissions."
                  />
                }
              />
              <Route
                path="/leaderboard"
                element={
                  <PlaceholderPage
                    title="Leaderboard"
                    description="See how you rank against other coders."
                  />
                }
              />
              <Route
                path="/auth"
                element={
                  <PlaceholderPage
                    title="Authentication"
                    description="Sign in or create an account to start coding."
                  />
                }
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
