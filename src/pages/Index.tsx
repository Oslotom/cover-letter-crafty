import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { UrlInput } from '@/components/UrlInput';
import { CoverLetterGenerator } from '@/components/CoverLetterGenerator';
import { Card } from "@/components/ui/card";
import { FileText, Link, Sparkles } from "lucide-react";

const Index = () => {
  const [cvContent, setCvContent] = useState('');
  const [jobContent, setJobContent] = useState('');

  const features = [
    {
      icon: <FileText className="w-8 h-8 text-blue-500" />,
      title: "Smart Job Analysis",
      description: "Automatically extracts and analyzes job descriptions from URLs to understand key requirements and responsibilities."
    },
    {
      icon: <Link className="w-8 h-8 text-purple-500" />,
      title: "LinkedIn Integration",
      description: "Connect your LinkedIn profile or upload your resume to generate personalized cover letters based on your experience."
    },
    {
      icon: <Sparkles className="w-8 h-8 text-pink-500" />,
      title: "AI-Powered Writing",
      description: "Uses advanced AI to create tailored cover letters that match your experience with job requirements."
    }
  ];
  
  return (
    <div className="min-h-screen py-8 bg-gradient-to-b from-[#1a242f] to-[#222f3a]">
      <div className="container max-w-2xl mx-auto space-y-16 pt-16 p-8">
        <div className="text-center space-y-6">
          <h1 className="text-6xl font-bold">
            <span className="span-gradient-text">Free AI cover letter generator</span>
          </h1>       
          <p className="container max-w-2xl mx-auto text-muted-foreground max-w-lg text-white">
            Upload your resume and provide a job posting URL to generate a tailored cover letter
          </p>
        </div>
        
        <div className="space-y-16">
          <UrlInput onUrlContent={setJobContent} />
        </div>

        {/* Features Section - Now one per row */}
        <div className="space-y-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="p-6 border-white/20 backdrop-blur-sm hover:bg-white/5 transition-all duration-300"
            >
              <div className="flex items-start space-x-4">
                <div className="rounded-full w-12 h-12 flex items-center justify-center bg-white/10">
                  {feature.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;