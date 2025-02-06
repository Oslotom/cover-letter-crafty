import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CoverLetterGenerator } from '@/components/CoverLetterGenerator';
import { useToast } from "@/hooks/use-toast";
import { Header } from '@/components/Header';
import { ExternalLink, Link } from "lucide-react";

interface LocationState {
  jobContent: string;
  sourceUrl?: string;
  cvContent?: string;
  shouldGenerateOnMount?: boolean;
}

const JobProcessor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [jobTitle, setJobTitle] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const { jobContent, sourceUrl, cvContent, shouldGenerateOnMount } = (location.state as LocationState) || {};

  useEffect(() => {
    if (!jobContent || !cvContent) {
      navigate('/');
      return;
    }

    const extractJobTitle = async () => {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'Extract ONLY the job title from this job posting. Return ONLY the exact job title, no other text.'
              },
              {
                role: 'user',
                content: jobContent.substring(0, 1000)
              }
            ],
          }),
        });

        const data = await response.json();
        const extractedTitle = data.choices[0].message.content.trim();
        setJobTitle(extractedTitle || 'Job Position');
      } catch (error) {
        console.error('Error extracting job title:', error);
        setJobTitle('Job Position');
      }
    };

    extractJobTitle();
  }, [jobContent, navigate, cvContent]);

  if (!cvContent || !jobContent) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container max-w-4xl mx-auto space-y-8 px-6 md:px-4 py-20 pt-28">
        <div className="text-center space-y-6">
          <p className="text-lg text-muted-foreground">Your Cover Letter</p>
          <h1 className="text-4xl font-bold">
            <span className="span-gradient-text">{jobTitle}</span>
          </h1>
          
          {sourceUrl && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Link className="w-4 h-4" />
              <a href={sourceUrl} target="_blank" rel="noopener noreferrer" 
                className="hover:text-foreground transition-colors">
                {sourceUrl}
              </a>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <CoverLetterGenerator
            cvContent={cvContent}
            jobContent={jobContent}
            isEditing={isEditing}
            onEdit={() => setIsEditing(!isEditing)}
            onDownload={() => {
              const element = document.createElement("a");
              const file = new Blob([cvContent], {type: 'text/plain'});
              element.href = URL.createObjectURL(file);
              element.download = "cover-letter.txt";
              document.body.appendChild(element);
              element.click();
              document.body.removeChild(element);
            }}
            autoGenerate={shouldGenerateOnMount}
          />
        </div>
      </div>
    </div>
  );
};

export default JobProcessor;