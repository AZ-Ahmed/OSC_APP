import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import {
    transformCapture,
    extractTitle,
    generateFilename,
} from '../../src/core/transform';

describe('Core: Transform (Pure Logic)', () => {
    describe('transformCapture', () => {
        it('should return markdown unchanged (identity function)', () => {
            const inputMarkdown = `---
type: concept
---
# Test Note
Content`;

            const result = transformCapture({
                aiResponse: inputMarkdown,
            });

            expect(result.markdown).toBe(inputMarkdown);
        });

        it('should generate correct filename inside the result', () => {
            // Mock Date to ensure deterministic filename
            vi.useFakeTimers();
            const date = new Date('2026-01-01T12:00:00Z');
            vi.setSystemTime(date);

            const result = transformCapture({
                aiResponse: '# My Note Title\nContent',
            });

            expect(result.filename).toBe('2026-01-01-my-note-title.md');

            vi.useRealTimers();
        });
    });

    describe('extractTitle', () => {
        it('should extract first H1 heading', () => {
            const markdown = `
Some intro text
# My Great Title
## Subheading
            `;
            expect(extractTitle(markdown)).toBe('My Great Title');
        });

        it('should return "untitled" if no H1 found', () => {
            const markdown = '## Subheading\nJust text';
            expect(extractTitle(markdown)).toBe('untitled');
        });

        it('should ignore H2 or other headings', () => {
            const markdown = '## Not a Title\n### Also not';
            expect(extractTitle(markdown)).toBe('untitled');
        });
    });

    describe('generateFilename', () => {
        it('should format date and slugify title', () => {
            const date = new Date('2026-01-05');
            const title = 'L\'esprit & La Matière';
            // Expected: 2026-01-05-lesprit-la-matiere.md
            expect(generateFilename(title, date)).toBe('2026-01-05-lesprit-la-matiere.md');
        });

        it('should handle special characters and accents', () => {
            const date = new Date('2026-01-01');
            const title = 'Crème Brûlée & Çava ?';
            expect(generateFilename(title, date)).toBe('2026-01-01-creme-brulee-cava.md');
        });

        it('should collapse multiple dashes', () => {
            const date = new Date('2026-01-01');
            const title = 'Note   with   spaces';
            expect(generateFilename(title, date)).toBe('2026-01-01-note-with-spaces.md');
        });
    });
});
