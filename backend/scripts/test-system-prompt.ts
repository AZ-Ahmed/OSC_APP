import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { SYSTEM_PROMPT_V1 } from "../src/core/prompts/system.js";
import { NoteSchema } from "../src/core/schemas/note.js";
import { transformCapture } from "../src/core/transform/index.js";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
});

async function run() {
    const userInput = `
Le Prophète ﷺ a dit que le dhikr est une protection contre Shaytan.
`;

    console.log("🚀 Sending request to OpenAI...");

    const response = await client.chat.completions.create({
        model: "gpt-4o-2024-08-06",
        messages: [
            { role: "system", content: SYSTEM_PROMPT_V1 },
            { role: "user", content: userInput },
        ],
        temperature: 0.2,
        response_format: zodResponseFormat(NoteSchema, "note_structure"),
    });

    const jsonContent = response.choices[0].message.content;

    if (!jsonContent) {
        console.error("❌ No content returned");
        return;
    }

    console.log("✅ OpenAPI JSON Received:");
    console.log(jsonContent);

    console.log("\n🔄 Transforming to Markdown...");
    const { markdown, filename } = transformCapture({
        aiResponse: jsonContent
    });

    console.log(`\n📄 Generated File: ${filename}`);
    console.log("=========================================");
    console.log(markdown);
    console.log("=========================================");
}

run().catch(console.error);
