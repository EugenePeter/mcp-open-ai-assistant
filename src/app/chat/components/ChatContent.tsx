"use client";

import { submitPrompt } from "@/app/actions/submitPrompt";
import { handleSubmit } from "./ChatSidebar";
import { useEffect, useRef, useState } from "react";
import { Message } from "./Chat.types";
import { getPrompts } from "@/app/actions/get-prompts";

function isJson(str: string) {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

export type MessageItem = NonNullable<Message["messages"]>[number];

type ChatContentProps = {
  prompts: any;
};

export function ChatContent(props: ChatContentProps) {
  const { prompts } = props;
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(false);

  const lastUserMsgRef = useRef<HTMLDivElement | null>(null);
  const onSubmit = async () => {
    setLoading(true);
    const response = await handleSubmit(prompt);
    if (!response) return;
    setMessages((prev) => [...prev, ...(response.messages ?? [])]);
    setPrompt("");
    setLoading(false);
  };

  const handleSendPresetPrompt = async (promptName: string) => {
    setLoading(true);
    if (!promptName) return;
    const res = await getPrompts(promptName);
    console.log("Prompt response:", res);
    const content = res.messages[0].content;
    if (!content) return;
    if (!("text" in content && typeof content.text === "string")) return;
    const response = await submitPrompt(content.text);

    if (!response) return;
    setMessages((prev) => [...prev, ...(response.messages ?? [])]);
    setLoading(false);
  };

  useEffect(() => {
    lastUserMsgRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      <div
        ref={lastUserMsgRef}
        className="flex-1 overflow-y-auto space-y-2 pr-2"
      >
        {messages.map((msg, idx) => {
          const isLastUser =
            msg.role === "user" &&
            [...messages].reverse().find((m) => m.role === "user")?.id ===
              msg.id;

          return (
            <div
              key={msg.id}
              ref={isLastUser ? lastUserMsgRef : null}
              className={`rounded p-2 text-sm whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-blue-100 text-blue-800 self-end text-right"
                  : "bg-gray-100 text-gray-800 self-start text-left"
              }`}
            >
              {isJson(msg.text) ? (
                <pre className="bg-gray-900 text-green-200 p-4 rounded overflow-auto text-xs">
                  <code>{JSON.stringify(JSON.parse(msg.text), null, 2)}</code>
                </pre>
              ) : (
                msg.text
              )}
            </div>
          );
        })}
      </div>
      <div className="pt-2 pb-4 flex flex-wrap gap-2">
        {prompts.map((name: string) => (
          <button
            key={name}
            onClick={() => handleSendPresetPrompt(name)}
            className="px-3 py-1 text-sm rounded-full border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
          >
            {name}
          </button>
        ))}
      </div>

      <div className="pt-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <textarea
            rows={3}
            placeholder="Type your message..."
            className="w-full border border-gray-300 p-2 rounded text-sm resize-none text-gray-700"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button
            onClick={onSubmit}
            className={`w-full mt-2 py-2 rounded transition ${
              loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            } text-white`}
            disabled={loading}
          >
            {loading ? "Thinking..." : "Send"}
          </button>
        </form>
      </div>
    </>
  );
}
