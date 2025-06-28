export const dynamic = "force-dynamic";

import { askOpenAI } from "@/app/actions/ai-assistant";
import { Suspense } from "react";
import { ChatSidebar, PreviewPanel } from "./components";
import { handleSubmit } from "../actions/handleSubmit";

export default async function ChatPage() {
  const result = await askOpenAI();

  return (
    <div className="flex min-h-screen">
      {/* Left Chat Section */}
      <aside className="w-1/4 bg-gray-50 border-r border-gray-200 p-4">
        <ChatSidebar />
      </aside>

      {/* Right Viewer Section */}
      <main className="w-3/4 bg-white p-6">
        <PreviewPanel preview={result} />
      </main>
    </div>
  );
  // return (
  //   <div className="max-w-xl mx-auto p-6">
  //     <h1 className="text-2xl font-semibold mb-4">
  //       🧠 Ask AI (RSC + Server Action)
  //     </h1>

  //     <Suspense fallback={<p>Loading...</p>}>
  //       <ChatForm />
  //     </Suspense>
  //   </div>
  // );
}

async function ChatForm() {
  const result = await askOpenAI();
  console.log("RESULT", result);
  return (
    <div>
      <form
        // action={handleSubmit}
        className="space-y-4"
      >
        <textarea
          name="prompt"
          placeholder="Type your message..."
          rows={4}
          className="w-full border border-gray-300 p-2 rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Send
        </button>
      </form>

      <div className="mt-4 p-2border rounded">
        <pre>{JSON.stringify(result, null, 2)}</pre>
      </div>
    </div>
  );
}
