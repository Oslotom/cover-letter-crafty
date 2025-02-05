import { useState } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const Prompt = () => {
  const [prompt, setPrompt] = useState<string>(`Create a concise and professional cover letter (max 250 words) based on the following CV and job description. Output ONLY the cover letter text.

CV Summary:
{cv}

Job Summary:
{job}

.`);
  const { toast } = useToast();

  const handleUpdate = () => {
    localStorage.setItem('coverLetterPrompt', prompt);
    toast({
      title: "Success",
      description: "Prompt updated successfully",
    });
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-2xl mx-auto space-y-16 pt-16 p-8">
        <div className="text-center space-y-6">
          <h1 className="text-6xl font-bold">
            <span className="span-gradient-text">Cover Letter Prompt</span>
          </h1>
          <p className="container max-w-2xl mx-auto text-muted-foreground max-w-lg">
            Customize the prompt used to generate cover letters
          </p>
        </div>
        <div className="space-y-4">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[300px] font-mono text-sm"
            placeholder="Enter your prompt template..."
          />
          <Button 
            onClick={handleUpdate}
            className="w-full"
          >
            Update Prompt
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Prompt;