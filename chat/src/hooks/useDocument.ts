import { useEffect,useState,useRef } from "react";

import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";


import { pusherClient } from "@/lib/pusher/client";
import type { Document, User, Message } from "@/lib/types/db";

type PusherPayload = {
  senderId: User["id"];
  document: Document;
  message: Message;
};
type PusherPayload2 ={
  deletedMessage: Message;
  updatedMessage: Message;
}

export const useDocument = () => {
  const { docId } = useParams();
  const documentId = Array.isArray(docId) ? docId[0] : docId;

  const [document, setDocument] = useState<Document | null>(null);
  const [dbDocument, setDbDocument] = useState<Document | null>(null);
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);

  const [announcedMsg, setAnnouncedMsg] = useState<Message|null>(null)

  const { data: session } = useSession();
  const userId = session?.user?.id;

  const updateDocument = async () => {
    if (document === null || content === "") return;
    const res = await fetch(`/api/documents/${documentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "update",
        data:{
          title: document.title,
          content: content,
        }
      }),
    });
    if (!res.ok) {
      console.log("NOT OK")
      return;
    }
    const data: Document = await res.json();
    // Update the navbar if the title changed
    if (dbDocument?.title !== data.title) {
      console.log("refresh_title")
      // router.refresh();
    }
    setDbDocument(data);
  };
  const announceMessage = async (messageId:string) => {
    const res = await fetch(`/api/documents/${documentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "announce",
        data:{
          announceId: messageId,
        }
      }),
    });
    if (!res.ok) {
      console.log("NOT OK")
      return;
    }

  };
  const unsendMessage = async(messageId:string) =>{
    const res = await fetch(`/api/messages/${messageId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "unsend",
        data:{
          messageId: messageId,
        }
      }),
    });  
    if (!res.ok) {
      console.log("NOT OK")
      console.log(messageId)
      return;
    }
  }
  const deleteForMessage = async(messageId:string, deleteForId:string) =>{
    const res = await fetch(`/api/messages/${messageId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "deleteFor",
        data:{
          deleteFor: deleteForId,
        }
      }),
    });  
    if (!res.ok) {
      console.log("NOT OK")
      console.log(messageId)
      return;
    }
  }
  const userIdRef = useRef(userId);
  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]); // Update the ref when userId changes

  // Subscribe to pusher events
  useEffect(() => {
    if (!documentId) return;
    // Private channels are in the format: private-...
    const channelName = `private-${documentId}`;
    try {
      const channel = pusherClient.subscribe(channelName);
      channel.bind("doc:update", ({ senderId, message}: PusherPayload) => {
        console.log("doc:update event received");
        const currentUserId = userIdRef.current
        if (senderId === currentUserId) {
          // return;
        }
        // setDocument(document);
        // setDbDocument(document);
        setMessages(messages => [...messages, message])
        // router.refresh();
      });
      channel.bind("msg:unsend", ({updatedMessage}: PusherPayload2) => {
        setMessages(prevMessages => {
          const filteredMessages = prevMessages.filter(message => message.messageId !== updatedMessage.messageId);
          return filteredMessages;
        });
      });
      channel.bind("msg:update", ({updatedMessage}: PusherPayload2) => {
        setMessages(prevMessages => {
          const filteredMessages = prevMessages.filter(message => message.messageId !== updatedMessage.deleteFor);
          return filteredMessages;
        });
      });      
    } catch (error) {
      console.error(error);
      router.push("/docs");
    }

    // Unsubscribe from pusher events when the component unmounts
    return () => {
      pusherClient.unsubscribe(channelName);
    };
  }, [documentId, router, userIdRef]);

  useEffect(() => {
    if (!documentId || !router) return;
  
    const fetchDocument = async () => {
      const res = await fetch(`/api/documents/${documentId}`);
      if (!res.ok) {
        setDocument(null);
        router.push("/docs");
        return;
      }
      const data = await res.json();
      setDocument(data);
      setDbDocument(data);
      setMessages(data.messages);
      setMessages((prevMessages) => {
        const filteredMessages = prevMessages.filter(
          (prevMessage) => prevMessage.deleteFor !== userIdRef.current
        );
        return filteredMessages;
      });
      setAnnouncedMsg(data.announcedMsg);
  
      router.refresh();
    };
  
    fetchDocument();
  }, [documentId, router, userIdRef]);
  

  const title = document?.title || "";
  const setTitle = (newTitle: string) => {
    if (document === null) return;
    setDocument({
      ...document,
      title: newTitle,
    });
  };

  const content = document?.content || "";
  const setContent = (newContent: string) => {
    if (document === null) return;
    setDocument({
      ...document,
      content: newContent,
    });
  };

  return {
    documentId,
    document,
    title,
    setTitle,
    content,
    setContent,
    updateDocument,
    messages,
    userId,
    announceMessage,
    announcedMsg,
    unsendMessage,
    deleteForMessage
  };
};