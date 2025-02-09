
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { HfInference } from '@huggingface/inference';
import { Send } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface AIEditSectionProps {
  isEditing: boolean;
  aiPrompt: string;
  currentCoverLetter: string;
  onPromptChange: (prompt: string) => void;
  onCoverLetterChange: (letter: string) => void;
  onEditingChange: (editing: boolean) => void;
}

export const AIEditSection = ({
  isEditing,
  aiPrompt,
  currentCoverLetter,
  onPromptChange,
  onCoverLetterChange,
  onEditingChange
}: AIEditSectionProps) => {
  const isMobile = useIsMobile();

  const handleAIEdit = async () => {
    if (!aiPrompt.trim() || !currentCoverLetter) {
      console.error('Missing content');
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

      onCoverLetterChange(response.generated_text.trim());
      onEditingChange(false);
      onPromptChange('');
    } catch (error) {
      console.error('Error editing with AI:', error);
    }
  };

  if (!isEditing) return null;

  return (
    <div className={cn(
      "space-y-4 mb-4 max-w-2xl mx-auto",
      isMobile && "fixed bottom-0 left-0 right-0 p-4 bg-background border-t z-50"
    )}>
      <div className="flex gap-2">
        <Textarea
          placeholder="Describe how you want to edit the cover letter..."
          value={aiPrompt}
          onChange={(e) => onPromptChange(e.target.value)}
          className={cn(
            "min-h-0",
            isMobile && "h-10 py-2"
          )}
        />
        <Button
          size="sm"
          onClick={handleAIEdit}
          className={cn(
            "bg-gradient-to-r from-purple-500 to-pink-600 hover:opacity-90",
            isMobile && "px-3"
          )}
        >
          {isMobile ? <Send className="h-4 w-4" /> : "Update Cover Letter!"}
        </Button>
      </div>
    </div>
  );
};
