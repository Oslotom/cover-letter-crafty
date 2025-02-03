import { useEffect, useRef } from "react";
import { ChatMessage } from "./ChatMessage";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

export const ChatMessages = ({ messages, isLoading }: ChatMessagesProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto space-y-4 mb-4">
      {messages.map((message, index) => (
        <ChatMessage key={index} role={message.role} content={message.content} />
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
      <div ref={messagesEndRef} />
    </div>
  );
};