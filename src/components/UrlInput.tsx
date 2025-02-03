import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UrlInputProps {
  onUrlContent: (content: string) => void;
}

export function UrlInput({ onUrlContent }: UrlInputProps) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [jobContent, setJobContent] = useState("");
  const [cvContent, setCvContent] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchJobDescription = async (url: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch job description');
      }
      const text = await response.text();
      return text;
    } catch (error) {
      console.error('Error fetching job description:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setIsLoading(true);
    try {
      const content = await fetchJobDescription(url);
      setJobContent(content);
      onUrlContent(content);
      toast({
        title: "Success",
        description: "Job description fetched successfully",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch job description",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToChat = async () => {
    try {
      // Store new context in chat_messages without user_id
      const { error } = await supabase
        .from('chat_messages')
        .insert([
          {
            cv_content: cvContent,
            job_content: jobContent,
            message: "Context initialized",
            role: "system"
          }
        ]);

      if (error) {
        console.error('Error storing context:', error);
        toast({
          title: "Error",
          description: "Failed to store context",
          variant: "destructive",
        });
        return;
      }

      navigate('/ai-chat');
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to navigate to chat",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-2">
        <Input
          type="url"
          placeholder="Paste job posting URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Loading..." : "Fetch"}
        </Button>
      </div>
    </form>
  );
}