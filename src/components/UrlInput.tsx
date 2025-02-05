import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload } from "lucide-react";
import { FileUpload } from './FileUpload';

interface UrlInputProps {
  onUrlContent: (content: string) => void;
}

export function UrlInput({ onUrlContent }: UrlInputProps) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [stage, setStage] = useState<'url' | 'resume' | 'create' | 'view'>('url');
  const [cvContent, setCvContent] = useState('');
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
      
      onUrlContent(cleanText);
      
      setStatus('Click to upload your resume');
      setStage('resume');
    } catch (error) {
      console.error('Error fetching URL:', error);
      toast({
        title: "Error",
        description: "Failed to load job posting",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileContent = async (content: string) => {
    setCvContent(content);
    await updateStatus([
      'Uploading resume...',
      'Reading resume...',
      'I am ready to create a cover letter'
    ]);
    setStage('create');
  };

  const handleCreate = async () => {
    await updateStatus([
      'Analyzing data...',
      'Generating cover letter...',
      'Cover letter is complete'
    ]);
    setStage('view');
  };

  const handleView = () => {
    navigate('/job-processor', { 
      state: { 
        jobContent: url,
        sourceUrl: url,
        cvContent
      }
    });
  };

  return (
    <div className="w-full p-4 rounded-lg bg-white/10 text-white">
      <div className="flex items-center gap-4">
        <input
          type="url"
          placeholder="Insert link to job description here"
          className={`flex-1 bg-transparent outline-none border-2 rounded-md px-4 py-2
            ${url ? 'border-gradient shadow-lg' : 'border-white/20'}
            transition-all duration-300`}
          value={status || url}
          onChange={handleUrlChange}
          readOnly={isLoading || stage !== 'url'}
          style={{
            borderImage: url ? 'linear-gradient(90deg, #0090f7, #ae65fb 25%, #e14fcf 50%, #ef4283 75%, #f4520b) 1' : 'none'
          }}
        />
        {stage === 'url' && (
          <Button
            onClick={handleLoadClick}
            variant="default"
            className={`px-10 h-[50px] transition flex items-center gap-2
              ${url ? 'bg-gradient-to-r from-purple-500 to-pink-600 hover:opacity-90' : 'bg-gray-500'}`}
            disabled={!url || isLoading}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>Load</span>
          </Button>
        )}
        {stage === 'resume' && (
          <Button
            onClick={() => document.getElementById('file-upload')?.click()}
            variant="default"
            className="px-10 h-[50px] bg-gradient-to-r from-purple-500 to-pink-600 hover:opacity-90 transition flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>Upload</span>
          </Button>
        )}
        {stage === 'create' && (
          <Button
            onClick={handleCreate}
            variant="default"
            className="px-10 h-[50px] bg-gradient-to-r from-purple-500 to-pink-600 hover:opacity-90 transition"
          >
            Create
          </Button>
        )}
        {stage === 'view' && (
          <Button
            onClick={handleView}
            variant="default"
            className="px-10 h-[50px] bg-gradient-to-r from-purple-500 to-pink-600 hover:opacity-90 transition"
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