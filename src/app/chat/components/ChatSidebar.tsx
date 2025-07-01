import { submitPrompt } from "@/app/actions/submitPrompt";
import { getAllPrompts } from "@/app/actions/get-prompts";
import { ChatContent } from "./ChatContent";

export const handleSubmit = async (prompt: string) => {
  const res = await submitPrompt(prompt);
  if (!res) return;
  return res;
};

export async function ChatSidebar() {
  const prompts = await getAllPrompts();

  return (
    <div className="flex flex-col h-full max-h-screen border-r p-4">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">
        ADS AI ASSISTANT
      </h2>
      <ChatContent prompts={prompts} />
    </div>
  );
}
