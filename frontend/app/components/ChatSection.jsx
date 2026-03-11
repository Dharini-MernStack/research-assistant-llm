"use client";
import { useState, useRef, useEffect } from "react";
import researchAssistant from "../../lib/api";

export default function ChatSection({ filename }) {
  const [messages, setMessages] = useState([
    { id: "welcome", role: "assistant", content: "Hi! I've read the document. Ask me anything about it." }
  ]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!userInput.trim() || isLoading) return;

    const question = userInput.trim();
    setUserInput("");

    // Add user message
    setMessages(prev => [...prev, { id: Date.now().toString(), role: "user", content: question }]);
    setIsLoading(true);

    try {
      const data = await researchAssistant.askQuestion(filename, question);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.answer,
      }]);
    } catch (err) {
      console.error("Error:", err);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Something went wrong. Please try again.",
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col h-[500px]">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800">Chat</h2>
        <p className="text-xs text-gray-400">Ask anything about the document · Powered by Vercel AI SDK</p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] ${msg.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"} rounded-2xl px-4 py-3 text-sm leading-relaxed`}>
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl px-4 py-3 text-sm text-gray-400 animate-pulse">
              Thinking...
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question..."
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-400 transition"
        />
        <button
          onClick={handleSend}
          disabled={!userInput.trim() || isLoading}
          className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}