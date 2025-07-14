// This file contains all the interfaces for the data models used in the application.

// Represents a single message in a chatroom.
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  username: string;
  timestamp: number;
  avatarUrl?: string; // Optional URL for the sender's avatar
  imageUrl?: string; // Optional URL for an uploaded image
}

// Represents a chatroom.
export interface Chatroom {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}
