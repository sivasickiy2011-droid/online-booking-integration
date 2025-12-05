
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppModeProvider } from "@/contexts/AppModeContext";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import Embed from "./pages/Embed";
import WidgetDoctor from "./pages/WidgetDoctor";
import WidgetCalc from "./pages/WidgetCalc";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppModeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/embed" element={<Embed />} />
            <Route path="/widget-doctor" element={<WidgetDoctor />} />
            <Route path="/widget-calc" element={<WidgetCalc />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AppModeProvider>
  </QueryClientProvider>
);

export default App;