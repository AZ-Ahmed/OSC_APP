import OpenAI from "openai";
import { SYSTEM_PROMPT_V1 } from "../src/core/prompts/system.js";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
});

async function run() {
    const userInput = `
Le Prophète ﷺ a dit que le dhikr est une protection contre Shaytan.
`;

    const response = await client.chat.completions.create({
        model: "gpt-4o",
        messages: [
            { role: "system", content: SYSTEM_PROMPT_V1 },
            { role: "user", content: userInput },
        ],
        temperature: 0.2,
    });

    console.log("===== RAW OUTPUT =====");
    console.log(response.choices[0].message.content);
}

run().catch(console.error);
