import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface UrlInputProps {
  onUrlContent: (content: string) => void;
}

export const UrlInput = ({ onUrlContent }: UrlInputProps) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url) {
      toast({
        title: "Error",
        description: "Please enter a URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      
      if (!data.contents) throw new Error('Failed to fetch URL content');
      
      // Create a temporary element to parse HTML
      const doc = new DOMParser().parseFromString(data.contents, 'text/html');
      
      // Remove scripts, styles, and other unwanted elements
      const scripts = doc.getElementsByTagName('script');
      const styles = doc.getElementsByTagName('style');
      [...scripts, ...styles].forEach(el => el.remove());
      
      // Get text content
      const textContent = doc.body.textContent || '';
      const cleanText = textContent
        .replace(/\s+/g, ' ')
        .trim();
      
      onUrlContent(cleanText);
      toast({
        title: "Success",
        description: "Job description extracted successfully",
      });
    } catch (error) {
      console.error('Error fetching URL:', error);
      toast({
        title: "Error",
        description: "Failed to fetch job description",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="url"
        placeholder="Enter job posting URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="flex-1"
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Extract"}
      </Button>
    </form>
  );
};