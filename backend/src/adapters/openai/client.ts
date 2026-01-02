import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { NoteSchema } from "../../core/schemas/note.js";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
});

export interface OpenAIPrompt {
    system: string;
    user: string;
    image?: string; // Base64 or URL
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

    // Construct User Message Content
    let userContent: any = prompt.user;

    if (prompt.image) {
        userContent = [
            { type: "text", text: prompt.user },
            {
                type: "image_url",
                image_url: {
                    url: prompt.image.startsWith("data:")
                        ? prompt.image
                        : `data:image/jpeg;base64,${prompt.image}`,
                },
            },
        ];
    }

    const completion = await client.chat.completions.create({
        model: "gpt-4o-2024-08-06",
        messages: [
            { role: "system", content: prompt.system },
            { role: "user", content: userContent },
        ],
        temperature: 0.2,
        response_format: zodResponseFormat(NoteSchema, "note_structure"),
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
        throw new Error("OpenAI returned empty response");
    }

    return content;
}
