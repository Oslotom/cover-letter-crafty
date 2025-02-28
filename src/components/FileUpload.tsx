import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

import * as pdfjs from 'pdfjs-dist';
import { Upload, Check } from "lucide-react";

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();

interface FileUploadProps {
  onFileContent: (content: string) => void;
  contentType: 'cv' | 'job';
  showSuccessInButton?: boolean;
}

export const FileUpload = ({ onFileContent, contentType, showSuccessInButton }: FileUploadProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);


  const extractTextFromPdf = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }
      
      return fullText;
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw new Error('Failed to extract text from PDF');
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (5MB limit)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > MAX_FILE_SIZE) {
     
      return;
    }

    // Check file type
    const allowedTypes = ['application/pdf', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
     
      return;
    }

    setIsLoading(true);
    try {
      let content: string;
      
      if (file.type === 'application/pdf') {
        content = await extractTextFromPdf(file);
      } else {
        content = await file.text();
      }

      const fileName = `${Date.now()}-${contentType}.txt`;
      
      const { error: uploadError } = await supabase.storage
        .from('pdfs')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      onFileContent(content);
      setIsSuccess(true);
      
    } catch (error) {
      console.error('Error processing file:', error);
      
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center space-x-4">
        <input
          type="file"
          onChange={handleFileChange}
          accept=".pdf,.txt"
          disabled={isLoading}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="flex-1 flex items-center justify-center px-6 py-12 border-2 border-dashed 
            border-border rounded-lg cursor-pointer hover:border-foreground/40 transition-colors
            bg-background/50 relative group"
        >
          <div className="text-center text-foreground/60 group-hover:text-foreground/80 transition-colors">
            {isSuccess ? (
              <>
                <Check className="mx-auto h-6 w-6 mb-2 text-green-500" />
                <p>Resume uploaded successfully</p>
              </>
            ) : (
              <>
                <Upload className="mx-auto h-6 w-6 mb-2" />
                <p>Click to upload resume (PDF or TXT)</p>
                <p className="text-sm">Max file size: 5MB</p>
              </>
            )}
          </div>
        </label>
      </div>
    </div>
  );
};