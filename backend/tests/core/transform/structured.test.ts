import { describe, it } from 'node:test';
import assert from 'node:assert';
import { transformCapture } from '../../../src/core/transform/index.js';

describe('transformCapture (Structured Output)', () => {
    it('should transform valid JSON into correct Markdown', () => {
        const mockAiResponse = JSON.stringify({
            frontmatter: {
                type: 'concept',
                status: 'seedling',
                source: '[[Livre - Les mérites du dhikr]]',
                tags: ['spiritualité']
            },
            title: 'La définition du Dhikr',
            sections: [
                {
                    heading: 'Idée centrale',
                    content: 'Le dhikr est le rappel constant.'
                },
                {
                    heading: 'Preuve',
                    content: '> "Souvenez-vous de Moi, Je me souviendrai de vous."'
                }
            ]
        });

        const { markdown, filename } = transformCapture({
            aiResponse: mockAiResponse
        });

        // Check Frontmatter
        assert.ok(markdown.includes('type: concept'));
        assert.ok(markdown.includes('source: "[[Livre - Les mérites du dhikr]]"'));
        assert.ok(markdown.includes('- status/seedling'));
        assert.ok(markdown.includes('- spiritualité'));

        // Check Title
        assert.ok(markdown.includes('# La définition du Dhikr'));

        // Check Sections
        assert.ok(markdown.includes('## Idée centrale'));
        assert.ok(markdown.includes('Le dhikr est le rappel constant.'));
        assert.ok(markdown.includes('## Preuve'));
        assert.ok(markdown.includes('> "Souvenez-vous de Moi, Je me souviendrai de vous."'));

        // Check Filename (regex match equivalent)
        const filenameRegex = /\d{4}-\d{2}-\d{2}-la-definition-du-dhikr-[a-z0-9]+\.md/;
        assert.match(filename, filenameRegex);
    });

    it('should sanitize section headings', () => {
        const mockAiResponse = JSON.stringify({
            frontmatter: {
                type: 'action',
                status: 'seedling',
                source: '[[Livre - Les mérites du dhikr]]',
                tags: []
            },
            title: 'Test',
            sections: [
                {
                    heading: 'Bad \n Heading',
                    content: 'Content'
                }
            ]
        });

        const { markdown } = transformCapture({
            aiResponse: mockAiResponse
        });

        assert.ok(markdown.includes('## Bad   Heading')); // Newline replaced by space
        assert.ok(!markdown.includes('Bad \n Heading'));
    });
});
