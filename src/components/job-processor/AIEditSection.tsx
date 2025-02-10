
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { HfInference } from '@huggingface/inference';
import { Wand2 } from "lucide-react";

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

  const handleAIEdit = async () => {
    if (!aiPrompt.trim() || !currentCoverLetter) {
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

  return (
    <div className="fixed bottom-0 left-0 right-0  p-4 z-50">
      <div className="max-w-4xl mx-auto">
        <div className="relative bg-background shadow-xl flex items-center border border-gray-300 rounded-lg px-3 py-2">
          <Textarea
            placeholder="Update with AI"
            value={aiPrompt}
            onChange={(e) => onPromptChange(e.target.value)}
            className="min-h-[40px] max-h-[60px] text-lg flex-grow border-none focus:ring-0 focus:outline-none resize-none"
          />
          <Button
            size="sm"
            onClick={handleAIEdit}
            className="min-h-[60px] min-w-[60px] shadow-xl absolute right-3 p-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-full hover:opacity-90"
          >
            <Wand2 size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};
