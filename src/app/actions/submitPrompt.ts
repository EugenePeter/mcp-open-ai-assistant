"use server";

import { v4 as uuidv4 } from "uuid";
import { createMcpClient } from "./create-mcp-client";
import { Message } from "../chat/components/Chat.types";

export async function submitPrompt(
  prompt: string
): Promise<Message | undefined> {
  if (!prompt) {
    console.warn("No prompt provided.");
    return;
  }

  const client = await createMcpClient();

  try {
    const result = await client.callTool({
      name: "ask-openai",
      arguments: { prompt },
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
        { id: uuidv4(), role: "user" as const, text: prompt },
        { id: uuidv4(), role: "bot" as const, text: botText },
      ],
    };
  } catch (error: any) {
    console.error("Error calling tool:", error);
    return {
      messages: [
        { id: uuidv4(), role: "user" as const, text: prompt },
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
