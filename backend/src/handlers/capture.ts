import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { complete } from "../adapters/openai/client.js";
import { SYSTEM_PROMPT_V1 as SYSTEM_PROMPT } from "../core/prompts/system.js";
import { validateMarkdown } from "../core/validation/index.js";
import { commitFile } from "../adapters/github/client.js";
import { normalizeMarkdown } from "../core/transform/normalizeMarkdown.js";


export const handler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    try {
        if (!event.body) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    success: false,
                    error: "Missing request body",
                }),
            };
        }

        const body = JSON.parse(event.body);

        const text: string = body.text ?? "";
        const projectPath: string = body.projectPath;

        if (!projectPath || typeof projectPath !== "string") {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    success: false,
                    error: "Missing or invalid projectPath",
                }),
            };
        }

        // ✅ SYSTEM PROMPT : toujours défini
        const systemPrompt = SYSTEM_PROMPT;

        // ✅ USER PROMPT : toujours une string
        const userPrompt = `
User raw input:
${text || "(no text provided)"}
`;

        // 🔮 Appel OpenAI
        const rawMarkdown = await complete({
            system: systemPrompt,
            user: userPrompt,
        });
        const markdown = normalizeMarkdown(rawMarkdown);
        // 🔒 Validation stricte
        validateMarkdown(markdown);

        // 📄 Nom de fichier simple (existant chez toi)
        const filename = `capture-${Date.now()}.md`;

        // 📦 Commit GitHub
        await commitFile({
            owner: process.env.GITHUB_OWNER || "simon-sm", // TODO: Configure via env
            repo: process.env.GITHUB_REPO || "obsidian-vault", // TODO: Configure via env
            path: `${projectPath.replace(/\/$/, "")}/${filename}`,
            content: markdown,
            message: `feat(capture): add ${filename}`,
        });

        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                filename,
            }),
        };
    } catch (error: any) {
        console.error("[capture] Error:", error);

        const statusCode =
            error?.name === "ValidationError" ? 400 : 500;

        return {
            statusCode,
            body: JSON.stringify({
                success: false,
                error: error?.message || "Internal server error",
            }),
        };
    }
};
