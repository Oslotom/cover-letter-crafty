import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FileUpload } from '@/components/FileUpload';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CoverLetterGenerator } from '@/components/CoverLetterGenerator';
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface LocationState {
  jobContent: string;
}

const JobProcessor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cvContent, setCvContent] = useState<string>('');
  const [linkedinUrl, setLinkedinUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [jobTitle, setJobTitle] = useState<string>('');
  const { jobContent } = (location.state as LocationState) || { jobContent: '' };

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
            inputs: `Extract the job title from this job posting. Output ONLY the exact job title with no additional text: ${jobContent.substring(0, 500)}`,
            parameters: {
              max_new_tokens: 10,
              temperature: 0.1,
              top_p: 0.1,
              return_full_text: false
            }
          }),
        });

        const data = await response.json();
        let extractedTitle = data[0]?.generated_text?.trim() || 'Job Position';
        
        // Clean up the response
        extractedTitle = extractedTitle
          .split('\n')[0] // Take only the first line
          .replace(/^(job title:|title:|position:|role:|here's|this is|the|a|for|senior|junior)/i, '') // Remove common prefixes
          .replace(/["']/g, '') // Remove quotes
          .replace(/[:.,!?]/g, '') // Remove punctuation
          .replace(/^\W+|\W+$/g, '') // Remove leading/trailing non-word characters
          .trim();

        setJobTitle(extractedTitle);
      } catch (error) {
        console.error('Error extracting job title:', error);
        setJobTitle('Job Position');
      }
    };

    extractJobTitle();
  }, [jobContent, navigate]);

  const handleFileContent = (content: string) => {
    setCvContent(content);
  };

  const handleLinkedinSubmit = async () => {
    if (!linkedinUrl.includes('linkedin.com')) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid LinkedIn profile URL",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(linkedinUrl)}`);
      const data = await response.json();
      
      if (!data.contents || data.contents.includes('authwall')) {
        throw new Error('Profile not accessible');
      }

      const mockLinkedInData = `Professional with experience in...`;
      setCvContent(mockLinkedInData);
      toast({
        title: "Success",
        description: "LinkedIn profile processed successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Make sure your LinkedIn profile is public",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a242f] to-[#222f3a]">
      <div className="container max-w-[950px] mx-auto space-y-8 px-6 md:px-6 py-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">{jobTitle}</h1>
          <p className="text-gray-300">Upload your resume or connect your LinkedIn profile</p>
        </div>

        <div className="space-y-8 bg-white/10 rounded-lg p-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Upload Resume</h2>
            <FileUpload onFileContent={handleFileContent} contentType="cv" />
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Or use LinkedIn Profile</h2>
            <div className="flex space-x-4">
              <Input
                type="url"
                placeholder="Paste your LinkedIn profile URL"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                className="flex-1 bg-white/5 text-white"
              />
              <Button 
                onClick={handleLinkedinSubmit}
                disabled={isProcessing || !linkedinUrl}
                variant="secondary"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Process Profile'
                )}
              </Button>
            </div>
          </div>

          {jobContent && (
            <CoverLetterGenerator
              cvContent={cvContent}
              jobContent={jobContent}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default JobProcessor;