import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { UrlInput } from '@/components/UrlInput';
import { CoverLetterGenerator } from '@/components/CoverLetterGenerator';
import { Header } from '@/components/Header';

const Index = () => {
  const [cvContent, setCvContent] = useState('');
  const [jobContent, setJobContent] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a242f] to-[#222f3a] dark:from-white dark:to-gray-100">
      <Header />
      <div className="container max-w-2xl mx-auto space-y-16 pt-24 p-8">
        <div className="text-center space-y-6">
          <h1 className="text-6xl font-bold">
            <span className="span-gradient-text">Free AI cover letter generator</span>
          </h1>
          <p className="container max-w-2xl mx-auto text-muted-foreground max-w-lg text-white dark:text-gray-600">
            Upload your resume and provide a job posting URL to generate a tailored cover letter
          </p>
        </div>
        <div className="space-y-16">
          <UrlInput onUrlContent={setJobContent} />
        </div>
        <div className="grid gap-8">
        </div>
      </div>
    </div>
  );
};

export default Index;