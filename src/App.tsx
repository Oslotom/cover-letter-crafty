import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { Navigation } from "@/components/Navigation";
import Index from "./pages/Index";
import AIChat from "./pages/AIChat";
import SignUp from "./pages/SignUp";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <Navigation />
        <DarkModeToggle />
        <Toaster />
        <Sonner />
        <div className="pt-16"> {/* Add padding for the fixed navbar */}
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/chat" element={<AIChat />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;