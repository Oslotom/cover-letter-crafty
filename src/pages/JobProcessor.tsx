import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { CoverLetterGenerator } from '@/components/CoverLetterGenerator';
import { useToast } from "@/hooks/use-toast";
import { Header } from '@/components/Header';
import { ExternalLink, Link } from "lucide-react";

interface LocationState {
  jobContent: string;
  sourceUrl?: string;
  cvContent?: string;
}

const JobProcessor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [jobTitle, setJobTitle] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const { jobContent, sourceUrl, cvContent } = (location.state as LocationState) || { jobContent: '' };

  useEffect(() => {
    if (!jobContent) {
      navigate('/');
      return;
    }
    const extractJobTitle = async () => {
      try {
        const response = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer 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',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: `Extract ONLY the job title or role name from this job posting. Look specifically in the header or at the very beginning of the text for the main job title. Return ONLY the exact job title or role name, nothing else. Example job titles: "Senior Software Engineer", "Product Manager", "Marketing Director".

Text:
${jobContent.substring(0, 1000)}

Return ONLY the job title, no other text:`,
            parameters: {
              max_new_tokens: 20,
              temperature: 0.1,
              top_p: 0.1,
              return_full_text: false
            }
          }),
        });

        const data = await response.json();
        let extractedTitle = data[0]?.generated_text?.trim() || 'Job Position';
        
        extractedTitle = extractedTitle
          .replace(/^(job title:|title:|position:|role:|here's|this is|the|a|an|for)/i, '')
          .replace(/["']/g, '')
          .replace(/[:.,!?]/g, '')
          .replace(/^\W+|\W+$/g, '')
          .trim();

        setJobTitle(extractedTitle || 'Job Position');
      } catch (error) {
        console.error('Error extracting job title:', error);
        setJobTitle('Job Position');
      }
    };

    extractJobTitle();
  }, [jobContent, navigate]);

  if (!cvContent) {
    navigate('/');
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
            cvContent={cvContent || ''}
            jobContent={jobContent}
            isEditing={isEditing}
            onEdit={() => setIsEditing(!isEditing)}
            onDownload={() => {
              const element = document.createElement("a");
              const file = new Blob([cvContent || ''], {type: 'text/plain'});
              element.href = URL.createObjectURL(file);
              element.download = "cover-letter.txt";
              document.body.appendChild(element);
              element.click();
              document.body.removeChild(element);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default JobProcessor;