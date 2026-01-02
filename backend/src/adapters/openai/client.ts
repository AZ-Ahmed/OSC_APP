import OpenAI from "openai";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
});

export interface OpenAIPrompt {
    system: string;
    user: string;
}

export async function complete(prompt: OpenAIPrompt): Promise<string> {
    // 🛑 Garde défensive explicite
    if (
        typeof prompt.system !== "string" ||
        prompt.system.trim() === "" ||
        typeof prompt.user !== "string" ||
        prompt.user.trim() === ""
    ) {
        throw new Error(
            "Invalid OpenAI prompt: system or user content is empty"
        );
    }

    const response = await client.chat.completions.create({
        model: "gpt-4o",
        messages: [
            { role: "system", content: prompt.system },
            { role: "user", content: prompt.user },
        ],
        temperature: 0.2,
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
        throw new Error("OpenAI returned empty response");
    }

    return content;
}
