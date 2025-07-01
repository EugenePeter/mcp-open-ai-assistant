"use server";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
const origin = "http://localhost:7020";
// || "https://mcp-open-ai-assistant.vercel.app";
export async function askOpenAI() {
  //   const transport = new StreamableHTTPClientTransport(
  //     new URL(`${process.env.MCP_SERVER_ORIGIN ?? "http://localhost:6020"}/mcp`)
  //   );

  // if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
  //   throw new Error("Prompt must be a non-empty string.");
  // }

  const transport = new StreamableHTTPClientTransport(new URL(`${origin}/mcp`));

  const client = new Client(
    {
      name: "nextjs-client",
      version: "1.0.0",
    },
    {
      capabilities: {
        prompts: {},
        resources: {},
        tools: {},
      },
    }
  );

  return await client.connect(transport);

  // const result = await client.callTool({
  //   name: "ask-openai",
  //   arguments: { prompt },
  // });

  // console.log("PROMPT", prompt); // 🔧 Now actually call the `ask-openai` tool with the user input
  // // const result = await client.callTool("ask-openai", { prompt });
  // await client.close();

  // return result;
  //   return result.map((tool) => tool.name).join(", ");
  //   return result?.content?.[0]?.text ?? "No response from agent";
}
