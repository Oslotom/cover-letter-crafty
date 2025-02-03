import { useState } from 'react';
import { FileText, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './ui/use-toast';
import * as pdfjs from 'pdfjs-dist';

// Configure PDF.js worker
const pdfjsVersion = pdfjs.version;
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.js`;

interface FileUploadProps {
  onFileContent: (content: string) => void;
}

export function FileUpload({ onFileContent }: FileUploadProps) {
  const [isUploaded, setIsUploaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const extractTextFromPDF = async (file: ArrayBuffer): Promise<string> => {
    try {
      const pdf = await pdfjs.getDocument({ data: file }).promise;
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + ' ';
      }
      
      return fullText.trim();
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw error;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && file.type !== 'text/plain') {
      toast({
        title: "Error",
        description: "Please upload a PDF or text file",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      let content: string;
      
      if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        content = await extractTextFromPDF(arrayBuffer);
      } else {
        content = await file.text();
      }

      // Upload file to Supabase Storage
      const fileName = `${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('pdfs')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      onFileContent(content);
      setIsUploaded(true);
      toast({
        title: "Success",
        description: "Resume uploaded successfully",
      });
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: "Error",
        description: "Failed to process file",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <input
        type="file"
        onChange={handleFileChange}
        className="hidden"
        id="file-upload"
        accept=".pdf,.txt"
      />
      <label
        htmlFor="file-upload"
        className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg 
          ${isUploaded 
            ? 'bg-green-500 hover:bg-green-600' 
            : 'bg-blue-500 hover:bg-blue-600'} 
          text-white cursor-pointer transition-colors`}
      >
        {isUploaded ? (
          <Check className="w-4 h-4" />
        ) : (
          <FileText className="w-4 h-4" />
        )}
        <span>{isLoading ? 'Processing...' : 'Upload Resume'}</span>
      </label>
    </div>
  );
}