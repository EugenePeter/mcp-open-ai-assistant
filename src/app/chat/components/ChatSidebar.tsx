// app/chat/ChatSidebar.tsx
export async function ChatSidebar() {
  const messages = [
    { id: 1, role: "user", text: "Hi!" },
    { id: 2, role: "bot", text: "Hello! How can I help you today?" },
  ];

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-lg font-semibold mb-4">🧠 Chat</h2>

      <div className="flex-1 space-y-2 overflow-y-auto pr-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`rounded p-2 text-sm ${
              msg.role === "user"
                ? "bg-blue-100 text-blue-800 self-end text-right"
                : "bg-gray-200 text-gray-700 self-start"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <form action="" className="mt-4">
        <textarea
          name="prompt"
          rows={3}
          placeholder="Type your message..."
          className="w-full border border-gray-300 p-2 rounded text-sm resize-none"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white mt-2 py-2 rounded hover:bg-blue-700 transition"
        >
          Send
        </button>
      </form>
    </div>
  );
}
