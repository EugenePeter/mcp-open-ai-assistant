export async function fetchJsonFromGitHub(path: string, ref = "master") {
  const repoOwner = "EugenePeter";
  const repoName = "design-tokens";

  console.log(
    `[GitHub Fetch] 🔄 Fetching '${path}' from '${repoOwner}/${repoName}@${ref}'`
  );

  const url = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${path}?ref=${ref}`;
  console.log("[GitHub Fetch] URL:", url);
  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      console.error(`[GitHub Fetch]  Failed: ${res.status} ${res.statusText}`);
      throw new Error(`GitHub API error ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();

    if (!data.content) {
      console.warn(`[GitHub Fetch] ⚠️ No content in '${path}'`);
      throw new Error("No content returned from GitHub.");
    }

    const decoded = Buffer.from(data.content, "base64").toString("utf-8");
    console.log(
      `[GitHub Fetch] ✅ Success: '${path}' (${decoded.length} bytes)`
    );

    return JSON.parse(decoded);
  } catch (err: any) {
    console.error(`[GitHub Fetch] Error fetching '${path}':`, err.message);
    throw err;
  }
}
