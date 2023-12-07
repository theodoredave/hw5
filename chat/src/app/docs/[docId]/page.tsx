"use client";
import ChatRoomInput from "./_components/ChatRoomInput";
import ChatRoomMessages from "./_components/ChatRoomMessages";
import { useDocument } from "@/hooks/useDocument";
import { Megaphone } from "lucide-react";
import React from "react";

function DocPage() {
  const { title, setTitle,announcedMsg } = useDocument();

  return (
    <div className="w-full opacity-100">
      <nav className="sticky top-0 flex w-full justify-between p-2 shadow-sm">
        <div className="flex items-center">
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
            }}
            placeholder="Document Title"
            className="rounded-lg px-2 py-1 text-slate-700 outline-0 focus:bg-slate-100"
          />
        </div>
      </nav>
      <nav className="sticky top-0 flex w-full justify-between p-2 shadow-sm">
      <div className="flex items-center ml-4 border border-gray-300 p-2 rounded">
        <Megaphone size={24} className="mr-2" />
        <p className="mt-1">{announcedMsg?.content}</p>
      </div>
      </nav>
      <div className="w-full h-full flex flex-col justify-between shadow-lg">
        <div className="overflow-y-scroll">
          <ChatRoomMessages />
        </div>
        <div className="p-2">
          <ChatRoomInput />
        </div>
      </div>      
    </div>
  );
}

export default DocPage;