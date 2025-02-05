import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { UrlInput } from '@/components/UrlInput';
import { Briefcase, FileText, Sparkles } from "lucide-react";

const Index = () => {
  const [cvContent, setCvContent] = useState('');
  const [jobContent, setJobContent] = useState('');

  const features = [
    {
      icon: Briefcase,
      title: "Smart Job Analysis",
      description: "Automatically extracts and analyzes job descriptions from URLs to understand key requirements and responsibilities."
    },
    {
      icon: FileText,
      title: "LinkedIn Integration",
      description: "Connect your LinkedIn profile or upload your resume to generate personalized cover letters based on your experience."
    },
    {
      icon: Sparkles,
      title: "AI-Powered Writing",
      description: "Uses advanced AI to create tailored cover letters that match your experience with job requirements."
    }
  ];
  
  return (
    <div className="min-h-screen py-8 bg-gradient-to-b from-[#1a242f] to-[#222f3a]">
      <div className="container max-w-2xl mx-auto space-y-2 pt-16 p-6">
        <div className="text-center space-y-4">
          <h1 className="text-6xl">
            <span className="span-gradient-text">Create free cover letter with AI </span>
          </h1>       
          
          <p className="text-muted-foreground text-white p-6">
            Just add the job description link and upload your resume. No fuss, totally free. No login. 
          </p>
        </div>
        
        <div className=" max-w-4xl mx-auto">
          <UrlInput onUrlContent={setJobContent} />
        </div>

        <div className="space-y-6 p-2">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index} 
                className={`flex items-center ${
                  index % 2 === 1 ? 'flex-row-reverse' : ''
                }`}
              >
                <div className="w-[70%] justify-center">
                  <div className=" w-16 h-16 p-4 flex items-center justify-center bg-white/10 rounded-2xl">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className=" space-y-2">
                  <h3 className="text-2xl font-semibold text-white">{feature.title}</h3>
                  <p className="text-gray-300 text-lg leading-relaxed">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Index;