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
            <span className="span-gradient-text">Cover Letter Generator</span>
          </h1>       
             <p className="text-muted-foreground text-center max-w-lg text-white ">Upload your CV and provide a job posting URL to generate a tailored cover letter
 </p>
        </div>

       

          <div className="space-y-2">
        
            <UrlInput onUrlContent={setJobContent} />
          </div>

          <div className="grid gap-8">
          <div className="space-y-2">
            <h2 className="text-lg text-white">2. Upload your CV</h2>
            <FileUpload onFileContent={setCvContent} />
          </div>

          <div className="space-y-2">
            <h2 className="text-lg text-white">3. Generate Cover Letter</h2>
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