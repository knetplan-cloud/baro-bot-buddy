import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

export const ChatMessage = ({ role, content, timestamp, isTyping }: ChatMessageProps) => {
  const isUser = role === "user";

  return (
    <div className={cn("flex gap-3 mb-4", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0",
          isUser
            ? "bg-muted"
            : "bg-gradient-to-br from-primary to-primary-dark shadow-md"
        )}
      >
        {isUser ? "👤" : "🤖"}
      </div>
      
      <div className={cn("flex flex-col max-w-[75%]", isUser && "items-end")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 transition-all duration-300",
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : "bg-card border border-border rounded-tl-sm shadow-sm"
          )}
        >
          {isTyping ? (
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
          )}
        </div>
        <span className="text-xs text-muted-foreground mt-1 px-1">
          {timestamp.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
};
