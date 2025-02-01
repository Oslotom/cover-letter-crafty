import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { UrlInput } from '@/components/UrlInput';
import { CoverLetterGenerator } from '@/components/CoverLetterGenerator';

const Index = () => {
  const [cvContent, setCvContent] = useState('');
  const [jobContent, setJobContent] = useState('');

  
  return (
    <div className="min-h-screen py-8 bg-gradient-to-b from-[#1a242f] to-[#222f3a] "> {/* Added gradient background */}
      <div className="container max-w-2xl mx-auto space-y-16 pt-16 p-8">
        <div className="text-center space-y-6  ">
          
        <h1 className="text-6xl font-bold">
          
            <span className="span-gradient-text">Free AI cover letter generator</span>
          </h1>       
             <p className="container max-w-2xl mx-auto text-muted-foreground max-w-lg text-white ">Upload your resume and provide a job posting URL to generate a tailored cover letter</p>
        </div>
          <div className="space-y-16">
            <UrlInput onUrlContent={setJobContent} />
          </div>
          <div className="grid gap-8">
          <div className="space-y-6">
            <FileUpload onFileContent={setCvContent} />
          </div>
          <div className="space-y-6 ">
            <CoverLetterGenerator
              cvContent={cvContent}
              jobContent={jobContent}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;