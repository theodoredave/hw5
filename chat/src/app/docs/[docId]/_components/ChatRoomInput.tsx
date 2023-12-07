"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { useDocument } from "@/hooks/useDocument";

function ChatRoomInput() {
  const {content, setContent, updateDocument, messages } = useDocument();
  const router = useRouter();
  const scrollRef = useRef<HTMLFormElement>(null);
  useEffect(()=>{
    if (scrollRef.current){
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateDocument();
    setContent("");
  };
  return (
    <form ref={scrollRef} className="flex gap-2" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Aa"
        value = {content}
        onChange={(e) => setContent(e.target.value)}
        className="text-md flex-1 border border-gray-300 p-1 rounded-md outline-none focus:border-gray-600 transition duration-200 ease-in-out"
      />
      <button
        type="submit"
        className="bg-black text-white py-1 px-2 rounded-lg text-sm hover:bg-gray-700 transition duration-200 ease-in-out"
      >
        Send
      </button>
    </form>
  );
}

export default ChatRoomInput;