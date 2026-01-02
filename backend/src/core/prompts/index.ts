import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const loadPrompt = (filename: string): string => {
    // Strategies for finding the file:
    // 1. Co-located with this file (e.g. if src is used directly)
    // 2. In src/core/prompts relative to CWD (standard Lambda layout if using dist)

    const candidates = [
        path.join(__dirname, filename),
        path.join(process.cwd(), "src", "core", "prompts", filename),
    ];

    for (const filePath of candidates) {
        if (fs.existsSync(filePath)) {
            try {
                return fs.readFileSync(filePath, "utf-8");
            } catch (error) {
                console.error(`Error reading prompt at ${filePath}:`, error);
            }
        }
    }

    console.error(`Prompt file not found: ${filename}. Searched in:`, candidates);
    return "";
};

export const PROMPTS = {
    default: loadPrompt("default.md"),
    livre: loadPrompt("livre.md"),
    hadith: loadPrompt("hadith.md"),
    action: loadPrompt("action.md"),
} as const;

export type PromptKey = keyof typeof PROMPTS;
