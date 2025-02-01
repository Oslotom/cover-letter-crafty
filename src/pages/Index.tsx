import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { UrlInput } from '@/components/UrlInput';
import { CoverLetterGenerator } from '@/components/CoverLetterGenerator';

const Index = () => {
  const [cvContent, setCvContent] = useState('');
  const [jobContent, setJobContent] = useState('');

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Cover Letter Generator</h1>
          <p className="text-muted-foreground">
            Upload your CV and provide a job posting URL to generate a tailored cover letter
          </p>
        </div>

        <div className="grid gap-8">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">1. Upload your CV</h2>
            <FileUpload onFileContent={setCvContent} />
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-semibold">2. Enter Job Posting URL</h2>
            <UrlInput onUrlContent={setJobContent} />
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-semibold">3. Generate Cover Letter</h2>
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