import { useState, useEffect } from "react";
import { HfInference } from "@huggingface/inference";
import { Send, FileText, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type Context = {
  cv: string | null;
  job: string | null;
};

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState<Context>({ cv: null, job: null });
  const [hasContext, setHasContext] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContext = async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('cv_content, job_content')
        .eq('role', 'system')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        setHasContext(false);
        return;
      }

      setContext({
        cv: data.cv_content,
        job: data.job_content
      });
      setHasContext(true);
    };

    fetchContext();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const hf = new HfInference(import.meta.env.VITE_HUGGINGFACE_API_KEY);
      
      const systemPrompt = `You are a helpful AI assistant. Use the following context about the user's CV and job description to provide relevant advice:
      CV: ${context.cv}
      Job Description: ${context.job}`;

      const conversation = [
        { role: "system", content: systemPrompt },
        ...messages,
        userMessage,
      ]
        .map((msg) => `${msg.role}: ${msg.content}`)
        .join("\n");

      const response = await hf.textGeneration({
        model: "OpenAssistant/oasst-sft-6-llama-30b-xor",
        inputs: conversation,
        parameters: {
          max_new_tokens: 200,
          temperature: 0.7,
          top_p: 0.95,
          repetition_penalty: 1.15,
        },
      });

      const assistantMessage: Message = {
        role: "assistant",
        content: response.generated_text,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasContext) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a242f] to-[#222f3a] dark:from-white dark:to-gray-100">
        <Header />
        <main className="container max-w-4xl mx-auto p-4 pt-24">
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-bold text-white dark:text-gray-800">
              Please provide your CV and job description first
            </h2>
            <div className="flex justify-center gap-4">
              <Button
                onClick={() => navigate('/')}
                className="gap-2"
              >
                <FileText className="w-4 h-4" />
                Upload CV
              </Button>
              <Button
                onClick={() => navigate('/')}
                className="gap-2"
              >
                <LinkIcon className="w-4 h-4" />
                Add Job URL
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a242f] to-[#222f3a] dark:from-white dark:to-gray-100">
      <Header />
      <main className="container max-w-4xl mx-auto p-4 pt-24">
        <div className="space-y-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "p-4 rounded-lg",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground ml-auto max-w-[80%]"
                    : "bg-muted max-w-[80%]"
                )}
              >
                {message.content}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-2 rounded-lg bg-muted"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}