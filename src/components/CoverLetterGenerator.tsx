import { useState, useEffect } from 'react';
import { HfInference } from '@huggingface/inference';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface CoverLetterGeneratorProps {
  cvContent: string;
  jobContent: string;
}

export const CoverLetterGenerator = ({ cvContent, jobContent }: CoverLetterGeneratorProps) => {
  const [coverLetter, setCoverLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const [promptTemplate, setPromptTemplate] = useState('');

  useEffect(() => {
    const savedPrompt = localStorage.getItem('coverLetterPrompt');
    if (savedPrompt) {
      setPromptTemplate(savedPrompt);
    }
  }, []);

  const truncateText = (text: string) => {
    const maxChars = 4000;
    return text.length > maxChars ? text.slice(0, maxChars) + '...' : text;
  };

  const generateCoverLetter = async () => {
    if (!cvContent || !jobContent) {
      toast({
        title: "Missing content",
        description: "Please provide both CV and job description",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const hf = new HfInference("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");
      
      const truncatedCV = truncateText(cvContent);
      const truncatedJob = truncateText(jobContent);
      
      const finalPrompt = `Create a professional and personalized cover letter based on the following resume and job description. The cover letter should highlight relevant experience and skills that match the job requirements. Format it properly with date, recipient details, and proper closing.

Resume Content:
${truncatedCV}

Job Description:
${truncatedJob}

Instructions:
1. Start with proper business letter formatting
2. Highlight relevant experience and skills from the resume that match the job requirements
3. Show enthusiasm for the role and company
4. Keep it concise (250-300 words)
5. End with a professional closing

Generate the cover letter now:`;

      const response = await hf.textGeneration({
        model: 'mistralai/Mistral-7B-Instruct-v0.2',
        inputs: finalPrompt,
        parameters: {
          max_new_tokens: 800,
          temperature: 0.7,
          top_p: 0.9,
          repetition_penalty: 1.1,
        },
      });

      const generatedText = response.generated_text.trim();
      setCoverLetter(generatedText);

      toast({
        title: "Success",
        description: "Cover letter generated successfully",
      });

    } catch (error) {
      console.error('Error generating cover letter:', error);
      toast({
        title: "Error",
        description: "Failed to generate cover letter",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={generateCoverLetter}
        disabled={isGenerating || !cvContent || !jobContent}
        className="w-full min-h-[60px]"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          "Generate Cover Letter"
        )}
      </Button>

      {coverLetter && (
        <Card className="p-4">
          <Textarea
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            className="min-h-[650px] font-serif"
          />
        </Card>
      )}
    </div>
  );
};