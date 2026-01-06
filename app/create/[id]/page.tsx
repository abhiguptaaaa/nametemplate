'use client';

import { useState, useRef, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Template, CustomFont } from '@/lib/storage';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ThemeToggle } from '@/components/ThemeToggle';

// Inline SVG Icons for Bulk Process
const BulkIcons = {
    UploadCloud: () => (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
    ),
    Loader2: ({ className }: { className?: string }) => (
        <svg className={className || "w-5 h-5 animate-spin"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
    ),
    Sparkles: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
    ),
    Download: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
    ),
    X: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    WhatsApp: () => (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.374-5.03c0-5.429 4.417-9.868 9.856-9.868 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.429-4.415 9.869-9.835 9.869" /></svg>
    ),
    Share: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
    )
};

const BackgroundEffects = () => (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-200/40 rounded-full blur-[100px] opacity-60 mix-blend-multiply animate-blob" />
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-200/40 rounded-full blur-[100px] opacity-60 mix-blend-multiply animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] bg-cyan-100/40 rounded-full blur-[80px] opacity-50 mix-blend-multiply animate-blob animation-delay-4000" />
    </div>
);

// Helper to wrap text
const getLines = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
};

export default function CreateTemplate({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const [template, setTemplate] = useState<Template | null>(null);
    const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [customFonts, setCustomFonts] = useState<CustomFont[]>([]);
    const [hinglishConverterEnabled, setHinglishConverterEnabled] = useState(true); // ON by default
    const [whatsappNumber, setWhatsappNumber] = useState('');

    // Bulk Mode State
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [bulkImageFile, setBulkImageFile] = useState<File | null>(null);
    const [bulkNames, setBulkNames] = useState<string[]>([]);
    const [isBulkExtracting, setIsBulkExtracting] = useState(false);
    const [isBulkGenerating, setIsBulkGenerating] = useState(false);
    const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imgRef = useRef<HTMLImageElement | null>(null);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Fetch fonts and template
    const loadFonts = () => {
        fetch('/api/fonts', { cache: 'no-store' })
            .then(res => res.json())
            .then((fonts: CustomFont[]) => {
                setCustomFonts(fonts);
                const styleId = 'dynamic-fonts';
                let styleEl = document.getElementById(styleId);
                if (!styleEl) {
                    styleEl = document.createElement('style');
                    styleEl.id = styleId;
                    document.head.appendChild(styleEl);
                }
                const css = fonts.map(font => `
                    @font-face {
                        font-family: '${font.name}';
                        src: url('${font.dataUrl}');
                    }
                `).join('\n');
                styleEl.textContent = css;
            })
            .catch(console.error);
    };

    useEffect(() => {
        // Initial font load
        loadFonts();

        // Reload fonts when window regains focus (catches admin uploads)
        const handleFocus = () => {
            console.log('[FONT DEBUG] Window focused, reloading fonts...');
            loadFonts();
        };
        window.addEventListener('focus', handleFocus);

        // Also poll for fonts every 10 seconds as backup
        const fontInterval = setInterval(() => {
            console.log('[FONT DEBUG] Polling for font updates...');
            loadFonts();
        }, 10000);

        // Fetch Template
        fetch('/api/templates')
            .then(res => res.json())
            .then((data: Template[]) => {
                const t = data.find(item => item.id === id);
                if (t) {
                    setTemplate(t);
                    const initialValues: Record<string, string> = {};
                    t.fields.forEach(f => initialValues[f.id] = '');

                    // Check for saved draft
                    const savedDraft = localStorage.getItem(`user_draft_${t.id}`);
                    if (savedDraft) {
                        try {
                            const parsed = JSON.parse(savedDraft);
                            t.fields.forEach(f => {
                                if (parsed[f.id]) initialValues[f.id] = parsed[f.id];
                            });
                        } catch (e) { console.error(e); }
                    }

                    setFieldValues(initialValues);

                    const img = new Image();
                    img.src = t.imageUrl;
                    img.onload = () => {
                        imgRef.current = img;
                        draw();
                    };
                } else {
                    router.push('/');
                }
                setLoading(false);
            });

        return () => {
            window.removeEventListener('focus', handleFocus);
            clearInterval(fontInterval);
        };
    }, [id]);

    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas || !imgRef.current || !template) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = imgRef.current.width;
        canvas.height = imgRef.current.height;
        ctx.drawImage(imgRef.current, 0, 0);

        template.fields.forEach(field => {
            const text = fieldValues[field.id] || '';
            if (!text) return;

            ctx.fillStyle = field.color;
            const weight = field.fontWeight || 400;
            ctx.font = `${weight} ${field.fontSize}px "${field.fontFamily}"`;
            ctx.textBaseline = 'alphabetic'; // More consistent across browsers than 'top'

            const lineHeight = field.fontSize * (field.lineHeight || 1.2);
            const lines = getLines(ctx, text, field.width);

            // Responsive offset: Mobile (0.8) vs Desktop (0.9) to match browser rendering differences
            const isMobile = window.innerWidth < 768;
            const offsetRatio = isMobile ? 0.8 : 0.9;
            const baselineOffset = field.fontSize * offsetRatio;

            lines.forEach((line, index) => {
                let drawX = field.x;
                const lineWidth = ctx.measureText(line).width;

                if (field.alignment === 'center') {
                    drawX = field.x + (field.width - lineWidth) / 2;
                } else if (field.alignment === 'right') {
                    drawX = field.x + field.width - lineWidth;
                }

                ctx.textAlign = 'left';
                ctx.fillText(line, drawX, field.y + baselineOffset + (index * lineHeight));
            });
        });
    };

    useEffect(() => {
        draw();
        // Autosave draft
        if (template && Object.keys(fieldValues).length > 0) {
            localStorage.setItem(`user_draft_${template.id}`, JSON.stringify(fieldValues));
        }
    }, [fieldValues, template]);

    // Transliterate Hinglish to Hindi - WORD BY WORD to preserve punctuation
    const transliterateText = async (text: string, signal: AbortSignal) => {
        if (!text || !hinglishConverterEnabled) {
            return text;
        }

        try {
            // Split into tokens (words and non-words)
            const tokens = text.match(/[\w\u0900-\u097F]+|[^\w\u0900-\u097F]+/g) || [text];
            const transliteratedTokens = [];

            for (const token of tokens) {
                // Check if token is a word (contains letters)
                if (/[\w\u0900-\u097F]/.test(token)) {
                    // It's a word, transliterate it
                    const response = await fetch('/api/transliterate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ text: token }),
                        signal,
                    });

                    if (response.ok) {
                        const data = await response.json();
                        transliteratedTokens.push(data.transliterated || token);
                    } else {
                        transliteratedTokens.push(token);
                    }
                } else {
                    // It's punctuation/whitespace, keep as-is
                    transliteratedTokens.push(token);
                }
            }

            return transliteratedTokens.join('');
        } catch (error: any) {
            if (error.name === 'AbortError') {
                return null; // Request cancelled
            }
            console.error('Transliteration error:', error);
            return text;
        }
    };

    // Handle input change with debounced transliteration and race condition protection
    const abortControllerRef = useRef<AbortController | null>(null);

    const handleInputChange = (fieldId: string, value: string) => {
        // Update immediately for responsive typing
        setFieldValues(prev => ({ ...prev, [fieldId]: value }));

        // Debounce transliteration API call
        if (hinglishConverterEnabled && value.trim()) {
            // Cancel previous pending request
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            // Cancel previous timer
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }

            debounceTimerRef.current = setTimeout(async () => {
                // Create new controller for this request
                const controller = new AbortController();
                abortControllerRef.current = controller;

                // Capture the value we're transliterating
                const valueToTransliterate = value;
                const transliterated = await transliterateText(valueToTransliterate, controller.signal);

                // Only update if:
                // 1. Translation succeeded (not null)
                // 2. Current field value is still the same as what we transliterated (user hasn't typed more)
                if (transliterated !== null) {
                    setFieldValues(prev => {
                        // Only update if the field value hasn't changed since we started
                        if (prev[fieldId] === valueToTransliterate) {
                            return { ...prev, [fieldId]: transliterated };
                        }
                        // User has typed more, don't overwrite
                        return prev;
                    });
                }
            }, 1000); // 1s debounce
        }
    };

    // Bulk Logic Methods
    const handleBulkImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setBulkImageFile(e.target.files[0]);
        }
    };

    const handleBulkExtract = async () => {
        if (!bulkImageFile) return;
        setIsBulkExtracting(true);
        try {
            const formData = new FormData();
            formData.append('image', bulkImageFile);
            const res = await fetch('/api/ai/extract-names', { method: 'POST', body: formData });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || `Server Error: ${res.status}`);
            }

            const data = await res.json();
            if (data.names && Array.isArray(data.names) && data.names.length > 0) {
                setBulkNames(data.names);
            } else {
                alert('No names found. Please try a clearer image or a close-up of the list.');
            }
        } catch (e: any) {
            console.error(e);
            alert(`Extraction failed: ${e.message}`);
        } finally {
            setIsBulkExtracting(false);
        }
    };

    const handleBulkGenerate = async () => {
        if (!template || bulkNames.length === 0) return;

        // Find "Name" field - robust check
        const targetField = template.fields.find(f => f.label.toLowerCase().includes('name')) || template.fields[0];
        if (!targetField) return;

        setIsBulkGenerating(true);
        setBulkProgress({ current: 0, total: bulkNames.length });

        const zip = new JSZip();
        // Create a temporary canvas for generation to avoid flickering main canvas
        const genCanvas = document.createElement('canvas');
        const genCtx = genCanvas.getContext('2d');
        if (!genCtx) return;

        const img = new Image();
        img.src = template.imageUrl;
        await new Promise(r => img.onload = r);
        genCanvas.width = img.width;
        genCanvas.height = img.height;

        // Ensure fonts
        await document.fonts.ready;

        try {
            for (let i = 0; i < bulkNames.length; i++) {
                const name = bulkNames[i];

                // Draw logic (replicated for background processing)
                genCtx.clearRect(0, 0, genCanvas.width, genCanvas.height);
                genCtx.drawImage(img, 0, 0);

                template.fields.forEach(field => {
                    let text = (field.id === targetField.id) ? name : (fieldValues[field.id] || '');
                    if (!text && field.id !== targetField.id) return; // Skip empty non-target fields

                    genCtx.fillStyle = field.color;
                    const weight = field.fontWeight || 400;
                    genCtx.font = `${weight} ${field.fontSize}px "${field.fontFamily}"`;
                    genCtx.textAlign = field.alignment;
                    genCtx.textBaseline = 'alphabetic';

                    const lineHeight = field.fontSize * (field.lineHeight || 1.2);
                    const lines = getLines(genCtx, text, field.width);

                    // Responsive logic for bulk generation to match screen preview
                    const isMobile = window.innerWidth < 768;
                    const offsetRatio = isMobile ? 0.8 : 0.9;
                    const baselineOffset = field.fontSize * offsetRatio;

                    lines.forEach((line, idx) => {
                        let drawX = field.x;
                        const lineWidth = genCtx.measureText(line).width;
                        if (field.alignment === 'center') drawX = field.x + (field.width - lineWidth) / 2;
                        else if (field.alignment === 'right') drawX = field.x + field.width - lineWidth;

                        genCtx.textAlign = 'left';
                        genCtx.fillText(line, drawX, field.y + baselineOffset + (idx * lineHeight));
                    });
                });

                const blob = await new Promise<Blob | null>(r => genCanvas.toBlob(r, 'image/png'));
                if (blob) {
                    const safeName = name.replace(/[^a-z0-9]/gi, '_').substring(0, 50);
                    zip.file(`${safeName}_${i}.png`, blob);
                }
                setBulkProgress(p => ({ ...p, current: i + 1 }));
                await new Promise(r => setTimeout(r, 0)); // Yield to UI
            }

            const content = await zip.generateAsync({ type: 'blob' });
            saveAs(content, `${template.name}_bulk.zip`);
            setIsBulkModalOpen(false); // Close modal on success
        } catch (e) {
            console.error(e);
            alert('Generation failed.');
        } finally {
            setIsBulkGenerating(false);
        }
    };

    const handleDownload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const link = document.createElement('a');
        link.download = `${template?.name || 'personalized'}-image.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    const handleShare = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        try {
            const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
            if (!blob) {
                alert('Failed to generate image');
                return;
            }

            const file = new File([blob], `${template?.name || 'design'}.png`, { type: 'image/png' });
            const shareData = {
                title: template?.name || 'Design',
                text: 'Check out this design!',
                files: [file]
            };

            if (navigator.share && navigator.canShare(shareData)) {
                await navigator.share(shareData);
            } else {
                // Fallback to clipboard
                try {
                    await navigator.clipboard.write([
                        new ClipboardItem({
                            [blob.type]: blob
                        })
                    ]);
                    alert('Image copied to clipboard');
                } catch (err) {
                    console.error('Share fallback failed', err);
                    alert('Sharing not supported on this device');
                }
            }
        } catch (err) {
            console.error('Share error:', err);
        }
    };


    const handleWhatsApp = async () => {
        if (!whatsappNumber) {
            alert('Please enter a WhatsApp number');
            return;
        }

        const canvas = canvasRef.current;
        if (!canvas) return;

        try {
            const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
            if (!blob) return;

            // Copy to clipboard first
            try {
                await navigator.clipboard.write([
                    new ClipboardItem({
                        [blob.type]: blob
                    })
                ]);
                alert('Image copied! Paste it in the chat.');
            } catch (err) {
                console.warn('Clipboard write failed', err);
                alert('Opening WhatsApp...');
            }

            // Open WhatsApp
            const cleanNumber = whatsappNumber.replace(/\D/g, '');
            window.open(`https://wa.me/${cleanNumber}`, '_blank');
        } catch (err) {
            console.error('WhatsApp share error', err);
            alert('Failed to process image');
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                <p className="text-slate-500 font-medium">Loading...</p>
            </div>
        </div>
    );

    if (!template) return null;

    return (
        <div className="min-h-screen bg-[#FAFAFA] dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500/10 selection:text-indigo-700 transition-colors duration-200">
            <BackgroundEffects />

            {/* Header */}
            <header className="fixed w-full top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-white/50 dark:border-slate-700/50 shadow-sm supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60 transition-all duration-200">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 sm:gap-6 min-w-0 flex-1">
                        <button
                            onClick={() => router.push('/')}
                            className="p-2 sm:p-2.5 -ml-2 text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all group flex-shrink-0"
                        >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        </button>

                        <div className="flex flex-col min-w-0 flex-1">
                            <h1 className="text-base sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent leading-tight tracking-tight truncate">
                                {template.name}
                            </h1>
                            <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5">
                                <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2 flex-shrink-0">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-full w-full bg-emerald-500"></span>
                                </span>
                                <span className="text-[10px] sm:text-xs font-semibold text-emerald-600/90 tracking-wide uppercase">Live</span>
                            </div>
                        </div>
                    </div>
                    {/* Right Actions */}
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                        <ThemeToggle />
                        <button
                            onClick={handleShare}
                            className="p-2 sm:p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-all"
                            title="Share"
                        >
                            <BulkIcons.Share />
                        </button>
                        <button
                            onClick={() => setIsBulkModalOpen(true)}
                            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all active:scale-95 relative"
                            title="Bulk Generate"
                        >
                            <BulkIcons.Sparkles />
                            <span className="hidden sm:inline">Bulk</span>
                            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-full w-full bg-indigo-500"></span>
                            </span>
                        </button>



                        <button
                            onClick={handleDownload}
                            className="px-3 sm:px-6 py-2 sm:py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-full shadow-lg shadow-slate-900/20 hover:shadow-slate-900/40 transition-all flex items-center gap-1.5 sm:gap-2 active:scale-95 group text-sm"
                        >
                            <span className="hidden xs:inline">Download</span>
                            <BulkIcons.Download />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 pt-24 md:pt-28 pb-12 px-4 md:px-6 max-w-[1600px] mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Left Panel: Inputs */}
                    <div className="lg:col-span-4 xl:col-span-3 order-2 lg:order-1 flex flex-col gap-6 lg:sticky lg:top-28 max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar">
                        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl border border-white/60 dark:border-slate-700/60 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 p-6 md:p-8">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-sm">✍️</span>
                                Personalize
                            </h2>

                            {/* Hinglish Converter Toggle */}
                            <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/50">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-2">
                                            <span className="text-base">🔤</span>
                                            Hinglish to Hindi Converter
                                        </h3>
                                    </div>
                                    <button
                                        onClick={() => setHinglishConverterEnabled(!hinglishConverterEnabled)}
                                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${hinglishConverterEnabled ? 'bg-indigo-600' : 'bg-slate-300'
                                            }`}
                                        role="switch"
                                        aria-checked={hinglishConverterEnabled}
                                    >
                                        <span
                                            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${hinglishConverterEnabled ? 'translate-x-6' : 'translate-x-1'
                                                }`}
                                        />
                                    </button>
                                </div>

                            </div>
                            <div className="space-y-5">
                                {template.fields.map(field => (
                                    <div key={field.id} className="group relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                        </div>
                                        <input
                                            type="text"
                                            value={fieldValues[field.id]}
                                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                                            className="block w-full pl-10 pr-3 py-3.5 border border-slate-200 dark:border-slate-600 rounded-xl leading-5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-all shadow-sm"
                                            placeholder={hinglishConverterEnabled ? `Type in Hinglish or Hindi` : `Enter ${field.label}`}
                                        />
                                        <label className="absolute -top-2 left-3 inline-block bg-white dark:bg-slate-700 px-1 text-xs font-bold text-slate-500 dark:text-slate-300 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors rounded-sm">
                                            {field.label}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>



                        {/* WhatsApp Quick Share Card */}
                        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl border border-white/60 dark:border-slate-700/60 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 p-5">
                            <h3 className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <span className="text-[#25D366]"><BulkIcons.WhatsApp /></span> Quick Share
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
                                Send current design to WhatsApp. The image will be copied to your clipboard.
                            </p>
                            <div className="flex gap-2">
                                <div className="flex-1 relative">
                                    <input
                                        type="tel"
                                        placeholder="Phone (e.g. 919876543210)"
                                        value={whatsappNumber}
                                        onChange={(e) => setWhatsappNumber(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#25D366]/20 focus:border-[#25D366] outline-none transition-all dark:text-slate-100"
                                    />
                                </div>
                                <button
                                    onClick={handleWhatsApp}
                                    className="bg-[#25D366] hover:bg-[#20bd5a] text-white p-2.5 rounded-xl transition-colors shadow-lg shadow-[#25D366]/20 flex items-center justify-center"
                                    title="Send to WhatsApp"
                                >
                                    <svg className="w-5 h-5 -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Canvas */}
                    <div className="lg:col-span-8 xl:col-span-9 order-1 lg:order-2">
                        <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur rounded-3xl border border-white/60 dark:border-slate-700/60 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 p-2 md:p-3 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/20 dark:to-purple-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                            <div className="relative bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800/50 flex flex-col items-center justify-center min-h-[400px]">
                                <canvas
                                    ref={canvasRef}
                                    className="max-w-full h-auto shadow-2xl shadow-indigo-500/10 rounded-lg"
                                />
                            </div>
                        </div>
                        <p className="text-center text-xs text-slate-400 mt-4 font-medium uppercase tracking-widest">High Quality Preview Mode</p>
                    </div>

                </div>
            </main>
            {/* Bulk Generation Modal */}
            {isBulkModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                <span className="bg-indigo-100 text-indigo-600 p-1.5 rounded-lg"><BulkIcons.Sparkles /></span>
                                Bulk Generate Certificates
                            </h3>
                            <button onClick={() => setIsBulkModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition">
                                <BulkIcons.X />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto space-y-6">
                            {/* Step 1: Upload */}
                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-slate-700 block">1. Upload List Image</label>
                                <div className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all ${bulkImageFile ? 'border-emerald-500 bg-emerald-50/10' : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50'}`}>
                                    <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" onChange={handleBulkImageUpload} />
                                    <div className="flex flex-col items-center pointer-events-none">
                                        <div className={`mb-2 ${bulkImageFile ? 'text-emerald-500' : 'text-slate-400'}`}><BulkIcons.UploadCloud /></div>
                                        {bulkImageFile ? (
                                            <p className="text-sm font-medium text-emerald-700 truncate max-w-[200px]">{bulkImageFile.name}</p>
                                        ) : (
                                            <p className="text-sm text-slate-500">Tap to upload image</p>
                                        )}
                                    </div>
                                </div>
                                {bulkImageFile && !bulkNames.length && (
                                    <button
                                        onClick={handleBulkExtract}
                                        disabled={isBulkExtracting}
                                        className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-medium text-sm hover:bg-indigo-700 transition flex justify-center items-center gap-2"
                                    >
                                        {isBulkExtracting ? <><BulkIcons.Loader2 /> Extracting...</> : 'Extract Names'}
                                    </button>
                                )}
                            </div>

                            {/* Step 2: Review */}
                            {bulkNames.length > 0 && (
                                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-semibold text-slate-700">2. Verify Names ({bulkNames.length})</label>
                                        <button onClick={() => setBulkNames([])} className="text-xs text-red-500 hover:text-red-700 underline">Clear</button>
                                    </div>
                                    <textarea
                                        value={bulkNames.join('\n')}
                                        onChange={e => setBulkNames(e.target.value.split('\n'))}
                                        className="w-full h-32 p-3 text-sm border border-slate-200 rounded-xl bg-slate-50/50 focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none font-mono"
                                    />
                                    <button
                                        onClick={handleBulkGenerate}
                                        disabled={isBulkGenerating}
                                        className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-emerald-500/20 transition flex justify-center items-center gap-2"
                                    >
                                        {isBulkGenerating ? (
                                            <><BulkIcons.Loader2 /> Generating {bulkProgress.current}/{bulkProgress.total}</>
                                        ) : (
                                            <><BulkIcons.Download /> Generate ZIP</>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
