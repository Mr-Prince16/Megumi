
"use client";
import * as React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { Chatroom } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  Plus,
  Search,
  Trash2,
  X,
  LogOut,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { SidebarProvider, useSidebar } from "@/context/sidebar-context";

function SidebarContent({
  chatrooms,
  handleCreateChatroom,
  newChatroomTitle,
  setNewChatroomTitle,
  isCreating,
  searchTerm,
  setSearchTerm,
  handleDeleteChatroom,
  handleLogout,
  closeSheet,
}: {
  chatrooms: Chatroom[];
  handleCreateChatroom: () => void;
  newChatroomTitle: string;
  setNewChatroomTitle: (title: string) => void;
  isCreating: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  handleDeleteChatroom: (id: string) => void;
  handleLogout: () => void;
  closeSheet: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col p-2">
      <div className="p-2">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="h-7 w-7 text-primary animate-float" />
          <h1 className="animated-gradient-text text-xl font-bold tracking-tight">
            Nexus.AI
          </h1>
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="New Chat..."
            value={newChatroomTitle}
            onChange={(e) => setNewChatroomTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateChatroom()}
            disabled={isCreating}
            className="neumorphic-in"
          />
          <Button
            onClick={handleCreateChatroom}
            disabled={isCreating || !newChatroomTitle.trim()}
            size="icon"
            className="shrink-0 neumorphic-out"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="relative p-2">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search..."
          className="pl-9 neumorphic-in"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={() => setSearchTerm("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-2">
        {chatrooms
          .sort((a, b) => b.createdAt - a.createdAt)
          .map((chatroom) => (
            <div
              key={chatroom.id}
              className="group flex items-center justify-between rounded-lg text-sm font-medium transition-colors hover:bg-muted/50 neumorphic-out-sm my-1"
            >
              <Link
                href={`/chat/${chatroom.id}`}
                onClick={closeSheet}
                className={cn(
                  "truncate flex-1 px-3 py-2.5",
                  pathname === `/chat/${chatroom.id}` && "font-bold text-primary"
                )}
              >
                {chatroom.title}
              </Link>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 mr-2 opacity-0 group-hover:opacity-100 shrink-0"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the chatroom "{chatroom.title}
                      ". This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDeleteChatroom(chatroom.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
      </nav>

      <div className="mt-auto p-2 border-t">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start gap-2 neumorphic-out-sm"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  );
}

function ChatLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [chatrooms, setChatrooms] = useState<Chatroom[]>([]);
  const [newChatroomTitle, setNewChatroomTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar();

  const loadChatrooms = useCallback(() => {
    const storedChatrooms = localStorage.getItem("chatrooms");
    if (storedChatrooms) {
      setChatrooms(JSON.parse(storedChatrooms));
    } else {
      setChatrooms([]);
    }
  }, []);

  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
      loadChatrooms();
    } else {
      router.push("/");
    }
    setIsLoading(false);
  }, [router, loadChatrooms]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);
  
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'chatrooms' || e.type === 'storage') {
        loadChatrooms();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadChatrooms]);

  const handleCreateChatroom = () => {
    if (newChatroomTitle.trim() === "") {
      return;
    }
    setIsCreating(true);
    setTimeout(() => {
      const newChatroom: Chatroom = {
        id: Date.now().toString(),
        title: newChatroomTitle.trim(),
        messages: [],
        createdAt: Date.now(),
      };
      const updatedChatrooms = [...chatrooms, newChatroom];
      setChatrooms(updatedChatrooms);
      localStorage.setItem("chatrooms", JSON.stringify(updatedChatrooms));
      setNewChatroomTitle("");
      toast({
        title: "Success!",
        description: `Chatroom "${newChatroom.title}" created.`,
      });
      setIsCreating(false);
      router.push(`/chat/${newChatroom.id}`);
      setIsSidebarOpen(false);
    }, 500);
  };

  const handleDeleteChatroom = (id: string) => {
    const deletedChatroom = chatrooms.find((c) => c.id === id);
    const updatedChatrooms = chatrooms.filter((c) => c.id !== id);
    
    setChatrooms(updatedChatrooms);
    localStorage.setItem("chatrooms", JSON.stringify(updatedChatrooms));
    
    toast({
      title: "Chatroom Deleted",
      description: `"${deletedChatroom?.title}" has been removed.`,
      variant: "destructive",
    });

    if (pathname === `/chat/${id}`) {
      router.push("/chat");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userPhone");
    localStorage.removeItem("chatrooms");
    setIsAuthenticated(false);
    router.push("/");
  };
  
  const filteredChatrooms = useMemo(() => {
    if (!debouncedSearchTerm) {
      return chatrooms;
    }
    return chatrooms.filter((chatroom) =>
      chatroom.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [chatrooms, debouncedSearchTerm]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen w-full">
        <div className="hidden md:flex flex-col w-64 lg:w-72 xl:w-80 border-r bg-background/80 p-4 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <div className="flex-1 space-y-2 overflow-y-auto">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Skeleton className="h-4/5 w-4/5" />
        </div>
      </div>
    );
  }

  const sidebarProps = {
    chatrooms: filteredChatrooms,
    handleCreateChatroom,
    newChatroomTitle,
    setNewChatroomTitle,
    isCreating,
    searchTerm,
    setSearchTerm,
    handleDeleteChatroom,
    handleLogout,
    closeSheet: () => setIsSidebarOpen(false),
  };

  return (
    <div className="flex h-screen w-full bg-background/80">
      <aside className="hidden md:flex md:w-64 lg:w-72 xl:w-80 border-r">
        <SidebarContent {...sidebarProps} />
      </aside>

      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent side="left" className="p-0 w-full max-w-sm">
          <SheetHeader className="sr-only">
             <SheetTitle>Nexus.AI Menu</SheetTitle>
             <SheetDescription>Main navigation and chat management menu.</SheetDescription>
          </SheetHeader>
          <SidebarContent {...sidebarProps} />
        </SheetContent>
      </Sheet>

      <main className="flex-1 flex flex-col bg-background">
         {children}
      </main>
    </div>
  );
}

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <ChatLayoutContent>{children}</ChatLayoutContent>
    </SidebarProvider>
  );
}
