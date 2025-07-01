import { createMcpHandler } from "@vercel/mcp-adapter";
import { z } from "zod";
import OpenAI from "openai";

import semanticTokens from "../tokens-input/migration/semantic 1.json";
import primitiveTokens from "../tokens-input/migration/primitive 1.json";
import { systemPrompt } from "@/app/mock-data/system-prompt";

import { fetchJsonFromGitHub } from "../utils/fetch-json-from-repo";

import { transformTheme } from "@/app/utils/ai-assitant-utils";

import {
  // getCommitHistory,
  getFileDiff,
  getLastCommitInfo,
} from "@/app/utils/analyse-token-changes";

import type { ChatCompletionTool } from "openai/resources/chat/completions";

const handler = createMcpHandler(
  async (server) => {
    server.tool(
      "get_latest_ads_semantic_tokens",
      "Returns the latest semantic design tokens for ADS",
      {},
      async () => {
        return {
          content: [
            {
              type: "resource",
              resource: {
                text: "Latest Semantic Tokens",
                uri:
                  "data:application/json;base64," +
                  Buffer.from(JSON.stringify(semanticTokens, null, 2)).toString(
                    "base64"
                  ),
                mimeType: "application/json",
              },
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
              type: "resource",
              resource: {
                text: "Latest Semantic Tokens",
                uri:
                  "data:application/json;base64," +
                  Buffer.from(
                    JSON.stringify(primitiveTokens, null, 2)
                  ).toString("base64"),
                mimeType: "application/json",
              },
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
            type: "function",
            function: {
              name: "get_latest_ads_primitive_tokens",
              description:
                "Return raw primitive design tokens used as base values. These are low-level design values (e.g., colors, spacing, sizes). Return raw tokens. Do not use this to generate themes.",
              parameters: { type: "object", properties: {}, required: [] },
            },
          },
          {
            type: "function",
            function: {
              name: "get_latest_ads_semantic_tokens",
              description:
                "Return semantic tokens that reference primitive tokens for UI concepts like brand, background, and typography. Return raw tokens. Do not use this to generate themes.",
              parameters: { type: "object", properties: {}, required: [] },
            },
          },
          {
            type: "function",
            function: {
              name: "generate_ads_mui_theme",
              description:
                "Generate a complete MUI theme object by resolving semantic token references into actual values using both primitive and semantic tokens. Useful for outputting a fully-formed MUI theme.",
              parameters: {
                type: "object",
                properties: {
                  format: {
                    type: "string",
                    enum: ["mui"],
                    description:
                      "Theme format. Use 'mui' for MUI ThemeProvider.",
                  },
                },
                required: ["format"],
              },
            },
          },
          {
            type: "function",
            function: {
              name: "analyze_token_changes",
              description:
                "Analyze recent changes to either primitive or semantic tokens, including who changed it, when, and what was changed.",
              parameters: {
                type: "object",
                properties: {
                  file: {
                    type: "string",
                    enum: ["primitive", "semantic"],
                    description:
                      "Choose whether to analyze primitive or semantic tokens",
                  },
                },
                required: ["file"],
              },
            },
          },
        ];

        const chat = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          tool_choice: "auto",
          tools,
        });

        const choice = chat.choices[0];
        const toolCall = choice.message.tool_calls?.[0];

        if (!toolCall) {
          return {
            content: [
              {
                type: "text",
                text: choice.message.content ?? "No answer",
              },
            ],
          };
        }

        const { name, arguments: argsRaw } = toolCall.function;
        const args = argsRaw ? JSON.parse(argsRaw) : {};
        console.log("Tool name:", name);

        const toolMap: Record<string, (args?: any) => Promise<any>> = {
          get_latest_ads_primitive_tokens: () =>
            fetchJsonFromGitHub("tokens/primitive.json"),
          get_latest_ads_semantic_tokens: () =>
            fetchJsonFromGitHub("tokens/semantic.json"),
          generate_ads_mui_theme: async () => {
            const primitive = await fetchJsonFromGitHub(
              "tokens/primitive.json"
            );
            const semantic = await fetchJsonFromGitHub("tokens/semantic.json");
            return transformTheme(primitive, semantic);
          },
          analyze_token_changes: async (args) => {
            const filename =
              args.file === "primitive"
                ? "tokens/primitive.json"
                : "tokens/semantic.json";
            const [commitInfo, diff] = await Promise.all([
              getLastCommitInfo(filename),
              getFileDiff(filename),
            ]);
            let summary = "";
            try {
              const chatSummary = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                  {
                    role: "system",
                    content:
                      "You are a helpful assistant that summarizes design token diffs in plain English.",
                  },
                  {
                    role: "user",
                    content: `Explain this diff in human-readable terms:\n${diff}`,
                  },
                ],
              });
              summary = chatSummary.choices[0]?.message?.content ?? "";
            } catch {
              summary = "Unable to summarize diff.";
            }

            return {
              content: [
                {
                  type: "text",
                  text: `Last modified by ${commitInfo.author} on ${commitInfo.date} — ${commitInfo.message}`,
                },
                {
                  type: "text",
                  text: summary,
                },
              ],
            };
          },
        };
        const handlerFn = toolMap[name];

        if (!handlerFn) {
          return {
            content: [
              {
                type: "text",
                text: `Tool ${name} not recognized.`,
              },
            ],
          };
        }
        const tokens = await handlerFn(args);
        if (!tokens) {
          return {
            content: [
              {
                type: "text",
                text: `Tool ${name} not recognized.`,
              },
            ],
          };
        }
        // if (Array.isArray(tokens?.content)) {
        //   return { content: tokens.content };
        // }
        return {
          content: [
            {
              type: "resource",
              resource: {
                text: name.replace(/_/g, " "),
                uri: `data:application/json;base64,${Buffer.from(
                  JSON.stringify(tokens, null, 2)
                ).toString("base64")}`,
                mimeType: "application/json",
              },
            },
          ],
        };
      }
    );
    server.tool(
      "analyze_token_changes",
      "Analyze recent changes to primitive and semantic tokens",
      {
        file: z.enum(["primitive", "semantic"]),
      },
      async ({ file }) => {
        const filename =
          file === "primitive"
            ? "tokens/primitive.json"
            : "tokens/semantic.json";
        const [
          commitInfo,
          // commitHistory,
          diff,
        ] = await Promise.all([
          getLastCommitInfo(filename),
          // getCommitHistory(filename),
          getFileDiff(filename),
        ]);

        return {
          content: [
            {
              type: "text",
              text: `Last modified by ${commitInfo.author} on ${commitInfo.date} — ${commitInfo.message}`,
            },
            {
              type: "text",
              text: `\nDiff:\n${diff}`,
            },
          ],
        };
      }
    );

    server.prompt("generate_mui_theme", async () => {
      return {
        description:
          "Generate a complete MUI theme using the latest ADS tokens.",
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: "Generate a complete MUI theme using the latest semantic and primitive ADS tokens. Do not return raw token data.",
            },
          },
        ],
      };
    });
    server.prompt("get_latest_ads_primitive_tokens", async () => {
      return {
        description: "Get the latest ADS primitive tokens.",
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: "Get the latest ADS primitive design tokens.",
            },
          },
        ],
      };
    });

    server.prompt("get_latest_ads_semantic_tokens", async () => {
      return {
        description: "Get the latest ADS semantic tokens.",
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: "Get the latest ADS semantic design tokens.",
            },
          },
        ],
      };
    });
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
        get_latest_ads_semantic_tokens: {
          description: "Returns the latest semantic tokens",
        },
        get_latest_ads_primitive_tokens: {
          description: "Returns the latest primitive tokens",
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
