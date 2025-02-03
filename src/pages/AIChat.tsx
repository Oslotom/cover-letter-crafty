import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { FileUpload } from "@/components/FileUpload";
import { UrlInput } from "@/components/UrlInput";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { ChatInput } from "@/components/chat/ChatInput";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cvContent, setCvContent] = useState("");
  const [jobContent, setJobContent] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSendMessage = async (content: string) => {
    if (!cvContent || !jobContent) {
      toast({
        title: "Missing context",
        description: "Please provide both resume and job description",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = { role: "user", content };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Store the message in Supabase
      await supabase.from("chat_messages").insert({
        user_id: user.id,
        cv_content: cvContent,
        job_content: jobContent,
        message: content,
        role: "user",
      });

      // Call the AI function to get a response
      const response = await supabase.functions.invoke("chat-ai", {
        body: {
          messages,
          newMessage: content,
          cvContent,
          jobContent,
        },
      });

      if (response.error) throw response.error;

      const assistantMessage: Message = {
        role: "assistant",
        content: response.data.message,
      };

      // Store the AI response in Supabase
      await supabase.from("chat_messages").insert({
        user_id: user.id,
        cv_content: cvContent,
        job_content: jobContent,
        message: response.data.message,
        role: "assistant",
      });

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to generate response",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load previous messages on component mount
  useEffect(() => {
    const loadMessages = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: messages } = await supabase
        .from("chat_messages")
        .select("*")
        .order("created_at", { ascending: true });

      if (messages && messages.length > 0) {
        setMessages(
          messages.map((msg) => ({
            role: msg.role as "user" | "assistant",
            content: msg.message,
          }))
        );
        // Set the context from the latest message
        const lastMessage = messages[messages.length - 1];
        if (lastMessage.cv_content) setCvContent(lastMessage.cv_content);
        if (lastMessage.job_content) setJobContent(lastMessage.job_content);
      }
    };

    loadMessages();
  }, []);

  return (
    <div className="min-h-screen py-8 bg-gradient-to-b from-[#1a242f] to-[#222f3a]">
      <div className="container max-w-2xl mx-auto space-y-8 pt-16 p-8">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-accent rounded-lg text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-4xl font-bold text-center">
            <span className="span-gradient-text">AI Recruitment Assistant</span>
          </h1>
          <div className="w-5" />
        </div>

        {!cvContent && !jobContent && (
          <div className="space-y-4 mb-8">
            <FileUpload onFileContent={setCvContent} />
            <UrlInput onUrlContent={setJobContent} />
          </div>
        )}

        <div className="bg-white/10 rounded-lg p-6 min-h-[500px] flex flex-col">
          <ChatMessages messages={messages} isLoading={isLoading} />
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}