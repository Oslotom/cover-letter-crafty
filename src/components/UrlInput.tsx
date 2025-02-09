
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, Link2 } from "lucide-react";
import { FileUpload } from './FileUpload';

interface UrlInputProps {
  onUrlContent: (content: string) => void;
}

export function UrlInput({ onUrlContent }: UrlInputProps) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [stage, setStage] = useState<'url' | 'resume' | 'view'>('url');
  const [cvContent, setCvContent] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };

  const updateStatus = async (messages: string[], delay = 2000) => {
    for (const message of messages) {
      setStatus(message);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  };

  const handleLoadClick = async () => {
    if (!url.trim()) return;
    
    setIsLoading(true);
    setStage('resume'); // Hide the Analyze button immediately
    try {
      await updateStatus([
        'Opening website...',
        'Analyzing job description...',
        'Job description loaded'
      ]);

      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      
      if (!data.contents) throw new Error('Failed to fetch URL content');
      
      const doc = new DOMParser().parseFromString(data.contents, 'text/html');
      const scripts = doc.getElementsByTagName('script');
      const styles = doc.getElementsByTagName('style');
      [...scripts, ...styles].forEach(el => el.remove());
      
      const textContent = doc.body.textContent || '';
      const cleanText = textContent.replace(/\s+/g, ' ').trim();
      
      setJobDescription(cleanText);
      onUrlContent(cleanText);
      
      setStatus('Upload resume');
      setStage('resume');
    } catch (error) {
      console.error('Error fetching URL:', error);
      setStatus('Error loading job posting');
      setStage('url'); // Return to URL input stage on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileContent = async (content: string) => {
    setCvContent(content);
    setStatus('Resume uploaded successfully');
    await new Promise(resolve => setTimeout(resolve, 1000));
    setStage('view');
  };

  const handleView = () => {
    navigate('/job-processor', { 
      state: { 
        jobContent: jobDescription,
        sourceUrl: url,
        cvContent,
        shouldGenerateOnMount: true
      }
    });
  };

  return (
    <div className="w-full p-4 rounded-lg bg-black/5 dark:bg-white/10">
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <input
            type="url"
            placeholder="Add link to job description here"
            className="w-full bg-transparent outline-none rounded-md px-4 py-2
              transition-all duration-300 border-transparent"
            value={status || url}
            onChange={handleUrlChange}
            readOnly={isLoading || stage !== 'url'}
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin" />
          )}
        </div>
        {stage === 'url' && url.trim() && (
          <Button
            onClick={handleLoadClick}
            variant="default"
            className="px-6 h-[50px] transition flex items-center gap-2
              bg-gradient-to-r from-purple-500 to-pink-600 hover:opacity-90"
            disabled={!url || isLoading}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>Analyze</span>
          </Button>
        )}
        {stage === 'resume' && (
          <Button
            onClick={() => document.getElementById('file-upload')?.click()}
            variant="default"
            className="h-[50px] bg-gradient-to-r from-purple-500 to-pink-600 hover:opacity-90 transition flex items-center gap-2 px-4"
          >
            <Upload className="w-4 h-4" />
            <span>Upload</span>
          </Button>
        )}
        {stage === 'view' && (
          <Button
            onClick={handleView}
            variant="default"
            className="px-6 h-[50px] bg-gradient-to-r from-purple-500 to-pink-600 hover:opacity-90 transition"
          >
            View
          </Button>
        )}
      </div>
      <div className="hidden">
        <FileUpload onFileContent={handleFileContent} contentType="cv" />
      </div>
    </div>
  );
}
