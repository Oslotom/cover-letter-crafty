import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { HfInference } from '@huggingface/inference';
import { Wand2 } from "lucide-react";
import { FiSend } from "react-icons/fi"; // Import send icon from react-icons


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
    <div className="space-y-4 mb-4 max-w-4xl mx-auto ">
    <div className=" relative flex items-center border border-gray-300 rounded-lg px-3 py-2 w-full">
    <Textarea
          placeholder="Update with AI"
          value={aiPrompt}
          onChange={(e) => onPromptChange(e.target.value)}
          className="min-h-[30px] flex-grow border-none focus:ring-0 focus:outline-none"
          
        />
        <Button
          size="lg"
          onClick={handleAIEdit}
          className="min-w-[50px] absolute right-3 p-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-full hover:opacity-90"
          >
           <Wand2 size={18} />
        </Button>
      </div>
    </div>
  );
};