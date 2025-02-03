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
      
      const finalPrompt = (promptTemplate || `Create a concise and professional cover letter (max 250 words) based on the following CV and job description. Output ONLY the cover letter text.

CV Summary:
{cv}

Job Summary:
{job}

.`)
        .replace('{cv}', truncatedCV)
        .replace('{job}', truncatedJob);

      const response = await hf.textGeneration({
        model: 'mistralai/Mistral-7B-Instruct-v0.2',
        inputs: finalPrompt,
        parameters: {
          max_new_tokens: 400,
          temperature: 0.7,
          top_p: 0.9,
          repetition_penalty: 1.1,
        },
      });

      const generatedText = response.generated_text.trim();
      const extractedLetter = extractCoverLetter(generatedText);
      setCoverLetter(extractedLetter);

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

  const extractCoverLetter = (text: string) => {
    // More robust extraction using regex (still needs refinement based on LLM output patterns)

    // Example Regex (ADAPT THIS TO YOUR LLM OUTPUT):
    const regex = /(Dear\s[a-zA-Z\s.]*,\n[\s\S]*?(Sincerely|Best regards|Regards|Yours sincerely|Respectfully),\n[a-zA-Z\s]*)/i; // Improved regex, added more closings
    const match = text.match(regex);

    if (match) {
      return match[0].trim();
    }

    // Fallback: If no clear match, try to find "Dear" and common closings (less reliable)
    const startMarker = text.indexOf("Dear");
    const endMarker = text.lastIndexOf("Sincerely,") || text.lastIndexOf("Best regards,") || text.lastIndexOf("Regards,") || text.lastIndexOf("Yours sincerely,") || text.lastIndexOf("Respectfully,");

    if (startMarker !== -1 && endMarker !== -1) {
      return text.substring(startMarker, endMarker + 15).trim(); // +15 to include longer closings
    } else if (startMarker !== -1) {
        return text.substring(startMarker).trim();
    }

    return text.trim(); // Ultimate fallback: return the whole thing
  };


  return (
    <div className="space-y-4">
      <Button
        onClick={generateCoverLetter}
        disabled={isGenerating || !cvContent || !jobContent}
        className="w-full min-h-[60px] "
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