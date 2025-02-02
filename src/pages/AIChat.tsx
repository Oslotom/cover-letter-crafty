import { useState, useEffect } from "react";
import { HfInference } from "@huggingface/inference";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface Context {
  cv: string | null;
  job: string | null;
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState<Context>({ cv: null, job: null });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        toast({
          title: "Authentication required",
          description: "Please login to use the chat feature",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      // Fetch context only if user is authenticated
      const { data, error: contextError } = await supabase
        .from('chat_messages')
        .select('cv_content, job_content')
        .eq('user_id', user.id)
        .eq('role', 'system')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (contextError || !data) {
        toast({
          title: "Context not found",
          description: "Please upload your CV and job description first",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      setContext({
        cv: data.cv_content,
        job: data.job_content
      });
    };

    checkAuth();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const hf = new HfInference("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");
      
      const prompt = `Given the following context:

Resume:
${context.cv}

Job Description:
${context.job}

Please help answer this question about the job application:
${input}

Provide a clear and concise response based on both the resume and job description context.`;

      const response = await hf.textGeneration({
        model: "mistralai/Mistral-7B-Instruct-v0.3",
        inputs: prompt,
        parameters: {
          max_new_tokens: 250,
          temperature: 0.7,
          top_p: 0.9,
          repetition_penalty: 1.1,
        },
      });

      const assistantMessage: Message = {
        role: "assistant",
        content: response.generated_text.trim(),
      };
      
      // Store the conversation in Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('chat_messages').insert([
          {
            user_id: user.id,
            message: input,
            role: "user"
          },
          {
            user_id: user.id,
            message: assistantMessage.content,
            role: "assistant"
          }
        ]);
      }

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to get AI response",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a242f] to-[#222f3a] dark:from-white dark:to-gray-100">
      <Header />
      <main className="container max-w-4xl mx-auto p-4 pt-24">
        <div className="space-y-4 mb-4 h-[calc(100vh-16rem)] overflow-y-auto">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex gap-3 p-4 rounded-lg max-w-3xl mx-auto",
                message.role === "assistant"
                  ? "bg-gray-800/50 dark:bg-white/50"
                  : "bg-blue-600/50 dark:bg-blue-100/50"
              )}
            >
              <div className="flex-1 space-y-2">
                <div className="font-medium text-white dark:text-gray-800">
                  {message.role === "assistant" ? "AI Assistant" : "You"}
                </div>
                <div className="text-sm text-gray-100 dark:text-gray-700">
                  {message.content}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 p-4 rounded-lg bg-gray-800/50 dark:bg-white/50 max-w-3xl mx-auto">
              <div className="flex-1 space-y-2">
                <div className="font-medium text-white dark:text-gray-800">AI Assistant</div>
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-white dark:bg-gray-800 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-white dark:bg-gray-800 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-white dark:bg-gray-800 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="sticky bottom-4 max-w-3xl mx-auto">
          <div className="flex gap-2 items-center bg-gray-800/50 dark:bg-white/50 backdrop-blur-sm border border-gray-700/50 dark:border-gray-300/50 rounded-lg p-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-transparent border-0 focus:outline-none focus:ring-0 text-white dark:text-gray-800 placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
            <Button 
              type="submit" 
              size="icon"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-100 dark:hover:bg-blue-200"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}