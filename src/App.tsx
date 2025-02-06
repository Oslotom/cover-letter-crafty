import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/Header";
import Index from "@/pages/Index";
import Applications from "@/pages/Applications";
import Application from "@/pages/Application";
import Chat from "@/pages/Chat";
import Contact from "@/pages/Contact";
import JobDetails from "@/pages/JobDetails";
import JobProcessor from "@/pages/JobProcessor";
import Prompt from "@/pages/Prompt";
import Roadmap from "@/pages/Roadmap";
import NotFound from "@/pages/NotFound";
import MyResume from "@/pages/MyResume";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Header />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/application/:id" element={<Application />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/job-details" element={<JobDetails />} />
          <Route path="/job-processor" element={<JobProcessor />} />
          <Route path="/prompt" element={<Prompt />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/my-resume" element={<MyResume />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;