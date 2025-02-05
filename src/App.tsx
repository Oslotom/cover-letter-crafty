import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import Index from './pages/Index';
import Chat from './pages/Chat';
import Prompt from './pages/Prompt';
import Contact from './pages/Contact';
import Roadmap from './pages/Roadmap';
import NotFound from './pages/NotFound';
import JobProcessor from './pages/JobProcessor';
import JobDetails from './pages/JobDetails';
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <ThemeProvider defaultTheme="light" attribute="class">
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/prompt" element={<Prompt />} />
          <Route path="/job-processor" element={<JobProcessor />} />
          <Route path="/job-details" element={<JobDetails />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </Router>
    </ThemeProvider>
  );
}

export default App;