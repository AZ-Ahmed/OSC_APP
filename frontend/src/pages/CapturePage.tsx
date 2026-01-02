import React, { useState, useRef, useEffect } from 'react';
import { useCapture } from '../hooks/useCapture';

const CapturePage: React.FC = () => {
    const [text, setText] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { submitCapture, isCapturing, error, resetState } = useCapture();
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setImage(null);
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
            setImagePreview(null);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleCapture = async () => {
        if ((!text.trim() && !image) || isCapturing) return;

        const success = await submitCapture({
            text,
            image,
            projectPath: 'default'
        });

        if (success) {
            setText('');
            removeImage();
            setSuccessMessage('Saved to Obsidian');
            setTimeout(() => {
                setSuccessMessage(null);
                resetState();
            }, 3000);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            handleCapture();
        }
    };

    const buttonDisabled = (!text.trim() && !image) || isCapturing;

    return (
        // Warm dark background: #0f0e11 (deep warm gray)
        <div className="min-h-screen flex flex-col items-center bg-[#0f0e11] text-[#d4d4d8] font-sans selection:bg-[#5b21b6] selection:text-white transition-colors duration-300">

            <main className="w-full max-w-[600px] flex-1 flex flex-col px-6 py-12 gap-6">

                {/* Header */}
                <header className="flex flex-col items-center justify-center pb-2 opacity-80">
                    <h1 className="text-xs font-semibold tracking-[0.2em] text-[#a1a1aa] uppercase select-none">
                        Obsidian Smart Capture
                    </h1>
                </header>

                {/* Feedback Area */}
                <div className="min-h-[24px] flex items-center justify-center">
                    {error && (
                        <span className="text-sm text-red-400 font-medium animate-fade-in">
                            {error}
                        </span>
                    )}
                    {successMessage && (
                        <span className="text-sm text-[#a78bfa] font-medium animate-fade-in">
                            {successMessage}
                        </span>
                    )}
                </div>

                {/* Note Surface */}
                {/* Lighter warm gray card: #18181b with subtle violet border usage if needed */}
                <div className="flex-1 flex flex-col bg-[#18181b] rounded-xl shadow-2xl border border-[#27272a] overflow-hidden relative group">

                    {/* Focus Ring Indicator (subtle top border) */}
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#7c3aed] to-transparent opacity-0 transition-opacity duration-500 group-focus-within:opacity-40" />

                    {/* Textarea */}
                    <textarea
                        className="
                            flex-1 w-full p-6 text-lg
                            bg-transparent
                            resize-none outline-none
                            text-[#e4e4e7]
                            placeholder:text-[#52525b]
                            leading-relaxed
                            disabled:opacity-50
                            selection:bg-[#5b21b6]/30
                        "
                        placeholder="What are you thinking?"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isCapturing}
                        autoFocus
                    />

                    {/* Image Preview (Inline) */}
                    {imagePreview && (
                        <div className="px-6 pb-6 animate-fade-in">
                            <div className="relative group/image inline-block">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="max-h-48 rounded-lg border border-[#3f3f46] object-cover opacity-90 transition-opacity group-hover/image:opacity-100"
                                />
                                <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-white/10 group-hover/image:ring-white/20 transition-all" />
                                <button
                                    onClick={removeImage}
                                    disabled={isCapturing}
                                    className="absolute -top-2 -right-2 bg-[#27272a] text-[#a1a1aa] rounded-full p-1.5 shadow-lg border border-[#3f3f46] hover:text-white hover:bg-[#3f3f46] transition-all"
                                    aria-label="Remove image"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Toolbar / Actions Footer */}
                    <div className="px-4 py-3 bg-[#131316] border-t border-[#27272a] flex justify-between items-center">

                        {/* Image Attachment Button */}
                        <div>
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleImageSelect}
                                className="hidden"
                                disabled={isCapturing}
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isCapturing || !!image}
                                className={`
                                    flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                                    transition-all duration-200
                                    ${image
                                        ? 'text-[#52525b] cursor-default'
                                        : 'text-[#71717a] hover:bg-[#27272a] hover:text-[#a1a1aa]'
                                    }
                                `}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-80">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                    <polyline points="21 15 16 10 5 21"></polyline>
                                </svg>
                                <span>Add photo</span>
                            </button>
                        </div>

                        {/* Capture Button */}
                        <button
                            onClick={handleCapture}
                            disabled={buttonDisabled}
                            className={`
                                px-6 py-2 rounded-lg text-sm font-medium tracking-wide
                                transition-all duration-200 shadow-lg
                                flex items-center gap-2
                                ${buttonDisabled
                                    ? 'bg-[#27272a] text-[#52525b] cursor-not-allowed shadow-none'
                                    : 'bg-[#1e1b2e] text-[#a78bfa] border border-[#5b21b6]/30 hover:bg-[#2e2a3e] hover:border-[#5b21b6]/50 hover:text-[#c4b5fd] hover:shadow-[#5b21b6]/10'
                                }
                            `}
                        >
                            {isCapturing && (
                                <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                            {isCapturing ? 'Processing' : 'Capture'}
                        </button>
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-[10px] uppercase tracking-widest text-[#3f3f46]">
                        Private • Encrypted • Vault
                    </p>
                </div>

            </main>
        </div>
    );
};

export default CapturePage;
