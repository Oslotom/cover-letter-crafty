import { useState } from 'react';
import { HfInference } from '@huggingface/inference';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, MessageSquare, Download } from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface CoverLetterGeneratorProps {
  cvContent: string;
  jobContent: string;
}

export const CoverLetterGenerator = ({ cvContent, jobContent }: CoverLetterGeneratorProps) => {
  const [coverLetter, setCoverLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const truncateText = (text: string) => {
    const maxChars = 4000; // This gives us roughly 1000 tokens per text
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
      
      // Truncate inputs to manage token count
      const truncatedCV = truncateText(cvContent);
      const truncatedJob = truncateText(jobContent);
      
      const prompt = `Create a concise and professional cover letter (max 250 words) based on the following CV and job description. Output ONLY the cover letter text.

CV Summary:
${truncatedCV}

Job Summary:
${truncatedJob}

. `;

      const response = await hf.textGeneration({
        model: 'mistralai/Mistral-7B-Instruct-v0.2',
        inputs: prompt,
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
    const regex = /(Dear\s[a-zA-Z\s.]*,\n[\s\S]*?(Sincerely|Best regards|Regards|Yours sincerely|Respectfully),\n[a-zA-Z\s]*)/i; // Improved regex, added more closings
    const match = text.match(regex);

    if (match) {
      return match[0].trim();
    }

    const startMarker = text.indexOf("Dear");
    const endMarker = text.lastIndexOf("Sincerely,") || text.lastIndexOf("Best regards,") || text.lastIndexOf("Regards,") || text.lastIndexOf("Yours sincerely,") || text.lastIndexOf("Respectfully,");

    if (startMarker !== -1 && endMarker !== -1) {
      return text.substring(startMarker, endMarker + 15).trim(); // +15 to include longer closings
    } else if (startMarker !== -1) {
        return text.substring(startMarker).trim();
    }

    return text.trim(); // Ultimate fallback: return the whole thing
  };

  const handleChatClick = () => {
    navigate('/chat', { 
      state: { 
        cvContent, 
        jobContent 
      } 
    });
  };

  const downloadCoverLetter = () => {
    const element = document.createElement('a');
    const file = new Blob([coverLetter], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = 'cover-letter.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
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
        <div className="space-y-4">
          <div className="flex gap-2 justify-end">
            <Button
              onClick={handleChatClick}
              className="flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Chat with AI
            </Button>
            <Button
              onClick={downloadCoverLetter}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>
          <Card className="p-4">
            <Textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="min-h-[650px] font-serif"
            />
          </Card>
        </div>
      )}
    </div>
  );
};
