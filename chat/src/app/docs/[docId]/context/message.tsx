"use client";
import { createContext, useEffect, useState } from "react";
// import type { Message } from "@/package/types/message";
import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";
import { env } from "@/lib/utils/env";

export type User = {
  displayId: string;
};
export type Message = {
  content: string;
  senderId: User["displayId"];
  timestamp: Date;
};

export type MessagesContext = {
  messages: Message[];
  socket: Socket | null;
  setMessages: (messages: Message[]) => void;
  sendMessage: (message: Omit<Message, "timestamp">) => Promise<void>;
};

export const MessagesContext = createContext<MessagesContext>({
  messages: [],
  setMessages: () => {},
  socket: null,
  sendMessage: async () => {},
});

type Props = {
  children: React.ReactNode;
};

export function MessagesProvider({ children }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const initSocket = () => {
      const socket = io(env.NEXT_PUBLIC_SOCKET_URL);
      socket.on("receive_message", (newMessage: Message) => {
        console.log("new message");
        setMessages((messages) => [...messages, newMessage]);
      });
      setSocket(socket);
    };
    const fetchMessages = async () => {
      try {
        const res = await fetch("/api/chats");
        const data = await res.json();
        if (data?.messages) {
          setMessages(data.messages);
          console.log(data.messages);
        }
      } catch (error) {
        console.log(error);
      }
    };
    initSocket();
    fetchMessages();
  }, []);

  const sendMessage = async (message: Omit<Message, "timestamp">) => {
    if (!socket) {
      alert("No socket! Please retry later.");
      return;
    }
    try {
      const res = await fetch("/api/chats", {
        method: "POST",
        body: JSON.stringify(message),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (data?.message) {
        socket.emit("send_message", data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <MessagesContext.Provider
      value={{ messages, setMessages, sendMessage, socket }}
    >
      {children}
    </MessagesContext.Provider>
  );
}
