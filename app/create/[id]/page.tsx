'use client';

import { useState, useRef, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Template, TemplateField, CustomFont } from '@/lib/storage';

export default function CreateTemplate({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const [template, setTemplate] = useState<Template | null>(null);
    const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [customFonts, setCustomFonts] = useState<CustomFont[]>([]);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imgRef = useRef<HTMLImageElement | null>(null);

    // Fetch fonts and template
    useEffect(() => {
        // Fetch Fonts
        fetch('/api/fonts')
            .then(res => res.json())
            .then((fonts: CustomFont[]) => {
                setCustomFonts(fonts);
                // Inject styles
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
                            // Only restore valid field IDs
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

            let drawX = field.x;
            if (field.alignment === 'center') drawX = field.x + field.width / 2;
            if (field.alignment === 'right') drawX = field.x + field.width;

            // Match Editor Logic (no wrap, just print)
            ctx.fillText(text, drawX, field.y, field.width);
        });
    };

    useEffect(() => {
        draw();
        // Autosave draft
        if (template && Object.keys(fieldValues).length > 0) {
            localStorage.setItem(`user_draft_${template.id}`, JSON.stringify(fieldValues));
        }
    }, [fieldValues, template]);

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
                <p className="text-slate-500 font-medium">Loading Editor...</p>
            </div>
        </div>
    );

    if (!template) return null;

    return (
        <div className="min-h-screen bg-[#f3f4f6] flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-4 sticky top-0 z-50 shadow-sm">
                <div className="max-w-[1600px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/')}
                            className="text-slate-500 hover:text-slate-800 hover:bg-slate-100 p-2 rounded-full transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        </button>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900 truncate max-w-[150px] sm:max-w-xs">{template.name}</h1>
                            <p className="text-xs text-slate-500 hidden sm:block">Edit and Download</p>
                        </div>
                    </div>
                    <button
                        onClick={handleDownload}
                        className="bg-indigo-600 text-white font-bold px-4 md:px-6 py-2 md:py-2.5 rounded-full hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 flex items-center gap-2 text-sm md:text-base"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        <span className="hidden sm:inline">Download Image</span>
                        <span className="sm:hidden">Save</span>
                    </button>
                </div>
            </header>

            {/* Main Content - Mobile Friendly Grid order */}
            <main className="flex-1 max-w-[1600px] mx-auto w-full p-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* Left: Input Panel (Order 2 on mobile, Order 1 on Desktop) */}
                <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6 order-2 lg:order-1 w-full lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto custom-scrollbar">
                    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
                        <h2 className="text-2xl font-bold mb-1 text-slate-900">Customize</h2>
                        <p className="text-slate-500 text-sm mb-8">Fill in the details below.</p>

                        <div className="space-y-6">
                            {template.fields.map(field => (
                                <div key={field.id} className="group">
                                    <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-widest pl-1">
                                        {field.label}
                                    </label>
                                    <input
                                        type="text"
                                        value={fieldValues[field.id]}
                                        onChange={(e) => setFieldValues({ ...fieldValues, [field.id]: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl px-4 py-3.5 transition-all outline-none text-slate-900 font-medium placeholder:text-slate-300"
                                        placeholder={`Type ${field.label}...`}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
                        <h3 className="font-bold text-indigo-900 mb-2">Pro Tip</h3>
                        <p className="text-sm text-indigo-700">Get the best results by using Title Case for names (e.g., "John Doe").</p>
                    </div>
                </div>

                {/* Right: Preview Canvas (Order 1 on mobile, Order 2 on Desktop) */}
                <div className="lg:col-span-8 xl:col-span-9 flex items-center justify-center bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden p-4 md:p-8 relative min-h-[300px] order-1 lg:order-2">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none"></div>
                    <div className="relative shadow-2xl rounded-lg overflow-hidden ring-4 ring-white/10 max-w-full flex">
                        <canvas
                            ref={canvasRef}
                            className="max-w-full h-auto object-contain"
                        />
                    </div>
                </div>

            </main>
        </div>
    );
}
