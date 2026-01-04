'use client';

import { useState, useRef, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Template, CustomFont } from '@/lib/storage';

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

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imgRef = useRef<HTMLImageElement | null>(null);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Fetch fonts and template
    useEffect(() => {
        // Fetch Fonts
        fetch('/api/fonts')
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
            ctx.textAlign = field.alignment;
            ctx.textBaseline = 'top';

            const lineHeight = field.fontSize * (field.lineHeight || 1.2);
            const lines = getLines(ctx, text, field.width);

            lines.forEach((line, index) => {
                let drawX = field.x;
                const lineWidth = ctx.measureText(line).width;

                if (field.alignment === 'center') {
                    drawX = field.x + (field.width - lineWidth) / 2;
                } else if (field.alignment === 'right') {
                    drawX = field.x + field.width - lineWidth;
                }

                ctx.textAlign = 'left';
                ctx.fillText(line, drawX, field.y + (index * lineHeight));
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

    // Transliterate Hinglish to Hindi
    const transliterateText = async (text: string, signal: AbortSignal) => {
        if (!text || !hinglishConverterEnabled) {
            return text;
        }

        try {
            const response = await fetch('/api/transliterate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text }),
                signal,
            });

            if (!response.ok) {
                return text;
            }

            const data = await response.json();
            return data.transliterated || text;
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

                const transliterated = await transliterateText(value, controller.signal);

                // Only update if not cancelled (transliterateText returns null on abort)
                if (transliterated !== null) {
                    setFieldValues(prev => ({ ...prev, [fieldId]: transliterated }));
                }
            }, 1000); // 1.5s debounce to let user finish sentence
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
        <div className="min-h-screen bg-[#FAFAFA] text-slate-900 font-sans selection:bg-indigo-500/10 selection:text-indigo-700">
            <BackgroundEffects />

            {/* Header */}
            <header className="fixed w-full top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/50 shadow-sm supports-[backdrop-filter]:bg-white/60">
                <div className="max-w-[1600px] mx-auto px-6 h-16 md:h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/')}
                            className="p-2 -ml-2 text-slate-500 hover:text-slate-900 hover:bg-black/5 rounded-full transition-all"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        </button>
                        <div className="flex flex-col">
                            <h1 className="text-lg md:text-xl font-bold text-slate-900 leading-none mb-1">{template.name}</h1>
                            <div className="flex items-center gap-2">
                                <span className="bg-green-100/80 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-green-200 uppercase tracking-wide">Live Editor</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleDownload}
                        className="bg-slate-900 hover:bg-indigo-600 text-white font-medium px-6 py-2.5 rounded-full shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/30 transition-all flex items-center gap-2 active:scale-95"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        <span>Download</span>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 pt-24 md:pt-28 pb-12 px-4 md:px-6 max-w-[1600px] mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Left Panel: Inputs */}
                    <div className="lg:col-span-4 xl:col-span-3 order-2 lg:order-1 flex flex-col gap-6 lg:sticky lg:top-28">
                        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/60 shadow-xl shadow-slate-200/50 p-6 md:p-8">
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 text-sm">✍️</span>
                                Personalize
                            </h2>

                            {/* Hinglish Converter Toggle */}
                            <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-2">
                                            <span className="text-base">🔤</span>
                                            Hinglish to Hindi Converter
                                        </h3>
                                        <p className="text-xs text-slate-600">Auto-convert English text to Hindi script</p>
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
                                {hinglishConverterEnabled && (
                                    <div className="mt-3 pt-3 border-t border-indigo-200">
                                        <p className="text-xs text-indigo-700 font-medium animate-in fade-in duration-300">
                                            ✓ Converter is ON - Type in Hinglish (e.g., "namaste" → "नमस्ते")
                                        </p>
                                    </div>
                                )}
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
                                            className="block w-full pl-10 pr-3 py-3.5 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-all shadow-sm"
                                            placeholder={hinglishConverterEnabled ? `Type in Hinglish or Hindi` : `Enter ${field.label}`}
                                        />
                                        <label className="absolute -top-2 left-3 inline-block bg-white px-1 text-xs font-bold text-slate-500 group-focus-within:text-indigo-600 transition-colors">
                                            {field.label}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-indigo-600/5 rounded-2xl p-5 border border-indigo-100/50">
                            <h3 className="text-sm font-bold text-indigo-900 mb-1">Preview Updates Instantly</h3>
                            <p className="text-xs text-indigo-700/80">Every character you type is immediately rendered on the canvas.</p>
                        </div>
                    </div>

                    {/* Right Panel: Canvas */}
                    <div className="lg:col-span-8 xl:col-span-9 order-1 lg:order-2">
                        <div className="bg-white/50 backdrop-blur rounded-3xl border border-white/60 shadow-xl shadow-slate-200/50 p-2 md:p-3 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                            <div className="relative bg-slate-100/50 rounded-2xl overflow-hidden border border-slate-200/50 flex flex-col items-center justify-center min-h-[400px]">
                                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                                <canvas
                                    ref={canvasRef}
                                    className="max-w-full h-auto shadow-2xl shadow-indigo-500/10 rounded-lg scale-[0.98] group-hover:scale-100 transition-transform duration-500 ease-out"
                                />
                            </div>
                        </div>
                        <p className="text-center text-xs text-slate-400 mt-4 font-medium uppercase tracking-widest">High Quality Preview Mode</p>
                    </div>

                </div>
            </main>
        </div>
    );
}
