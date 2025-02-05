import { useState } from 'react';
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
      
      const finalPrompt = `Generate a professional cover letter based on the following CV and job description. Return ONLY the cover letter text, with no additional text, labels, or formatting instructions. Keep it under 250 words.

Resume Content:
${cvContent}

Job Description:
${jobContent}`;

      const response = await hf.textGeneration({
        model: 'mistralai/Mistral-7B-Instruct-v0.2',
        inputs: finalPrompt,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          top_p: 0.9,
          repetition_penalty: 1.1,
          return_full_text: false
        },
      });

      let generatedText = response.generated_text.trim();
      
      // Clean up the response to ensure we only get the cover letter
      generatedText = generatedText
        .replace(/^(cover letter:|dear.*?:)/i, '') // Remove common prefixes
        .replace(/sincerely,?.*$/i, '') // Remove signature
        .trim();

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