import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface UrlInputProps {
  onUrlContent: (content: string) => void;
}

export function UrlInput({ onUrlContent }: UrlInputProps) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };

  const handleLoadClick = async () => {
    if (!url.trim()) return;
    
    setIsLoading(true);
    try {
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
      
      // Navigate to the job processor page with the job content
      navigate('/job-processor', { 
        state: { 
          jobContent: cleanText,
          sourceUrl: url, // Add the source URL to the state
        }
      });
    } catch (error) {
      console.error('Error fetching URL:', error);
      toast({
        title: "Error",
        description: "Failed to load job posting",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full p-6 rounded-lg bg-white/10 text-white border border-white/20">
      <div className="flex items-center gap-4">
        <input
          type="url"
          placeholder="Paste job posting URL"
          className="flex-1 bg-transparent outline-none"
          value={url}
          onChange={handleUrlChange}
        />
        <Button
          onClick={handleLoadClick}
          variant="default"
          className="px-6 h-[40px] bg-gradient-to-r from-purple-500 to-pink-600 hover:opacity-90 transition flex items-center gap-2"
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          <span>Load</span>
        </Button>
      </div>
    </div>
  );
}
