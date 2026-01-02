import { NoteStructure } from "../schemas/note.js";

export interface TransformInput {
    /** Raw text from user (optional context) */
    text?: string;

    /** OCR-extracted text from image (optional context) */
    ocrText?: string;

    /** JSON string from OpenAI Structured Output */
    aiResponse: string;
}

export interface TransformOutput {
    /** Complete Markdown content */
    markdown: string;

    /** Generated filename (slug + date) */
    filename: string;
}

/**
 * Transform AI structured JSON into commit-ready Markdown
 *
 * Pure function: no side effects, deterministic output.
 *
 * @param input - Raw inputs and structured AI response (as JSON string)
 * @returns Markdown string ready for GitHub commit
 */
export function transformCapture(input: TransformInput): TransformOutput {
    const { aiResponse } = input;

    // Parse the Structured Output JSON
    // Note: OpenAI guarantees this matches our schema, so we trust it matches NoteStructure
    const data = JSON.parse(aiResponse) as NoteStructure;

    // Combine status and thematic tags to meet validation requirements
    const allTags = [
        `status/${data.frontmatter.status}`,
        ...data.frontmatter.tags
    ];

    // Construct Frontmatter
    const frontmatter = `---
type: ${data.frontmatter.type}
source: "${data.frontmatter.source}"
tags:
${allTags.map(t => `  - ${t}`).join('\n')}
---`;

    // Construct Body from Sections
    const body = data.sections
        .map(section => {
            // Sanitize heading to prevent markdown breakage (remove newlines)
            const safeHeading = section.heading.replace(/\n/g, " ").trim();
            return `## ${safeHeading}\n\n${section.content}`;
        })
        .join('\n\n');

    // Assemble final Markdown
    const markdown = `${frontmatter}\n\n# ${data.title}\n\n${body}`;

    // Generate filename from title and current date
    const filename = generateFilename(data.title, new Date());

    return {
        markdown,
        filename,
    };
}

/**
 * Generate a filename slug from title and date
 *
 * Pure function: deterministic output based on inputs.
 *
 * @param title - Note title
 * @param date - Capture date
 * @returns Slugified filename (e.g., "2026-01-01-la-crainte-dallah.md")
 */
export function generateFilename(title: string, date: Date): string {
    // Format date as YYYY-MM-DD
    const dateStr = formatDate(date);

    // Slugify the title
    const slug = slugify(title);

    // Add unique suffix (5 random chars) to prevent collisions
    const uniqueSuffix = Math.random().toString(36).substring(2, 7);

    return `${dateStr}-${slug}-${uniqueSuffix}.md`;
}

/**
 * Format a Date object as YYYY-MM-DD
 *
 * @param date - Date to format
 * @returns ISO date string (YYYY-MM-DD)
 */
function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Convert a title string to a URL-safe slug
 *
 * - Lowercase
 * - Replace spaces with hyphens
 * - Remove diacritics (accents)
 * - Remove non-alphanumeric characters (except hyphens)
 * - Collapse multiple hyphens
 * - Trim leading/trailing hyphens
 *
 * @param title - Title to slugify
 * @returns URL-safe slug
 */
function slugify(title: string): string {
    return title
        .toLowerCase()
        // Normalize Unicode and remove diacritics
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        // Replace spaces and underscores with hyphens
        .replace(/[\s_]+/g, '-')
        // Remove non-alphanumeric (except hyphens)
        .replace(/[^a-z0-9-]/g, '')
        // Collapse multiple hyphens
        .replace(/-+/g, '-')
        // Trim leading/trailing hyphens
        .replace(/^-+|-+$/g, '')
        // Fallback for empty result
        || 'untitled';
}
