"use server";

import { v4 as uuidv4 } from "uuid";
import { createMcpClient } from "./create-mcp-client";
import { Message } from "../chat/components/Chat.types";
export async function getAndRunPrompt(promptName: string): Promise<Message> {
  const client = await createMcpClient();

  try {
    // Step 1: Get the prompt messages from the MCP server
    const { messages } = await client.getPrompt({ name: promptName });

    // Step 2: Call the ask-openai tool with the system/user messages from the prompt
    const result = await client.callTool({
      name: "ask-openai",
      arguments: { prompt: messages.map((m) => m.content).join("\n") },
    });

    let botText = "No response from tool.";

    const content = result.content;

    if (Array.isArray(content)) {
      const first = content[0];

      if (first?.type === "resource" && first.resource?.uri) {
        const base64 = first.resource.uri.split(",")[1];
        const decoded = Buffer.from(base64, "base64").toString("utf-8");
        botText = decoded;
      } else if (first?.type === "text") {
        botText = first.text;
      }
    }

    return {
      messages: [
        {
          id: uuidv4(),
          role: "user" as const,
          text: messages.map((m) => m.content).join("\n"),
        },
        {
          id: uuidv4(),
          role: "bot" as const,
          text: botText,
        },
      ],
    };
  } catch (error: any) {
    console.error("Error running prompt:", error);
    return {
      messages: [
        {
          id: uuidv4(),
          role: "bot" as const,
          text: `Error: ${error.message}`,
        },
      ],
    };
  } finally {
    try {
      await client.close();
    } catch (closeErr) {
      console.error("Error closing client:", closeErr);
    }
  }
}
