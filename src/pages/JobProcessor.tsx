import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CoverLetterGenerator } from '@/components/CoverLetterGenerator';
import { useToast } from "@/hooks/use-toast";
import { Header } from '@/components/Header';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { HfInference } from '@huggingface/inference';
import { Wand2 } from "lucide-react";

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
  const [isEditingWithAI, setIsEditingWithAI] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const { jobContent, sourceUrl, cvContent, shouldGenerateOnMount } = (location.state as LocationState) || {};
  const [currentCoverLetter, setCurrentCoverLetter] = useState('');

  useEffect(() => {
    if (!jobContent || !cvContent) {
      navigate('/');
      return;
    }

    const extractJobTitle = async () => {
      try {
        const hf = new HfInference("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");
        const prompt = `Extract ONLY the job title or role from this job posting. Return ONLY the exact job title, no other text. Here's the content: ${jobContent.substring(0, 500)}`;
        
        const response = await hf.textGeneration({
          model: 'mistralai/Mistral-7B-Instruct-v0.2',
          inputs: prompt,
          parameters: {
            max_new_tokens: 50,
            temperature: 0.1,
            return_full_text: false
          }
        });

        const extractedTitle = response.generated_text.trim();
        setJobTitle(extractedTitle || 'Job Position');
      } catch (error) {
        console.error('Error extracting job title:', error);
        setJobTitle('Job Position');
      }
    };

    extractJobTitle();
  }, [jobContent, navigate, cvContent]);

  const handleAIEdit = async () => {
    if (!aiPrompt.trim() || !currentCoverLetter) {
      toast({
        title: "Missing content",
        description: "Please provide both edit instructions and ensure there's a cover letter to edit",
        variant: "destructive",
      });
      return;
    }

    try {
      const hf = new HfInference("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");
      const prompt = `Edit this cover letter according to these instructions: "${aiPrompt}"

Current cover letter:
${currentCoverLetter}

Provide ONLY the edited cover letter text, without any additional text or formatting. Keep the professional tone and maintain relevance to the job requirements.`;

      const response = await hf.textGeneration({
        model: 'mistralai/Mistral-7B-Instruct-v0.2',
        inputs: prompt,
        parameters: {
          max_new_tokens: 800,
          temperature: 0.7,
          return_full_text: false
        }
      });

      setCurrentCoverLetter(response.generated_text.trim());
      setIsEditingWithAI(false);
      setAiPrompt('');

      toast({
        title: "Success",
        description: "Cover letter updated successfully",
      });
    } catch (error) {
      console.error('Error editing with AI:', error);
      toast({
        title: "Error",
        description: "Failed to edit cover letter with AI",
        variant: "destructive",
      });
    }
  };

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
              <a href={sourceUrl} target="_blank" rel="noopener noreferrer" 
                className="hover:text-foreground transition-colors">
                {sourceUrl}
              </a>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditingWithAI(true)}
              className="gap-2"
            >
              <Wand2 className="w-4 h-4" />
              Edit with AI
            </Button>
          </div>

          {isEditingWithAI && (
            <div className="space-y-4 mb-4">
              <Textarea
                placeholder="Describe how you want to edit the cover letter..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingWithAI(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleAIEdit}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 hover:opacity-90"
                >
                  Update Cover Letter
                </Button>
              </div>
            </div>
          )}

          <CoverLetterGenerator
            cvContent={cvContent}
            jobContent={jobContent}
            isEditing={isEditing}
            onEdit={() => setIsEditing(!isEditing)}
            onCoverLetterChange={setCurrentCoverLetter}
            currentCoverLetter={currentCoverLetter}
            onDownload={() => {
              const element = document.createElement("a");
              const file = new Blob([currentCoverLetter], {type: 'text/plain'});
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