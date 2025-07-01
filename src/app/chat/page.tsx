export const dynamic = "force-dynamic";

import { ChatSidebar, PreviewPanel } from "./components";

export default async function ChatPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left Chat Section */}
      <aside className="w-1/4 bg-gray-50 border-r border-gray-200 p-4">
        <ChatSidebar />
      </aside>

      {/* Right Viewer Section */}
      <main className="w-3/4 bg-white p-6">
        <PreviewPanel />
      </main>
    </div>
  );
}
