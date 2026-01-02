import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateMarkdown, ValidationError } from '../../src/core/validation';

// ESM Polyfills for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FIXTURES_DIR = path.join(__dirname, 'fixtures');

function loadFixture(filename: string): string {
    return fs.readFileSync(path.join(FIXTURES_DIR, filename), 'utf-8');
}

describe('Markdown Validation', () => {
    it('should pass for valid markdown', () => {
        const markdown = loadFixture('valid.md');
        expect(() => validateMarkdown(markdown)).not.toThrow();
    });

    it('should throw ValidationError if frontmatter is missing', () => {
        const markdown = loadFixture('invalid-no-frontmatter.md');
        expect(() => validateMarkdown(markdown)).toThrow(ValidationError);
        expect(() => validateMarkdown(markdown)).toThrow(/Missing YAML frontmatter/);
    });

    it('should throw ValidationError if YAML is malformed', () => {
        const markdown = loadFixture('invalid-malformed.md');
        expect(() => validateMarkdown(markdown)).toThrow(ValidationError);
    });

    it('should throw ValidationError if required field is missing', () => {
        const markdown = loadFixture('invalid-missing-field.md');
        expect(() => validateMarkdown(markdown)).toThrow(ValidationError);
        expect(() => validateMarkdown(markdown)).toThrow(/Missing required field/);
    });

    it('should throw ValidationError if type is invalid', () => {
        const markdown = loadFixture('invalid-bad-type.md');
        expect(() => validateMarkdown(markdown)).toThrow(ValidationError);
        expect(() => validateMarkdown(markdown)).toThrow(/Invalid type/);
    });

    it('should throw ValidationError if source is not a wikilink', () => {
        const markdown = loadFixture('invalid-bad-source.md');
        expect(() => validateMarkdown(markdown)).toThrow(ValidationError);
        expect(() => validateMarkdown(markdown)).toThrow(/Invalid source format/);
    });

    it('should throw ValidationError if tag is not in whitelist', () => {
        const markdown = loadFixture('invalid-bad-tag-value.md');
        expect(() => validateMarkdown(markdown)).toThrow(ValidationError);
        expect(() => validateMarkdown(markdown)).toThrow(/Invalid tags/);
    });

    it('should throw ValidationError if status tag is missing', () => {
        const markdown = loadFixture('invalid-missing-status.md');
        expect(() => validateMarkdown(markdown)).toThrow(ValidationError);
        expect(() => validateMarkdown(markdown)).toThrow(/Missing required status tag/);
    });
});
