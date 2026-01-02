import { useState, useCallback } from 'react';
import { api } from '../services/api';
import { CapturePayload, CaptureRequest, CaptureResponse } from '../types/capture';

interface UseCaptureResult {
    isCapturing: boolean;
    error: string | null;
    lastCapture: CaptureResponse | null;
    lastMarkdown?: string | null;
    submitCapture: (payload: CapturePayload) => Promise<boolean>;
    resetState: () => void;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
};

export const useCapture = (): UseCaptureResult => {
    const [isCapturing, setIsCapturing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastCapture, setLastCapture] = useState<CaptureResponse | null>(null);

    const resetState = useCallback(() => {
        setError(null);
        setLastCapture(null);
        setIsCapturing(false);
    }, []);

    const submitCapture = useCallback(
        async (payload: CapturePayload): Promise<boolean> => {
            setIsCapturing(true);
            setError(null);
            setLastCapture(null);

            try {
                let imageBase64: string | undefined;

                if (payload.image) {
                    imageBase64 = await fileToBase64(payload.image);
                }

                const request: CaptureRequest = {
                    text: payload.text,
                    image: imageBase64,
                    projectPath: payload.projectPath,
                    timestamp: new Date().toISOString(),
                };

                const response = await api.capture(request);

                // Ici, api.capture garantit déjà que c’est un succès
                setLastCapture(response);
                return true;
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : 'An unexpected error occurred';
                setError(errorMessage);
                return false;
            } finally {
                setIsCapturing(false);
            }
        },
        []
    );

    return {
        isCapturing,
        error,
        lastCapture,
        lastMarkdown: lastCapture?.markdown ?? null,
        submitCapture,
        resetState,
    };
};
