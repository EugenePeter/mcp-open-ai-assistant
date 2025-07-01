const MCP_ORIGIN =
  process.env.NODE_ENV === "production"
    ? process.env.MCP_ORIGIN ?? "https://mcp-open-ai-assistant.vercel.app"
    : "http://localhost:7020";

export default function Home() {
  const chatUrl = `${MCP_ORIGIN}/chat`;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-24 bg-gradient-to-br from-gray-50 to-gray-200">
      <div className="max-w-3xl text-center">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-800 mb-6">
          Hi, I’m ADS AI Assistant
        </h1>
        <p className="text-lg text-gray-600 mb-10">
          I help you interact with your design system, analyze token changes,
          and generate MUI themes — all powered by OpenAI and MCP.
        </p>
        <a
          href={chatUrl}
          className="inline-block px-6 py-3 text-white text-sm font-medium bg-blue-600 hover:bg-blue-700 rounded-full shadow transition"
        >
          Get Started
        </a>
      </div>
    </div>
  );
}
