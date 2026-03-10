"use client";
import { useChat } from "@ai-sdk/react";
import { useRef, useEffect, useState } from "react";
import researchAssistant from "../../lib/api";

export default function ChatSection({ filename }) {
  const [context, setContext] = useState("");
  const bottomRef = useRef(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } =
    useChat({
      api: "/api/chat",
      body: { context },
      initialMessages: [
        {
          id: "welcome",
          role: "assistant",
          content: "Hi! I've read the document. Ask me anything about it.",
        },
      ],
    });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const question = (input || "").trim();
    if (!question) return;

    try {
      const data = await researchAssistant.askQuestion(filename, question);

      const relevantContext =
        data?.citations?.map((c) => c.preview).join("\n\n") || "";

      setContext(relevantContext);
    } catch (err) {
      console.error("Error fetching context:", err);
    }

    handleSubmit(e);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col h-[500px]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800">Chat</h2>
        <p className="text-xs text-gray-400">
          Ask anything about the document
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-800"
              } rounded-2xl px-4 py-3 text-sm leading-relaxed`}
            >
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

        {error && (
          <div className="text-red-500 text-xs text-center">
            {error.message}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleFormSubmit}
        className="px-6 py-4 border-t border-gray-100 flex gap-3"
      >
        <input
          value={input || ""}
          onChange={handleInputChange}
          placeholder="Ask a question..."
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-400 transition"
        />

        <button
          type="submit"
          disabled={!input || !input.trim()}
          className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Send
        </button>
      </form>
    </div>
  );
}