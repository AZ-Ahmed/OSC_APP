import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { complete } from "../adapters/openai/client.js";
import { randomUUID } from "node:crypto";
import { SYSTEM_PROMPT_V1 as SYSTEM_PROMPT } from "../core/prompts/system.js";
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

        /* ============================
           PROMPTS
           ============================ */

        const systemPrompt = SYSTEM_PROMPT;

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

        await commitFile({
            owner: process.env.GITHUB_OWNER!,
            repo: process.env.GITHUB_REPO!,
            path: `10-Inbox/${filename}`,
            content: markdown,
            message: `feat(capture): add ${filename}`,
        });

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
