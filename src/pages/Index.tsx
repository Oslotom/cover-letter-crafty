import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { UrlInput } from '@/components/UrlInput';
import { CoverLetterGenerator } from '@/components/CoverLetterGenerator';
import { Card } from "@/components/ui/card";

const Index = () => {
  const [cvContent, setCvContent] = useState('');
  const [jobContent, setJobContent] = useState('');

  const features = [
    {
      icon: (
        <img 
          src="/placeholder.svg" 
          alt="Job Analysis" 
          className="w-12 h-12"
        />
      ),
      title: "Smart Job Analysis",
      description: "Automatically extracts and analyzes job descriptions from URLs to understand key requirements and responsibilities."
    },
    {
      icon: (
        <img 
          src="/placeholder.svg" 
          alt="LinkedIn Integration" 
          className="w-12 h-12"
        />
      ),
      title: "LinkedIn Integration",
      description: "Connect your LinkedIn profile or upload your resume to generate personalized cover letters based on your experience."
    },
    {
      icon: (
        <img 
          src="/placeholder.svg" 
          alt="AI Writing" 
          className="w-12 h-12"
        />
      ),
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

        <div className="space-y-6">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="h-[50px] flex items-center space-x-4"
            >
              <div className="flex-shrink-0">
                {feature.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;