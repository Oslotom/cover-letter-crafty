import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FileUpload } from '@/components/FileUpload';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CoverLetterGenerator } from '@/components/CoverLetterGenerator';
import { useToast } from "@/components/ui/use-toast";

interface LocationState {
  jobContent: string;
  jobTitle?: string;
}

const JobProcessor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cvContent, setCvContent] = useState<string>('');
  const [linkedinUrl, setLinkedinUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [jobTitle, setJobTitle] = useState<string>('');
  const { jobContent } = location.state as LocationState || {};

  useEffect(() => {
    if (!jobContent) {
      navigate('/');
      return;
    }
    // Extract job title from content (basic example)
    const titleMatch = jobContent.match(/(?:job title|position):\s*([^\n]+)/i);
    setJobTitle(titleMatch?.[1] || 'Job Position');
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
      // Here you would implement the LinkedIn profile scraping
      // For now, we'll just simulate it
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
                {isProcessing ? 'Processing...' : 'Process Profile'}
              </Button>
            </div>
          </div>

          {(cvContent || jobContent) && (
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