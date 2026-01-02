/**
 * ============================================================
 * CORE: TRANSFORM — PURE MARKDOWN GENERATION
 * ============================================================
 *
 * SINGLE RESPONSIBILITY:
 *   Transform raw capture → Valid Markdown string
 *
 * INPUT:
 *   - Raw text content
 *   - OCR result from image (if any)
 *   - AI-structured markdown from OpenAI
 *
 * OUTPUT:
 *   - string: 100% ready-to-commit Markdown
 *   - filename: Slugified filename for GitHub
 *
 * ✅ ALLOWED:
 *   - String manipulation
 *   - Pure function composition
 *
 * ❌ FORBIDDEN:
 *   - HTTP calls
 *   - GitHub operations
 *   - console.log / side effects
 *   - Adapter imports
 *   - Validation logic (handled elsewhere)
 *
 * ============================================================
 */

export interface TransformInput {
    /** Raw text from user (optional context) */
    text?: string;

    /** OCR-extracted text from image (optional context) */
    ocrText?: string;

    /** AI-structured Markdown content from OpenAI */
    aiResponse: string;
}

export interface TransformOutput {
    /** Complete Markdown content (as-is from AI) */
    markdown: string;

    /** Generated filename (slug + date) */
    filename: string;
}

/**
 * Transform AI response into commit-ready Markdown
 *
 * Pure function: no side effects, deterministic output.
 *
 * @param input - Raw inputs and AI response
 * @returns Markdown string ready for GitHub commit
 *
 * @example
 * const result = transformCapture({
 *   aiResponse: "---\ntype: concept\n---\n# La crainte d'Allah..."
 * });
 * // { markdown: "---\ntype: concept...", filename: "2026-01-01-la-crainte-dallah.md" }
 */
export function transformCapture(input: TransformInput): TransformOutput {
    const { aiResponse } = input;

    // Extract title from markdown (first H1 heading)
    const title = extractTitle(aiResponse);

    // Generate filename from title and current date
    const filename = generateFilename(title, new Date());

    return {
        markdown: aiResponse,
        filename,
    };
}

/**
 * Extract the title from Markdown content
 *
 * Looks for the first H1 heading (# Title) in the content.
 * Falls back to "untitled" if no heading found.
 *
 * @param markdown - Raw markdown content
 * @returns Extracted title string
 */
export function extractTitle(markdown: string): string {
    // Match first H1 heading: # Title
    const h1Match = markdown.match(/^#\s+(.+)$/m);

    if (h1Match && h1Match[1]) {
        return h1Match[1].trim();
    }

    return 'untitled';
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
