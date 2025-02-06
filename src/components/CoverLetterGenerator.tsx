import { useState, useEffect } from 'react';
import { HfInference } from '@huggingface/inference';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Download, Edit2, Save } from "lucide-react";

interface CoverLetterGeneratorProps {
  cvContent: string;
  jobContent: string;
  isEditing?: boolean;
  onEdit?: () => void;
  onDownload?: () => void;
  autoGenerate?: boolean;
  currentCoverLetter?: string;
  onCoverLetterChange?: (text: string) => void;
}

export const CoverLetterGenerator = ({ 
  cvContent, 
  jobContent, 
  isEditing,
  onEdit,
  onDownload,
  autoGenerate = false,
  currentCoverLetter,
  onCoverLetterChange
}: CoverLetterGeneratorProps) => {
  const [coverLetter, setCoverLetter] = useState(currentCoverLetter || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const truncateText = (text: string, maxLength: number = 10000): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
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
      
      const finalPrompt = `Generate a professional cover letter based on the CV and job description below. The cover letter should highlight relevant experience and skills from the CV that match the job requirements. Keep it very short. Keep it concise and professional, under 150 words.

Resume Content:
${truncatedCV}

Job Description:
${truncatedJob}

Generate ONLY the cover letter body text, without any salutations, signatures, or formatting. Focus on making compelling connections between the candidate's experience and the job requirements.`;

      const response = await hf.textGeneration({
        model: 'mistralai/Mistral-7B-Instruct-v0.2',
        inputs: finalPrompt,
        parameters: {
          max_new_tokens: 300,
          temperature: 0.01,
          top_p: 0.9,
          repetition_penalty: 1.2,
          return_full_text: false
        },
      });

      let generatedText = response.generated_text.trim();
      generatedText = generatedText
        .replace(/^(Dear|To Whom|Hiring|RE:|Resume Content:|Job Description:).*/im, '')
        .replace(/Sincerely,?.*$/im, '')
        .replace(/Best regards,?.*$/im, '')
        .replace(/Yours.*$/im, '')
        .trim();

      setCoverLetter(generatedText);
      if (onCoverLetterChange) {
        onCoverLetterChange(generatedText);
      }

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

  useEffect(() => {
    if (autoGenerate && !coverLetter && !isGenerating) {
      generateCoverLetter();
    }
  }, [autoGenerate, cvContent, jobContent]);

  useEffect(() => {
    if (currentCoverLetter && currentCoverLetter !== coverLetter) {
      setCoverLetter(currentCoverLetter);
    }
  }, [currentCoverLetter]);

  return (
    <div className="space-y-4">
      {!coverLetter ? (
        <div className="flex items-center justify-center min-h-[60px]">
          {isGenerating && (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Generating cover letter...</span>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4 max-w-2xl mx-auto">
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="gap-2"
            >
              {isEditing ? (
                <>
                  <Save className="h-4 w-4" />
                  Save
                </>
              ) : (
                <>
                  <Edit2 className="h-4 w-4" />
                  Edit
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDownload}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
          <div className="flex items-center justify-center max-w-2xl mx-auto shadow-5xl rounded-lg min-h-[600px] h-auto">
            <Textarea
              value={coverLetter}
              onChange={(e) => {
                setCoverLetter(e.target.value);
                if (onCoverLetterChange) {
                  onCoverLetterChange(e.target.value);
                }
              }}
              className="min-h-[900px] font-serif p-6 text-base leading-relaxed rounded-lg"
              readOnly={!isEditing}
            />
          </div>
        </div>
      )}
    </div>
  );
};