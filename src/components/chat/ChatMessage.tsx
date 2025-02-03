import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

export const ChatMessage = ({ role, content }: ChatMessageProps) => {
  return (
    <div
      className={cn(
        "flex w-full",
        role === "assistant" ? "justify-start" : "justify-end"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] p-4 rounded-lg",
          role === "assistant"
            ? "bg-accent/50 text-white"
            : "bg-primary text-primary-foreground"
        )}
      >
        {content}
      </div>
    </div>
  );
};