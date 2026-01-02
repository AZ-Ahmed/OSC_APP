/**
 * ============================================================
 * CORE: VALIDATION — STRICT MARKDOWN VALIDATION
 * ============================================================
 *
 * SINGLE RESPONSIBILITY:
 *   Validate that Markdown output conforms to OSC spec
 *
 * CHECKS:
 *   - YAML frontmatter is syntactically valid
 *   - All tags are in the whitelist
 *   - Required frontmatter fields are present
 *
 * ✅ BEHAVIOR:
 *   - Valid → return void (no-op)
 *   - Invalid → throw Error with clear message
 *
 * ❌ FORBIDDEN:
 *   - Silent corrections (fail fast, no auto-fixing)
 *   - HTTP calls
 *   - Side effects
 *   - OpenAI or GitHub imports
 *
 * ============================================================
 */

// ============================================================
// TAG WHITELIST (from SYSTEM_PROMPT_V1)
// ============================================================

/**
 * Allowed status tags
 */
const STATUS_TAGS = ['#status/seedling'] as const;

/**
 * Allowed type values (not tags, just YAML field values)
 */
const ALLOWED_TYPES = ['concept', 'action', 'hadith'] as const;

/**
 * Allowed thematic tags
 */
const THEMATIC_TAGS = [
    '#spiritualité',
    '#cœur',
    '#fiqh',
    '#comportement',
] as const;

/**
 * Complete tag whitelist (all tags that can appear in `tags` field)
 */
export const TAG_WHITELIST: readonly string[] = [
    ...STATUS_TAGS,
    ...THEMATIC_TAGS,
] as const;

/**
 * Required frontmatter fields (per system prompt spec)
 */
export const REQUIRED_FIELDS = ['type', 'source', 'tags'] as const;

// ============================================================
// CUSTOM ERROR CLASS
// ============================================================

export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}

// ============================================================
// YAML EXTRACTION
// ============================================================

/**
 * Extract YAML frontmatter from markdown content
 *
 * @param markdown - Full markdown content
 * @returns Raw YAML string (without delimiters)
 * @throws ValidationError if frontmatter is missing or malformed
 */
export function extractFrontmatter(markdown: string): string {
    // Match YAML frontmatter: starts with ---, ends with ---
    const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---/;
    const match = markdown.match(frontmatterRegex);

    if (!match || !match[1]) {
        throw new ValidationError(
            'Missing YAML frontmatter: Document must start with --- delimiters'
        );
    }

    return match[1];
}

/**
 * Parse YAML frontmatter into key-value pairs
 *
 * Simple parser for flat YAML (no nested objects).
 * Supports: string values, arrays (inline or multiline)
 *
 * @param yaml - Raw YAML string
 * @returns Parsed frontmatter object
 * @throws ValidationError on malformed YAML
 */
export function parseFrontmatter(yaml: string): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    const lines = yaml.split(/\r?\n/);

    let currentKey: string | null = null;
    let currentArray: string[] | null = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineNum = i + 1;

        // Skip empty lines
        if (line.trim() === '') continue;

        // Check for array item (starts with -)
        const arrayItemMatch = line.match(/^\s+-\s*(.*)$/);
        if (arrayItemMatch) {
            if (!currentKey || !currentArray) {
                throw new ValidationError(
                    `Invalid YAML at line ${lineNum}: Array item without parent key`
                );
            }
            currentArray.push(arrayItemMatch[1].trim());
            continue;
        }

        // Check for key: value pair
        const keyValueMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*(.*)$/);
        if (keyValueMatch) {
            // Save previous array if any
            if (currentKey && currentArray) {
                result[currentKey] = currentArray;
            }

            currentKey = keyValueMatch[1];
            const value = keyValueMatch[2].trim();

            // Check if value is an inline array (not used in our spec but support it)
            // EXCEPTION: Wikilinks [[...]] are strings, not arrays
            if (value.startsWith('[') && value.endsWith(']') && !value.startsWith('[[')) {
                result[currentKey] = value
                    .slice(1, -1)
                    .split(',')
                    .map((s) => {
                        const trimmed = s.trim();
                        // Strip quotes if present
                        if (
                            (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
                            (trimmed.startsWith("'") && trimmed.endsWith("'"))
                        ) {
                            return trimmed.slice(1, -1);
                        }
                        return trimmed;
                    });
                currentArray = null;
            } else if (value === '') {
                // Empty value means multiline array follows
                currentArray = [];
            } else {
                // Simple string value
                result[currentKey] = value;
                currentArray = null;
            }
            continue;
        }

        // Line doesn't match expected patterns
        throw new ValidationError(
            `Invalid YAML syntax at line ${lineNum}: "${line}"`
        );
    }

    // Save last array if any
    if (currentKey && currentArray) {
        result[currentKey] = currentArray;
    }

    return result;
}

// ============================================================
// VALIDATION FUNCTIONS
// ============================================================

/**
 * Validate required frontmatter fields are present
 *
 * @param frontmatter - Parsed YAML object
 * @throws ValidationError if required field is missing
 */
export function validateRequiredFields(
    frontmatter: Record<string, unknown>
): void {
    for (const field of REQUIRED_FIELDS) {
        if (!(field in frontmatter) || frontmatter[field] === undefined) {
            throw new ValidationError(`Missing required field: ${field}`);
        }
    }
}

/**
 * Validate the `type` field value
 *
 * @param type - The type value from frontmatter
 * @throws ValidationError if type is not in allowed list
 */
export function validateType(type: unknown): void {
    if (typeof type !== 'string') {
        throw new ValidationError(
            `Invalid type: expected string, got ${typeof type}`
        );
    }

    if (!ALLOWED_TYPES.includes(type as typeof ALLOWED_TYPES[number])) {
        throw new ValidationError(
            `Invalid type "${type}". Allowed: ${ALLOWED_TYPES.join(', ')}`
        );
    }
}

/**
 * Validate that all tags are in the whitelist
 *
 * @param tags - Tags from frontmatter (can be string or array)
 * @throws ValidationError if any tag is not whitelisted
 */
export function validateTags(tags: unknown): void {
    // Normalize tags to array
    let tagArray: string[];

    if (typeof tags === 'string') {
        // Parse space-separated tags (e.g., "#status/seedling #spiritualité")
        tagArray = tags.split(/\s+/).filter((t) => t.startsWith('#'));
    } else if (Array.isArray(tags)) {
        tagArray = tags.map((t) => String(t).trim());
    } else {
        throw new ValidationError(
            `Invalid tags: expected string or array, got ${typeof tags}`
        );
    }

    // Check each tag against whitelist
    const invalidTags: string[] = [];

    for (const tag of tagArray) {
        if (!TAG_WHITELIST.includes(tag)) {
            invalidTags.push(tag);
        }
    }

    if (invalidTags.length > 0) {
        throw new ValidationError(
            `Invalid tags: ${invalidTags.join(', ')}. ` +
            `Allowed: ${TAG_WHITELIST.join(', ')}`
        );
    }

    // Must have at least one status tag
    const hasStatus = tagArray.some((t) =>
        STATUS_TAGS.includes(t as typeof STATUS_TAGS[number])
    );
    if (!hasStatus) {
        throw new ValidationError(
            `Missing required status tag. Must include one of: ${STATUS_TAGS.join(', ')}`
        );
    }
}

/**
 * Validate the `source` field value
 *
 * Must be a wikilink to the source book.
 *
 * @param source - The source value from frontmatter
 * @throws ValidationError if source is not a valid wikilink
 */
export function validateSource(source: unknown): void {
    if (typeof source !== 'string') {
        throw new ValidationError(
            `Invalid source: expected string, got ${typeof source}`
        );
    }

    // Must be a wikilink: [[...]]
    if (!source.startsWith('[[') || !source.endsWith(']]')) {
        throw new ValidationError(
            `Invalid source format: must be a wikilink like [[Livre - Les mérites du dhikr]]`
        );
    }
}

// ============================================================
// MAIN VALIDATION PIPELINE
// ============================================================

/**
 * Full validation pipeline
 *
 * Fail-fast: throws on first validation failure.
 * No silent fixes, no auto-corrections.
 *
 * @param markdown - Complete markdown content
 * @throws ValidationError on first validation failure
 */
export function validateMarkdown(markdown: string): void {
    // 1. Extract and parse frontmatter
    const yamlRaw = extractFrontmatter(markdown);
    const frontmatter = parseFrontmatter(yamlRaw);

    // 2. Validate required fields exist
    validateRequiredFields(frontmatter);

    // 3. Validate individual field values
    validateType(frontmatter.type);
    validateSource(frontmatter.source);
    validateTags(frontmatter.tags);
}
