// src/app/actions/handleSubmit.ts
"use server";

import { askOpenAI } from "./ai-assistant";

export async function handleSubmit(formData: FormData) {
  const prompt = formData.get("prompt");

  if (typeof prompt !== "string") {
    throw new Error("Prompt must be a string");
  }

  return await askOpenAI(prompt);
}
