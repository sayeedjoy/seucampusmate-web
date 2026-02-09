import { NextRequest, NextResponse } from "next/server";

const GITHUB_API = "https://api.github.com/repos";

// Cache for 1 hour to avoid hitting GitHub rate limits
export const revalidate = 3600;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const repo =
    searchParams.get("repo") ??
    process.env.NEXT_PUBLIC_GITHUB_REPO ??
    "sayeedjoy/seucampusmate-web";

  if (!repo || !repo.includes("/")) {
    return NextResponse.json(
      { error: "Valid repo (owner/name) is required" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(`${GITHUB_API}/${repo}`, {
      next: { revalidate },
      headers: {
        Accept: "application/vnd.github.v3+json",
        ...(process.env.GITHUB_TOKEN && {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        }),
      },
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: "GitHub API error", details: text },
        { status: res.status }
      );
    }

    const data = (await res.json()) as { stargazers_count: number };
    return NextResponse.json({
      repo,
      stargazersCount: data.stargazers_count,
    });
  } catch (err) {
    console.error("[api/github/stars]", err);
    return NextResponse.json(
      { error: "Failed to fetch star count" },
      { status: 500 }
    );
  }
}
