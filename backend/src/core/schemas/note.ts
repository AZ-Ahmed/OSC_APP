import { z } from "zod";

export const NoteSchema = z.object({
    frontmatter: z.object({
        type: z.enum(["concept", "action", "hadith"]),
        status: z.literal("seedling"),
        source: z.string().describe("Obsidian wikilink source, e.g. [[Livre - Les mérites du dhikr]]"),
        tags: z.array(z.string()).max(2).describe("Thematic tags (max 2)"),
    }),
    title: z.string().describe("The conceptual title of the note"),

    // FLEXIBLE SECTIONS ARRAY
    sections: z.array(
        z.object({
            heading: z.string().describe("Section heading (e.g. 'Idée centrale', 'Dalil')"),
            content: z.string().describe("Section content in Markdown"),
        })
    ).min(2).describe("The body of the note, split into logical sections")
});

export type NoteStructure = z.infer<typeof NoteSchema>;
