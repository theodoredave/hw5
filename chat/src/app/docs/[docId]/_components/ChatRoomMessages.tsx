"use client";
import React, { useEffect, useState } from "react";
import { useDocument } from "@/hooks/useDocument";
import { Reply, Megaphone, Trash2 } from 'lucide-react';

interface ContextMenu {
  messageId: string;
  x: number;
  y: number;
}
function ChatRoomMessages() {
  const { messages, userId, announceMessage, unsendMessage, deleteForMessage } = useDocument();
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
  const isLink = (text: string) => {
    const url = /\b(?:https?:\/\/)?(?:www\.)?[^.\s]+\.[^.\s]+\S*\b/;
    return url.test(text);
  };

  const handleContextMenu = (e: React.MouseEvent, messageId: string) => {
    e.preventDefault();
    
    setContextMenu(prevState => 
      prevState && prevState.messageId === messageId ? null : { messageId, x: e.clientX, y: e.clientY }
    );
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  useEffect(() => {
    const closeContextMenu = () => {
      setContextMenu(null);
    };

    window.addEventListener("scroll", closeContextMenu);

    return () => {
      window.removeEventListener("scroll", closeContextMenu);
    };
  }, []);

  return (
    <div className="flex flex-col justify-end h-full px-2 pt-4">
      {messages.map((message, index) => {
        const isSender = message.senderId === userId;

        const handleUnsend = (e: React.MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
        
          if (isSender) {
            // Only allow unsend if the current user is the sender
            unsendMessage(message.messageId);
          }
        
          handleCloseContextMenu();
        };
        
        const handleDelete = (e: React.MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          if (!userId) return;
          deleteForMessage(message.messageId, userId);
          handleCloseContextMenu();
        };
        
        const handleAnnounce = (e: React.MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          announceMessage(message.messageId);
          handleCloseContextMenu();
        };

        const handleClick = () => {
          if (isLink(message.content)) {
            let url = message.content;
            if (!/^https?:\/\//i.test(url)) {
              url = `http://${url}`;
            }
            window.open(url, "_blank");
          }
        };

        return (
          <div
            key={index}
            className="w-full pt-1"
            onContextMenu={(e) => handleContextMenu(e, message.messageId)}
          >
            
            <div
              className={`flex flex-row items-end gap-2 ${
                isSender && "justify-end"
              }`}
              onClick={handleClick}
            >
              <div
                className={`max-w-[60%] rounded-2xl px-3 py-1 leading-6 relative ${
                  isSender ? "bg-black text-white" : "bg-blue-200 text-black"
                }`}
              >
                {message.content}
                <div className=" flex items-center justify-end gap-2">
                  {contextMenu && contextMenu.messageId === message.messageId && (
                    <>
                      <button className="p-1" onClick={handleUnsend}>
                        <Reply size={16} />
                      </button>
                      <button className="p-1" onClick={handleDelete}>
                        <Trash2 size={16} />
                      </button>
                      <button className="p-1" onClick={handleAnnounce}>
                        <Megaphone size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ChatRoomMessages;