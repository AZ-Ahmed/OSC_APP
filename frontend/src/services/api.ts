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

        if (!response.ok || data.success !== true) {
            throw new Error(data.error || 'Capture failed');
        }

        // Adaptation backend → frontend response shape
        return {
            id: crypto.randomUUID(), // backend n’envoie pas d’id → on en génère un
            status: 'success',
            obsidianFile: data.filename,
            message: 'Capture processed successfully',
        };
    },
};
