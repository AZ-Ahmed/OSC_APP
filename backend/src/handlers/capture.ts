import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { complete } from "../adapters/openai/client.js";
import { randomUUID } from "node:crypto";
import { PROMPTS, type PromptKey } from "../core/prompts/index.js";
import { validateMarkdown } from "../core/validation/index.js";
import { commitFile } from "../adapters/github/client.js";
import { normalizeMarkdown } from "../core/transform/normalizeMarkdown.js";
import { extractTitle, generateFilename } from "../core/transform/index.js";

const CORS_ORIGIN = process.env.CORS_ORIGIN || "";

const corsHeaders = {
    "Access-Control-Allow-Origin": CORS_ORIGIN,
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "OPTIONS,POST",
};

export const handler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    try {
        /* ============================
           CORS PREFLIGHT (OBLIGATOIRE)
           ============================ */
        if (event.httpMethod === "OPTIONS") {
            return {
                statusCode: 204,
                headers: corsHeaders,
                body: "",
            };
        }

        if (!event.body) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({
                    id: randomUUID(),
                    status: "error",
                    message: "Missing request body",
                }),
            };
        }

        const body = JSON.parse(event.body);

        const text: string = body.text ?? "";
        const projectPath: string = body.projectPath;
        const promptKey = (body.prompt as PromptKey) || "default";

        if (!projectPath || typeof projectPath !== "string") {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({
                    id: randomUUID(),
                    status: "error",
                    message: "Missing or invalid projectPath",
                }),
            };
        }

        // Validate Environment Variables
        const requiredEnvVars = ['GITHUB_OWNER', 'GITHUB_REPO', 'GITHUB_TOKEN', 'OPENAI_API_KEY'];
        const missingVars = requiredEnvVars.filter(name => !process.env[name]);

        if (missingVars.length > 0) {
            console.error("Missing environment variables:", missingVars);
            return {
                statusCode: 500,
                headers: corsHeaders,
                body: JSON.stringify({
                    id: randomUUID(),
                    status: "error",
                    message: `Server Configuration Error: Missing env vars: ${missingVars.join(", ")}`,
                }),
            };
        }

        /* ============================
           PROMPTS
           ============================ */

        const systemPrompt = PROMPTS[promptKey] ?? PROMPTS.default;

        const userPrompt = `
User raw input:
${text || "(no text provided)"}
`;

        /* ============================
           OPENAI
           ============================ */

        const rawMarkdown = await complete({
            system: systemPrompt,
            user: userPrompt,
        });

        const markdown = normalizeMarkdown(rawMarkdown);

        /* ============================
           VALIDATION
           ============================ */

        validateMarkdown(markdown);

        /* ============================
           GITHUB COMMIT
           ============================ */

        const title = extractTitle(markdown);
        const filename = generateFilename(title, new Date());

        try {
            await commitFile({
                owner: process.env.GITHUB_OWNER!,
                repo: process.env.GITHUB_REPO!,
                path: `10-Inbox/${filename}`,
                content: markdown,
                message: `feat(capture): add ${filename}`,
            });
        } catch (commitError: any) {
            console.error("GitHub Login/Commit Error:", commitError);
            throw new Error(`GitHub Commit Failed: ${commitError.message || "Unknown error"}`);
        }

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                id: randomUUID(),
                status: "success",
                obsidianFile: filename,
                markdown,
            }),
        };
    } catch (error: any) {
        console.error("[capture] Error:", error);

        const statusCode =
            error?.name === "ValidationError" ? 400 : 500;

        return {
            statusCode,
            headers: corsHeaders,
            body: JSON.stringify({
                id: randomUUID(),
                status: "error",
                message: error?.message || "Internal server error",
                stack: error?.stack,
                errorName: error?.name,
            }),
        };
    }
};
