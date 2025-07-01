import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const origin = "https://mcp-open-ai-assistant.vercel.app";

async function main() {
  const transport = new StreamableHTTPClientTransport(new URL(`${origin}/mcp`));

  const client = new Client(
    {
      name: "example-client",
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

  await client.connect(transport);

  client.StreamableHTTPClientTransport;

  client.notifications.on("connected", () => {
    console.log("Client connected to MCP server");
  });

  console.log("Connected", client.getServerCapabilities());

  const result = await client.listTools();
  console.log(result);
}

main();
