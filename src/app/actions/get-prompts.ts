"use server";

import { createMcpClient } from "./create-mcp-client";

export async function getAllPrompts() {
  const client = await createMcpClient();

  const allPrompts = await client.listPrompts();
  if (!allPrompts) return;
  return allPrompts.prompts.map((prompt) => prompt.name);
}

export async function getPrompts(name: string) {
  const client = await createMcpClient();
  const prompts = await client.getPrompt({ name });
  return prompts;
}
