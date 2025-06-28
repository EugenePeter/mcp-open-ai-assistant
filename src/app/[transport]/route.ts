import { createMcpHandler } from "@vercel/mcp-adapter";
import { z } from "zod";
import OpenAI from "openai";

import semanticTokens from "../tokens-input/migration/semantic 1.json";
import primitiveTokens from "../tokens-input/migration/primitive 1.json";
import type { ChatCompletionTool } from "openai/resources/chat/completions";

const handler = createMcpHandler(
  async (server) => {
    //@ts-ignore
    server.tool(
      "echo",
      "Returns a confirmation message with no input",
      z.object({}),
      async () => {
        return {
          content: [
            { type: "text", text: "Echo tool triggered successfully!" },
          ],
        };
      }
    );
    server.tool(
      "get_latest_ads_semantic_tokens",
      "Returns the latest semantic design tokens for ADS",
      {},
      async () => {
        return {
          content: [
            {
              type: "text",
              text: "Echo tool triggered successfully!",
            },
          ],
        };
      }
    );
    server.tool(
      "get_latest_ads_primitive_tokens",
      "Returns the latest primitive design tokens for ADS",
      {},
      async () => {
        return {
          content: [
            {
              type: "text",
              text: "Echo tool triggered successfully!",
            },
          ],
        };
      }
    );

    server.tool(
      "ask-openai",
      "Ask a question about ADS tokens. OpenAI will decide which tool to call.",
      {
        prompt: z.string(),
      },
      async ({ prompt }) => {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const tools: ChatCompletionTool[] = [
          {
            type: "function", // ✅ this now matches the expected literal type
            function: {
              name: "get_latest_ads_semantic_tokens",
              description: "Returns the latest semantic design tokens for ADS",
              parameters: {
                type: "object",
                properties: {},
                required: [],
              },
            },
          },
          {
            type: "function", // ✅ correct literal type
            function: {
              name: "get_latest_ads_primitive_tokens",
              description: "Returns the latest primitive design tokens for ADS",
              parameters: {
                type: "object",
                properties: {},
                required: [],
              },
            },
          },
        ];

        const res = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{ role: "user", content: prompt }],
          tools,
          tool_choice: "auto",
        });

        const message = res.choices[0]?.message;

        // 🛠️ Tool call detected — let MCP follow up
        if (message?.tool_calls?.length) {
          return {
            content: [
              {
                type: "text",
                text: "OpenAI decided to call a tool. The result will be handled by MCP.",
              },
            ],
          };
        }

        // ✅ Otherwise, respond with structured JSON as a resource
        const jsonText = JSON.stringify({
          answer: message?.content ?? "No response",
          source: "OpenAI",
        });

        return {
          content: [
            {
              type: "resource",
              resource: {
                text: "OpenAI Answer",
                uri:
                  "data:application/json;base64," +
                  Buffer.from(jsonText).toString("base64"),
                mimeType: "application/json",
              },
            },
          ],
        };
      }
    );
  },
  {
    capabilities: {
      tools: {
        echo: {
          description: "Echo a message",
        },
        "ask-openai": {
          description: "Ask a question to OpenAI",
        },
      },
    },
  },
  {
    redisUrl: process.env.REDIS_URL,
    sseEndpoint: "/sse",
    streamableHttpEndpoint: "/mcp",
    basePath: "",
    verboseLogs: true,
    maxDuration: 60,
  }
);

export { handler as GET, handler as POST, handler as DELETE };
