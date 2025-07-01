// src/app/utils/analyse-token-changes.ts

import { Octokit } from "octokit";
import { diff as jsonDiff } from "jsondiffpatch";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const consoleFormatter = require("jsondiffpatch/formatters/console");

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const OWNER = "EugenePeter";
const REPO = "design-tokens";
const BRANCH = "master";

/**
 * Fetches commit history for a specific file.
 */
export async function getCommitHistory(filePath: string) {
  const response = await octokit.rest.repos.listCommits({
    owner: OWNER,
    repo: REPO,
    path: filePath,
    per_page: 2, // last two commits
  });

  return response.data.map((commit) => ({
    sha: commit.sha,
    author: commit.commit.author?.name ?? "Unknown",
    date: commit.commit.author?.date ?? "Unknown date",
    message: commit.commit.message,
  }));
}

/**
 * Fetches the raw content of a file at a specific commit SHA.
 */
export async function getFileContentAtCommit(
  filePath: string,
  ref: string
): Promise<Record<string, any>> {
  const { data } = await octokit.rest.repos.getContent({
    owner: OWNER,
    repo: REPO,
    path: filePath,
    ref,
  });

  if (!("content" in data)) {
    throw new Error(`File content not found at ${ref}`);
  }

  const decoded = Buffer.from(data.content, "base64").toString("utf-8");
  return JSON.parse(decoded);
}

/**
 * Gets the latest commit info for a file.
 */
export async function getLastCommitInfo(filePath: string) {
  const commits = await getCommitHistory(filePath);
  return commits[0];
}

/**
 * Calculates the JSON diff between the last two versions of the file.
 */
export async function getFileDiff(filePath: string) {
  const commits = await getCommitHistory(filePath);

  if (commits.length < 2) {
    return "Not enough commit history to compare changes.";
  }

  const [latest, previous] = commits;
  const [latestContent, previousContent] = await Promise.all([
    getFileContentAtCommit(filePath, latest.sha),
    getFileContentAtCommit(filePath, previous.sha),
  ]);

  const delta = jsonDiff(previousContent, latestContent);
  if (!delta) {
    return "No differences found.";
  }

  return consoleFormatter.format(delta);
}
