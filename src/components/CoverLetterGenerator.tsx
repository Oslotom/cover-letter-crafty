import { useState } from 'react';
import { HfInference } from '@huggingface/inference';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Download, Edit2, Save, Check } from "lucide-react";

interface CoverLetterGeneratorProps {
  cvContent: string;
  jobContent: string;
  isEditing?: boolean;
  onEdit?: () => void;
  onDownload?: () => void;
}

export const CoverLetterGenerator = ({ 
  cvContent, 
  jobContent, 
  isEditing,
  onEdit,
  onDownload 
}: CoverLetterGeneratorProps) => {
  const [coverLetter, setCoverLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
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
      
      const finalPrompt = `Generate a professional cover letter based on the CV and job description below. The cover letter should highlight relevant experience and skills from the CV that match the job requirements. Keep it concise and professional, under 300 words.

Resume Content:
${cvContent}

Job Description:
${jobContent}

Generate ONLY the cover letter body text, without any salutations, signatures, or formatting. Focus on making compelling connections between the candidate's experience and the job requirements.`;

      const response = await hf.textGeneration({
        model: 'mistralai/Mistral-7B-Instruct-v0.2',
        inputs: finalPrompt,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
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
      setIsSuccess(true);

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
      {!coverLetter ? (
        <Button
          onClick={generateCoverLetter}
          disabled={isGenerating || !cvContent || !jobContent}
          className="w-full min-h-[60px]"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : isSuccess ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Created Successfully
            </>
          ) : (
            "Create Cover Letter"
          )}
        </Button>
      ) : (
        <div className="space-y-4">
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
          <Textarea
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            className="min-h-[1000px] font-serif p-4 text-sm"
            readOnly={!isEditing}
          />
        </div>
      )}
    </div>
  );
};