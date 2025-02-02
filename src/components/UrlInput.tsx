import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, Link, FileText } from "lucide-react";

interface UrlInputProps {
  onUrlContent: (content: string) => void;
}

export const UrlInput = ({ onUrlContent }: UrlInputProps) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAnalyzeButton, setShowAnalyzeButton] = useState(false);
  const [inputMessage, setInputMessage] = useState('Paste the URL to the job description');
  const [showUploadButton, setShowUploadButton] = useState(false);
  const [showViewResumeButton, setShowViewResumeButton] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setShowAnalyzeButton(url.length > 0);
  }, [url]);

  const updateMessage = async (messages: string[], delay: number = 3000) => {
    for (const message of messages) {
      setInputMessage(message);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  };

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
    setShowAnalyzeButton(false);
    
    try {
      await updateMessage([
        "Opening website...",
        "Analysing job description...",
        "Done. Upload your resume to continue"
      ]);

      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      
      if (!data.contents) throw new Error('Failed to fetch URL content');
      
      const doc = new DOMParser().parseFromString(data.contents, 'text/html');
      
      const scripts = doc.getElementsByTagName('script');
      const styles = doc.getElementsByTagName('style');
      [...scripts, ...styles].forEach(el => el.remove());
      
      const textContent = doc.body.textContent || '';
      const cleanText = textContent
        .replace(/\s+/g, ' ')
        .trim();
      
      onUrlContent(cleanText);
      setShowUploadButton(true);

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
      setInputMessage('Error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'text/plain') {
        toast({
          title: "Invalid file type",
          description: "Please upload a text file",
          variant: "destructive",
        });
        return;
      }
      
      setShowUploadButton(false);
      await updateMessage([
        "Uploading resume...",
        "Analyzing resume...",
        "Writing cover letter...",
        "All done"
      ]);
      
      try {
        const text = await file.text();
        onUrlContent(text.trim());
        setShowViewResumeButton(true);
        toast({
          title: "Success",
          description: "CV uploaded successfully",
        });
      } catch (error) {
        console.error('Error processing text file:', error);
        toast({
          title: "Error",
          description: "Failed to process text file",
          variant: "destructive",
        });
      }
    }
  };

  const handleViewResume = () => {
    // Navigate to the cover letter page
    window.location.href = '/cover-letter';
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex">
        <div className="relative flex-grow">
          <Input
            type="url"
            placeholder={inputMessage}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            style={{ borderRadius: '15px', width: '100%', height: '70px', paddingRight: '40px' }}
          />
          {showAnalyzeButton && (
            <Button
              type="submit"
              disabled={isLoading}
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                right: 0,
                padding: '0px 35px',
                margin: '6px',
                height: '60px',
                borderRadius: '15px',
                background: 'linear-gradient(to right, rgb(64, 160, 255), rgb(143, 80, 255))',
              }}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                <>
                  <Link className="mr-2 h-4 w-4" />
                  Analyze
                </>
              )}
            </Button>
          )}
          {showUploadButton && (
            <>
              <input
                type="file"
                id="file-input"
                accept=".txt"
                className="hidden"
                onChange={handleFileSelect}
              />
              <Button
                onClick={() => document.getElementById('file-input')?.click()}
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  right: 0,
                  padding: '0px 35px',
                  margin: '6px',
                  height: '60px',
                  borderRadius: '15px',
                  background: 'linear-gradient(to right, rgb(64, 160, 255), rgb(143, 80, 255))',
                }}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Resume
              </Button>
            </>
          )}
          {showViewResumeButton && (
            <Button
              onClick={handleViewResume}
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                right: 0,
                padding: '0px 35px',
                margin: '6px',
                height: '60px',
                borderRadius: '15px',
                background: 'linear-gradient(to right, rgb(64, 160, 255), rgb(143, 80, 255))',
              }}
            >
              <FileText className="mr-2 h-4 w-4" />
              View Resume
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};