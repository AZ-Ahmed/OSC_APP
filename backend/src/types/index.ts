/**
 * ============================================================
 * BACKEND TYPES — STRICT CONTRACTS
 * ============================================================
 *
 * ✅ Rules:
 *   - No `any` type allowed
 *   - No optional fields without explicit `?`
 *   - No logic, only type definitions
 *   - Every field must have a clear purpose
 *
 * ============================================================
 */

/**
 * Input from the PWA capture form
 */
export interface CaptureRequest {
    /** Raw text content from textarea (optional if image provided) */
    text?: string;

    /** Base64-encoded image for OCR (optional if text provided) */
    imageBase64?: string;

    /** Target path in the Obsidian vault (required) */
    projectPath: string;
}

/**
 * Response returned to the PWA
 */
export interface CaptureResponse {
    /** Whether the capture was successfully committed */
    success: boolean;

    /** Generated filename (only if success=true) */
    filename?: string;

    /** Error message (only if success=false) */
    error?: string;
}
