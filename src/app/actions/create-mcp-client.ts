import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

// You can extract origin from env later
const MCP_ORIGIN = process.env.MCP_ORIGIN ?? "http://localhost:7020";

export async function createMcpClient() {
  const transport = new StreamableHTTPClientTransport(
    new URL(`${MCP_ORIGIN}/mcp`)
  );

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

  await client.connect(transport).then(() => {
    console.log("Connected to MCP server at", MCP_ORIGIN);
  });

  return client;
}

// export async function askOpenAI(prompt: string) {
//   if (!prompt || prompt.trim() === "") {
//     throw new Error("Prompt must be a non-empty string.");
//   }

//   const client = await createMcpClient();

//   const result = await client.callTool({
//     name: "ask-openai",
//     arguments: { prompt },
//   });

//   await client.close();
//   return result;
// }
