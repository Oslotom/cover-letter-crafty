import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Chat from './pages/Chat';
import Prompt from './pages/Prompt';
import NotFound from './pages/NotFound';
import JobProcessor from './pages/JobProcessor';
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/prompt" element={<Prompt />} />
        <Route path="/job-processor" element={<JobProcessor />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;