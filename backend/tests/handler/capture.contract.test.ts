import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from '../../src/handlers/capture';
import * as OpenAIClient from '../../src/adapters/openai/client';
import * as GitHubClient from '../../src/adapters/github/client';
import * as Validation from '../../src/core/validation/index';
import * as Transform from '../../src/core/transform/index';
// Mock environment variables
const ENV_BACKUP = process.env;

describe('Handler: Capture (Contract)', () => {
    // Mocks
    const mockOpenAI = vi.spyOn(OpenAIClient, 'complete');
    const mockGitHub = vi.spyOn(GitHubClient, 'commitFile');
    const mockValidation = vi.spyOn(Validation, 'validateMarkdown');
    const mockTransform = vi.spyOn(Transform, 'transformCapture');

    beforeEach(() => {
        vi.clearAllMocks();
        process.env = { ...ENV_BACKUP, NOTES_PATH: 'notes', GITHUB_OWNER: 'test-owner', GITHUB_REPO: 'test-repo' };
    });

    afterEach(() => {
        process.env = ENV_BACKUP;
    });

    const createEvent = (body: object | string | null): APIGatewayProxyEvent => ({
        body: typeof body === 'string' ? body : JSON.stringify(body),
    } as APIGatewayProxyEvent);

    it('should return 200 OK on successful capture', async () => {
        // Setup Mocks
        const aiResponse = '--- \ntype: concept\n---\n# Title';
        const markdown = '--- \ntype: concept\n---\n# Title';
        const filename = '2026-01-01-title.md';

        mockOpenAI.mockResolvedValue(aiResponse);
        mockValidation.mockReturnValue(undefined); // void success
        mockTransform.mockReturnValue({ markdown, filename });
        mockGitHub.mockResolvedValue({ commitUrl: 'http://github.com/commit', sha: 'sha123' });

        // Execute
        const event = createEvent({
            text: 'My note',
            projectPath: 'obsidian-vault',
        });
        const result = await handler(event);

        // Assertions
        expect(result.statusCode).toBe(200);
        const body = JSON.parse(result.body);
        expect(body.success).toBe(true);
        expect(body.filename).toBe(filename);

        // Call Order
        expect(mockOpenAI).toHaveBeenCalledWith(expect.objectContaining({
            userText: 'My note',
        }));
        expect(mockValidation).toHaveBeenCalledWith(aiResponse);
        expect(mockTransform).toHaveBeenCalledWith(expect.objectContaining({
            aiResponse,
            text: 'My note'
        }));
        expect(mockGitHub).toHaveBeenCalledWith(expect.objectContaining({
            path: 'notes/2026-01-01-title.md',
            content: markdown
        }));
    });

    it('should return 400 Bad Request on missing projectPath', async () => {
        const event = createEvent({
            text: 'My note',
            // Missing projectPath
        });
        const result = await handler(event);

        expect(result.statusCode).toBe(400);
        expect(JSON.parse(result.body).error).toContain('Missing or empty "projectPath"');
        expect(mockOpenAI).not.toHaveBeenCalled();
    });

    it('should return 400 Bad Request if validation fails', async () => {
        mockOpenAI.mockResolvedValue('Invalid Markdown');
        mockValidation.mockImplementation(() => {
            throw new Validation.ValidationError('Invalid YAML');
        });

        const event = createEvent({
            text: 'My note',
            projectPath: 'obsidian-vault',
        });
        const result = await handler(event);

        expect(result.statusCode).toBe(400);
        expect(JSON.parse(result.body).error).toBe('Invalid YAML');
        expect(mockGitHub).not.toHaveBeenCalled();
    });

    it('should return 500 Internal Server Error if OpenAI fails', async () => {
        mockOpenAI.mockRejectedValue(new Error('OpenAI Down'));

        const event = createEvent({
            text: 'My note',
            projectPath: 'obsidian-vault',
        });
        const result = await handler(event);

        expect(result.statusCode).toBe(500);
        expect(JSON.parse(result.body).error).toBe('Internal server error');
        expect(mockGitHub).not.toHaveBeenCalled();
    });

    it('should return 500 Internal Server Error if GitHub fails', async () => {
        mockOpenAI.mockResolvedValue('Valid Content');
        mockValidation.mockReturnValue(undefined);
        mockTransform.mockReturnValue({ markdown: 'Content', filename: 'file.md' });

        mockGitHub.mockRejectedValue(new Error('GitHub Down'));

        const event = createEvent({
            text: 'My note',
            projectPath: 'obsidian-vault',
        });
        const result = await handler(event);

        expect(result.statusCode).toBe(500);
        expect(JSON.parse(result.body).error).toBe('Internal server error');
    });
});
