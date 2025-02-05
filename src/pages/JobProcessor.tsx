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
  const [jobTitle, setJobTitle] = useState<string>('Loading job title...');
  const { jobContent } = (location.state as LocationState) || { jobContent: '' };

  useEffect(() => {
    if (!jobContent) {
      navigate('/');
      return;
    }

    // Extract job title from content using HuggingFace
    const extractJobTitle = async () => {
      try {
        const response = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer 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',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: `Extract only the job title from this job description. Return only the job title, nothing else: ${jobContent}`,
          }),
        });

        const data = await response.json();
        const extractedTitle = data[0]?.generated_text?.trim() || 'Job Position';
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
      // Mock LinkedIn data processing for now
      await new Promise(resolve => setTimeout(resolve, 2000));
      const mockLinkedInData = `Professional with experience in...`;
      setCvContent(mockLinkedInData);
      toast({
        title: "Success",
        description: "LinkedIn profile processed successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process LinkedIn profile",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a242f] to-[#222f3a] py-8">
      <div className="container max-w-2xl mx-auto space-y-8 p-8">
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