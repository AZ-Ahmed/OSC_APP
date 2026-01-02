export type CaptureType = 'text' | 'image' | 'audio';

export interface CapturePayload {
    text: string;
    image?: File | null;
    projectPath?: string;
}

export interface CaptureRequest {
    text: string;
    image?: string; // Base64 encoding
    projectPath?: string;
    timestamp: string;
}

export interface CaptureResponse {
    id: string;
    status: 'success' | 'error';
    obsidianFile?: string;
    message?: string;
    markdown?: string;
}
