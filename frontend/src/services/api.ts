import { CaptureRequest, CaptureResponse } from '../types/capture';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
    throw new Error('VITE_API_BASE_URL is not defined');
}

export const api = {
    capture: async (request: CaptureRequest): Promise<CaptureResponse> => {
        // Validation côté frontend (rapide, UX)
        if (!request.text.trim() && !request.image) {
            throw new Error('Content cannot be empty');
        }

        const response = await fetch(`${API_BASE_URL}/capture`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: request.text,
                image: request.image ?? null,
                projectPath: request.projectPath,
            }),
        });

        const data = await response.json();

        if (!response.ok || data.status !== 'success') {
            console.error('Capture API interaction failed:', { status: response.status, data });
            // Fallback to data.error if data.message is missing (legacy backend support)
            throw new Error(data.message || data.error || `Capture failed with status: ${response.status}`);
        }

        // Return the actual response from the backend
        return {
            id: data.id,
            status: 'success',
            obsidianFile: data.obsidianFile,
            markdown: data.markdown,
            message: 'Capture processed successfully',
        };
    },
};
