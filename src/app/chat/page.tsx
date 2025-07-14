
"use client";

import { ChatHeader } from "@/components/chat-header";
import { Bot } from "lucide-react";

export default function ChatPage() {
  return (
    <div className="flex flex-col h-full">
      <ChatHeader title="Nexus.AI" />
      <div className="flex flex-col items-center justify-center h-full text-center p-4 animate-fade-in">
        <Bot size={64} className="text-primary mb-4 animate-float" />
        <h2 className="animated-gradient-text text-3xl md:text-4xl font-bold">
          Welcome to Nexus.AI
        </h2>
        <p className="text-muted-foreground mt-2 max-w-md">
          Select a chatroom from the sidebar or create a new one to get
          started on your next conversation.
        </p>
      </div>
    </div>
  );
}
