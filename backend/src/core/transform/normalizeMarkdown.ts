/**
 * Normalise la sortie brute d’un LLM en Markdown exploitable.
 * - Supprime les fences ```markdown / ``` si présentes
 * - Ne modifie PAS le contenu interne
 */
export function normalizeMarkdown(raw: string): string {
    let content = raw.trim();

    // Cas : ```markdown ... ``` ou ``` ... ```
    if (content.startsWith("```")) {
        content = content
            // supprime ```markdown ou ```lang
            .replace(/^```[a-zA-Z]*\n?/, "")
            // supprime ``` final
            .replace(/\n?```$/, "")
            .trim();
    }

    return content;
}
