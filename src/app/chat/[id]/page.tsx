
"use client";

import { chat } from "@/ai/flows/chat";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import type { Message, Chatroom } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Send, Image as ImageIcon, Copy, Check, X } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { ChatHeader } from "@/components/chat-header";

const MESSAGES_PER_PAGE = 20;

export default function ChatroomPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [chatroom, setChatroom] = useState<Chatroom | null>(null);
  const [displayedMessages, setDisplayedMessages] = useState<Message[]>([]);
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);


  const viewportRef = useRef<HTMLDivElement>(null);
  const chatroomId = params.id as string;
  const imageInputRef = useRef<HTMLInputElement>(null);

  const loadMessages = useCallback((pageToLoad: number, allMsgs: Message[]) => {
    const totalMessages = allMsgs.length;
    const startIndex = Math.max(0, totalMessages - (pageToLoad * MESSAGES_PER_PAGE));
    const newMessages = allMsgs.slice(startIndex);
    
    setDisplayedMessages(newMessages);
    setHasMoreMessages(startIndex > 0);
  }, []);

  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated");
    if (authStatus !== "true") {
      router.push("/");
      return;
    }
    setIsAuthenticated(true);

    const storedChatrooms = localStorage.getItem("chatrooms");
    if (storedChatrooms) {
      const chatrooms: Chatroom[] = JSON.parse(storedChatrooms);
      const currentChatroom = chatrooms.find((c) => c.id === chatroomId);
      if (currentChatroom) {
        setChatroom(currentChatroom);
        setAllMessages(currentChatroom.messages);
        loadMessages(1, currentChatroom.messages);
      } else {
        toast({
          title: "Error",
          description: "Chatroom not found.",
          variant: "destructive",
        });
        router.push("/chat");
      }
    }
    setIsLoading(false);
  }, [router, chatroomId, toast, loadMessages]);

  useEffect(() => {
    if (page === 1 && viewportRef.current) {
        viewportRef.current.scrollTo({
            top: viewportRef.current.scrollHeight,
            behavior: "smooth"
        });
    }
  }, [displayedMessages, page]);

  const updateChatroomInStorage = (updatedMessages: Message[], currentChatroomId: string) => {
    const storedChatrooms = localStorage.getItem("chatrooms");
    if (storedChatrooms) {
        let chatrooms: Chatroom[] = JSON.parse(storedChatrooms);
        chatrooms = chatrooms.map(c => 
            c.id === currentChatroomId ? { ...c, messages: updatedMessages } : c
        );
        localStorage.setItem("chatrooms", JSON.stringify(chatrooms));
        window.dispatchEvent(new Event('storage'));
    }
  };

  const handleSendMessage = async () => {
    if ((newMessage.trim() === "" && !imagePreview) || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: newMessage,
      imageUrl: imagePreview ?? undefined,
      sender: 'user',
      username: 'You',
      timestamp: Date.now(),
    };
    
    const updatedMessages = [...allMessages, userMessage];
    setAllMessages(updatedMessages);
    loadMessages(page, updatedMessages);
    updateChatroomInStorage(updatedMessages, chatroomId);
    
    const messageToSend = newMessage;
    const imageToSend = imagePreview;

    setNewMessage("");
    setImagePreview(null);
    if(imageInputRef.current) {
        imageInputRef.current.value = "";
    }

    setIsTyping(true);
    
    setTimeout(async () => {
      try {
        const response = await chat({ message: messageToSend, imageUrl: imageToSend ?? undefined });
        const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: response.message,
            sender: 'ai',
            username: 'Nexus.AI',
            timestamp: Date.now(),
        };
        const finalMessages = [...updatedMessages, aiMessage];
        setAllMessages(finalMessages);
        loadMessages(page, finalMessages);
        updateChatroomInStorage(finalMessages, chatroomId);
      } catch (error) {
          console.error("Error fetching AI response:", error);
          toast({
              title: "Error",
              description: "Failed to get a response from the AI. Please try again.",
              variant: "destructive",
          });
          const revertedMessages = allMessages.filter(m => m.id !== userMessage.id);
          setAllMessages(revertedMessages); 
          loadMessages(page, revertedMessages);
          updateChatroomInStorage(revertedMessages, chatroomId);
      } finally {
          setIsTyping(false);
      }
    }, 1500 + Math.random() * 1000);
  };
  
  const handleScroll = () => {
      if (viewportRef.current?.scrollTop === 0 && hasMoreMessages && !isLoading) {
          setIsLoading(true);
          setTimeout(() => {
              const nextPage = page + 1;
              const totalMessages = allMessages.length;
              const startIndex = Math.max(0, totalMessages - (nextPage * MESSAGES_PER_PAGE));
              const newMessagesToShow = allMessages.slice(startIndex);
              
              setDisplayedMessages(newMessagesToShow);
              setPage(nextPage);
              setHasMoreMessages(startIndex > 0);
              
              if (viewportRef.current) {
                const oldScrollHeight = viewportRef.current.scrollHeight;
                // Defer scroll adjustment until after new messages have rendered
                setTimeout(() => {
                    if(viewportRef.current) {
                        viewportRef.current.scrollTop = viewportRef.current.scrollHeight - oldScrollHeight;
                    }
                }, 0);
              }
              setIsLoading(false);
          }, 1000);
      }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
        setCopiedMessageId(id);
        toast({ title: "Copied to clipboard!" });
        setTimeout(() => setCopiedMessageId(null), 2000);
    }, (err) => {
        toast({ title: "Failed to copy", description: err.message, variant: "destructive" });
    });
  };
  
  if (!isAuthenticated || isLoading && displayedMessages.length === 0) {
    return (
        <div className="flex h-full flex-col">
            <header className="flex h-16 items-center border-b bg-background px-4 md:px-6">
                <Skeleton className="h-6 w-48" />
            </header>
            <main className="flex-1 overflow-hidden p-4 md:p-6 space-y-6">
                <Skeleton className="h-16 w-3/4" />
                <Skeleton className="h-16 w-3/4 self-end" />
                <Skeleton className="h-16 w-3/4" />
            </main>
            <footer className="border-t bg-background p-4">
                <Skeleton className="h-10 w-full" />
            </footer>
        </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
       <ChatHeader title={chatroom?.title || "Chat"} />
      <main className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" viewportRef={viewportRef} onScroll={handleScroll}>
          <div className="p-4 md:p-6 space-y-1">
            {isLoading && page > 1 && (
                 <div className="flex justify-center py-4"><Skeleton className="h-6 w-24" /></div>
            )}
            {!hasMoreMessages && (
                <div className="text-center text-xs text-muted-foreground py-4 animate-fade-in">
                    <p>This is the beginning of your conversation.</p>
                </div>
            )}
            {displayedMessages.length === 0 && !isTyping && (
                <div className="text-center text-muted-foreground mt-8 animate-fade-in">
                    <p>No messages yet. Start the conversation!</p>
                </div>
            )}
            <TooltipProvider delayDuration={100}>
              {displayedMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "group flex items-start gap-3 w-full py-3 animate-fade-in-up",
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {msg.sender === 'ai' && (
                      <Avatar className="h-8 w-8 border neumorphic-avatar">
                         <AvatarFallback>N</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        "relative max-w-[80%] md:max-w-md lg:max-w-lg rounded-xl px-4 py-2 text-sm",
                        msg.sender === 'user'
                          ? "neumorphic-out bg-primary text-primary-foreground"
                          : "neumorphic-out-muted"
                      )}
                    >
                       <p className="font-semibold mb-1">{msg.username}</p>
                       {msg.imageUrl && (
                         <Image
                           src={msg.imageUrl}
                           alt="Uploaded image"
                           width={250}
                           height={250}
                           className="rounded-lg my-2 aspect-auto"
                         />
                       )}
                       {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
                       <p className="text-xs opacity-70 mt-2 text-right">
                          {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                       </p>
                       <div className="absolute top-1 -right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Tooltip>
                            <TooltipTrigger asChild>
                               <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyToClipboard(msg.text, msg.id)}>
                                {copiedMessageId === msg.id ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                               </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Copy</p>
                            </TooltipContent>
                         </Tooltip>
                       </div>
                    </div>
                    {msg.sender === 'user' && (
                      <Avatar className="h-8 w-8 neumorphic-avatar">
                         <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
              ))}
            </TooltipProvider>

            {isTyping && (
                <div className="flex items-start gap-3 justify-start py-3 animate-fade-in-up">
                    <Avatar className="h-8 w-8 border neumorphic-avatar">
                        <AvatarFallback>N</AvatarFallback>
                    </Avatar>
                    <div className="neumorphic-out-muted rounded-xl px-4 py-3 text-sm w-48">
                        <p className="font-semibold mb-2">Nexus.AI</p>
                        <div className="space-y-2">
                           <Skeleton className="h-3 w-full animate-shimmer" />
                           <Skeleton className="h-3 w-5/6 animate-shimmer" />
                        </div>
                    </div>
                </div>
            )}
           </div>
        </ScrollArea>
      </main>
      <footer className="border-t bg-card p-4">
        {imagePreview && (
          <div className="relative mb-2 p-2 border rounded-lg neumorphic-in w-fit">
            <Image src={imagePreview} alt="Image preview" width={80} height={80} className="rounded-md" />
            <Button
              variant="ghost"
              size="icon"
              className="absolute -top-3 -right-3 h-6 w-6 rounded-full bg-muted hover:bg-destructive"
              onClick={() => {
                setImagePreview(null);
                if (imageInputRef.current) {
                  imageInputRef.current.value = "";
                }
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        <div className="relative">
          <Input
            placeholder="Type your message..."
            className="pr-24 neumorphic-in"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
            disabled={isTyping}
          />
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center">
             <input type="file" ref={imageInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
             <Button
                variant="ghost"
                size="icon"
                onClick={() => imageInputRef.current?.click()}
                disabled={isTyping}
                className="hover:scale-110 transition-transform"
             >
                <ImageIcon className="h-5 w-5" />
                <span className="sr-only">Upload Image</span>
            </Button>
            <Button
              type="submit"
              size="icon"
              onClick={handleSendMessage}
              disabled={(!newMessage.trim() && !imagePreview) || isTyping}
              className="hover:scale-110 transition-transform"
            >
              <Send className="h-5 w-5" />
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
