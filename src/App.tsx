
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Header } from '@/components/Header';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import Applications from '@/pages/Applications';
import Application from '@/pages/Application';
import Add from '@/pages/Add';
import JobDetails from '@/pages/JobDetails';
import Chat from '@/pages/Chat';
import Contact from '@/pages/Contact';
import Roadmap from '@/pages/Roadmap';
import JobProcessor from '@/pages/JobProcessor';
import NotFound from '@/pages/NotFound';
import Prompt from '@/pages/Prompt';
import CoverLetter from '@/pages/CoverLetter';
import Profile from '@/pages/Profile';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Router>
        <div className="min-h-screen bg-background">
          <Header />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/application/:id" element={<Application />} />
            <Route path="/add" element={<Add />} />
            <Route path="/job-details" element={<JobDetails />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/roadmap" element={<Roadmap />} />
            <Route path="/job-processor" element={<JobProcessor />} />
            <Route path="/prompt" element={<Prompt />} />
            <Route path="/cover-letter/:id" element={<CoverLetter />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Toaster />
      </Router>
    </ThemeProvider>
  );
}

export default App;
