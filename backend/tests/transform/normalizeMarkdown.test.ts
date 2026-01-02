import { describe, it, expect } from "vitest";
import { normalizeMarkdown } from "../../src/core/transform/normalizeMarkdown.js";

describe("normalizeMarkdown", () => {
    it("supprime les fences ```markdown", () => {
        const raw = `
\`\`\`markdown
---
type: concept
---
# Test
\`\`\`
`;

        const result = normalizeMarkdown(raw);

        expect(result.startsWith("---")).toBe(true);
        expect(result.includes("```")).toBe(false);
    });

    it("laisse intact un markdown déjà propre", () => {
        const raw = `
---
type: concept
---
# Test
`;

        const result = normalizeMarkdown(raw);

        expect(result).toContain("---");
        expect(result).toContain("# Test");
    });
});
