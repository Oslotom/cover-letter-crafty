import { useState } from "react";
import { HfInference } from "@huggingface/inference";
import { Send, ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { cvContent, jobContent } = location.state || {};

  // Initialize chat with context if available
  useState(() => {
    if (cvContent && jobContent) {
      const systemMessage: Message = {
        role: "assistant",
        content: "Hello! I'm your AI recruitment assistant. I have reviewed your resume and the job description. I can help you prepare for your application and interview. What would you like to know?",
      };
      setMessages([systemMessage]);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const hf = new HfInference("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");
      
      // Include full conversation history and context in the prompt
      const conversationHistory = messages
        .map((msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
        .join("\n");

      const systemContext = `You are a senior recruitment professional. Keep your responses concise (3-4 sentences) and always end with 2-3 relevant follow-up questions.

Resume:
${cvContent || "No resume provided"}

Job Description:
${jobContent || "No job description provided"}

Previous conversation:
${conversationHistory}

Based on this context, provide professional advice tailored to their situation.

User: ${input}
Assistant:`;

      const response = await hf.textGeneration({
        model: "mistralai/Mistral-7B-Instruct-v0.2",
        inputs: systemContext,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          top_p: 0.9,
          repetition_penalty: 1.1,
        },
      });

      const assistantMessage: Message = {
        role: "assistant",
        content: response.generated_text.trim(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

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

        <div className="bg-white/10 rounded-lg p-6 min-h-[500px] flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "assistant" ? "justify-start" : "justify-end"
                }`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-lg ${
                    message.role === "assistant"
                      ? "bg-accent/50 text-white"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] p-4 rounded-lg bg-accent/50 text-white">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="mt-4">
            <div className="flex space-x-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 p-4 rounded-lg bg-white/5 text-white placeholder-white/50 border border-white/20"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}