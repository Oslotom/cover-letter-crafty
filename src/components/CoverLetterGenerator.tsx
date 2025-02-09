
import { useState, useEffect, useRef } from 'react';
import { HfInference } from '@huggingface/inference';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Download, Edit2, Save, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const [isExpanded, setIsExpanded] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();
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
      
      const finalPrompt = `Generate a professional cover letter based on the CV and job description below. The cover letter should highlight relevant experience and skills from the CV that match the job requirements. Keep it very short. Keep it concise and professional, max 280 words.

Resume Content:
${truncatedCV}

Job Description:
${truncatedJob}

Generate ONLY the cover letter body text, without any salutations, signatures, or formatting. Focus on making compelling connections between the candidate's experience and the job requirements.`;

      const response = await hf.textGeneration({
        model: 'mistralai/Mistral-7B-Instruct-v0.3',
        inputs: finalPrompt,
        parameters: {
          max_new_tokens: 350,
          temperature: 0.001,
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

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = textAreaRef.current.scrollHeight + 'px';
    }
  }, [coverLetter, isEditing]);

  const wordCount = coverLetter.trim().split(/\s+/).length;
  const shouldTruncate = !isExpanded && wordCount > 100;
  const displayedText = shouldTruncate 
    ? coverLetter.split(/\s+/).slice(0, 100).join(' ') + '...'
    : coverLetter;

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
                <Save className="h-4 w-4" />
              ) : (
                <Edit2 className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDownload}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
          <div 
            className={cn(
              "relative flex items-center justify-center max-w-2xl mx-auto rounded-lg",
              shouldTruncate && "cursor-pointer"
            )}
            onClick={() => shouldTruncate && setIsExpanded(true)}
          >
            <Textarea
              ref={textAreaRef}
              value={displayedText}
              onChange={(e) => {
                setCoverLetter(e.target.value);
                if (onCoverLetterChange) {
                  onCoverLetterChange(e.target.value);
                }
              }}
              className={cn(
                "min-h-0 h-auto shadow-xl font-serif p-6 text-sm leading-relaxed rounded-5 resize-none",
                shouldTruncate && "after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-20 after:bg-gradient-to-t after:from-background after:to-transparent after:pointer-events-none"
              )}
              readOnly={!isEditing}
              style={{ height: 'auto' }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
