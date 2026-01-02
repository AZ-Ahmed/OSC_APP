
import { validateMarkdown, parseFrontmatter, validateTags, validateSource } from '../src/core/validation/index.js';

const validMarkdown = `---
type: concept
source: "[[Livre - Les mérites du dhikr]]"
tags:
  - status/seedling
  - spiritualité
---
# Title
Content
`;

const validMarkdownLegacyTags = `---
type: concept
source: "[[Livre - Les mérites du dhikr]]"
tags: #status/seedling #spiritualité
---
# Title
Content
`;

const validMarkdownInlineTags = `---
type: concept
source: "[[Livre - Les mérites du dhikr]]"
tags: [status/seedling, spiritualité]
---
# Title
Content
`;

try {
    console.log("Testing validMarkdown...");
    validateMarkdown(validMarkdown);
    console.log("PASS");
} catch (e: any) {
    console.error("FAIL", e);
}

try {
    console.log("Testing validMarkdownLegacyTags...");
    validateMarkdown(validMarkdownLegacyTags);
    console.log("PASS");
} catch (e: any) {
    console.error("FAIL", e);
}

try {
    console.log("Testing validMarkdownInlineTags...");
    validateMarkdown(validMarkdownInlineTags);
    console.log("PASS");
} catch (e: any) {
    console.error("FAIL", e);
}

// Test specific problematic cases
try {
    console.log("Testing tag validation only...");
    validateTags(['status/seedling', 'spiritualité']);
    console.log("PASS list");
    validateTags('#status/seedling #spiritualité');
    console.log("PASS string with hash");
    validateTags('status/seedling, spiritualité');
    console.log("PASS string with comma");
} catch (e: any) {
    console.error("FAIL tags", e);
}

try {
    console.log("Testing source validation...");
    validateSource("[[Livre - Les mérites du dhikr]]");
    console.log("PASS unquoted (parsed value)");
} catch (e: any) {
    console.error("FAIL source", e);
}
