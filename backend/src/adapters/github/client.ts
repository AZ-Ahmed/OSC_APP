import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

interface CommitFileInput {
    owner: string;
    repo: string;
    path: string; // chemin complet incluant le nom du fichier
    content: string;
    message?: string;
}

export async function commitFile({
    owner,
    repo,
    path,
    content,
    message,
}: CommitFileInput): Promise<void> {
    if (!owner || !repo || !path) {
        throw new Error("Missing GitHub owner, repo, or path");
    }

    const encodedContent = Buffer.from(content, "utf-8").toString("base64");

    await octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        message: message ?? `Add note ${path}`,
        content: encodedContent,
        branch: "main",
    });
}
