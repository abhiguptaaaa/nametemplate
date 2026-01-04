'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getTemplates, Template } from '@/lib/storage';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// Inline SVG Icons
const Icons = {
    ArrowLeft: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
    ),
    UploadCloud: () => (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
    )
};

export default function BulkGeneratePage() {
    const router = useRouter();
    const [templates, setTemplates] = useState<Template[]>([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
    const [selectedFieldId, setSelectedFieldId] = useState<string>('');

    // AI / Upload State
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isExtracting, setIsExtracting] = useState(false);
    const [extractedNames, setExtractedNames] = useState<string[]>([]);

    // Generation State
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });

    // Hidden canvas for generation
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const loaded = getTemplates();
        setTemplates(loaded);
        if (loaded.length > 0) {
            setSelectedTemplateId(loaded[0].id);
        }
    }, []);

    const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

    // Auto-select the first likely "name" field
    useEffect(() => {
        if (selectedTemplate) {
            const nameField = selectedTemplate.fields.find(f => f.label.toLowerCase().includes('name')) || selectedTemplate.fields[0];
            if (nameField) setSelectedFieldId(nameField.id);
        }
    }, [selectedTemplate]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleExtractNames = async () => {
        if (!imageFile) return;

        setIsExtracting(true);
        try {
            const formData = new FormData();
            formData.append('image', imageFile);

            const res = await fetch('/api/ai/extract-names', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) throw new Error('Extraction failed');

            const data = await res.json();
            if (data.names && Array.isArray(data.names)) {
                setExtractedNames(data.names);
            }
        } catch (error) {
            console.error(error);
            alert('Failed to extract names. Please try again.');
        } finally {
            setIsExtracting(false);
        }
    };

    const handleHelperWrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
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


    const handleGenerateZip = async () => {
        if (!selectedTemplate || extractedNames.length === 0 || !selectedFieldId) return;

        setIsGenerating(true);
        setProgress({ current: 0, total: extractedNames.length });

        const zip = new JSZip();
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Load base image once
        const img = new Image();
        img.src = selectedTemplate.imageUrl;
        await new Promise((resolve) => { img.onload = resolve; });

        // Ensure fonts are loaded
        await document.fonts.ready;

        canvas.width = img.width;
        canvas.height = img.height;

        try {
            for (let i = 0; i < extractedNames.length; i++) {
                const name = extractedNames[i];

                // Clear and Draw Background
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);

                // Draw Fields
                selectedTemplate.fields.forEach(field => {
                    let textToDraw = field.label;
                    // If this is the target field, use the extracted name
                    if (field.id === selectedFieldId) {
                        textToDraw = name;
                    }

                    ctx.fillStyle = field.color;
                    const weight = field.fontWeight || 400;
                    ctx.font = `${weight} ${field.fontSize}px "${field.fontFamily}"`;
                    ctx.textBaseline = 'top';

                    const lineHeight = field.fontSize * (field.lineHeight || 1.2);
                    const lines = handleHelperWrapText(ctx, textToDraw, field.width);

                    lines.forEach((line, idx) => {
                        let drawX = field.x;
                        const lineWidth = ctx.measureText(line).width;

                        if (field.alignment === 'center') {
                            drawX = field.x + (field.width - lineWidth) / 2;
                        } else if (field.alignment === 'right') {
                            drawX = field.x + field.width - lineWidth;
                        }

                        ctx.textAlign = 'left';
                        ctx.fillText(line, drawX, field.y + (idx * lineHeight));
                    });
                });

                // Add to Zip
                const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
                if (blob) {
                    // Sanitize filename
                    const safeName = name.replace(/[^a-z0-9]/gi, '_').substring(0, 50);
                    zip.file(`${safeName}_${i}.png`, blob);
                }

                setProgress(prev => ({ ...prev, current: i + 1 }));
                // Small delay to allow UI update
                await new Promise(r => setTimeout(r, 10));
            }

            // Generate Zip
            const content = await zip.generateAsync({ type: 'blob' });
            saveAs(content, `${selectedTemplate.name}_bulk_names.zip`);

        } catch (error) {
            console.error(error);
            alert('Error generating images.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-outfit">
            <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-lg transition">
                            <Icons.ArrowLeft />
                        </button>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Bulk AI Generator
                        </h1>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-5xl mx-auto w-full p-6 space-y-8">

                {/* Step 1: Template Selection */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                    <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">1</span>
                        Select Template
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-2">Template</label>
                            <select
                                value={selectedTemplateId}
                                onChange={(e) => setSelectedTemplateId(e.target.value)}
                                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
                            >
                                {templates.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-2">Target Field (for Names)</label>
                            <select
                                value={selectedFieldId}
                                onChange={(e) => setSelectedFieldId(e.target.value)}
                                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
                            >
                                {selectedTemplate?.fields.map(f => (
                                    <option key={f.id} value={f.id}>{f.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Step 2: Upload Image */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                    <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">2</span>
                        Upload List Image
                    </h2>

                    <div className="grid md:grid-cols-2 gap-8 items-start">
                        <div className="space-y-4">
                            <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${imageFile ? 'border-emerald-500 bg-emerald-50/10' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'}`}>
                                <input type="file" id="upload" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                <label htmlFor="upload" className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors ${imageFile ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                        <Icons.UploadCloud />
                                    </div>
                                    {imageFile ? (
                                        <>
                                            <p className="text-lg font-bold text-emerald-700">Image Selected!</p>
                                            <p className="text-sm text-emerald-600 mt-1">{imageFile.name}</p>
                                            <p className="text-xs text-slate-400 mt-4">(Click to change image)</p>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-lg font-bold text-slate-700 mb-2">Upload List Image</p>
                                            <span className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition shadow-sm">
                                                Select Image File
                                            </span>
                                            <p className="text-xs text-slate-400 mt-4">Takes clear photos of name lists (PNG/JPG)</p>
                                        </>
                                    )}
                                </label>
                            </div>
                            {imageFile && (
                                <button
                                    onClick={handleExtractNames}
                                    disabled={isExtracting}
                                    className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isExtracting ? (
                                        <>
                                            <Icons.Loader2 className="animate-spin" /> Extracting with AI...
                                        </>
                                    ) : (
                                        <>
                                            <Icons.Sparkles /> Extract Names
                                        </>
                                    )}
                                </button>
                            )}
                        </div>

                        {previewUrl && (
                            <div className="relative rounded-xl overflow-hidden border border-slate-200 h-64 bg-slate-100">
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Step 3: Verify & Generate */}
                {extractedNames.length > 0 && (
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">3</span>
                            Verify & Download
                        </h2>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-600 mb-2">
                                Extracted Names ({extractedNames.length})
                                <span className="text-xs font-normal text-slate-400 ml-2">(Edit manually if needed)</span>
                            </label>
                            <textarea
                                value={extractedNames.join('\n')}
                                onChange={(e) => setExtractedNames(e.target.value.split('\n').filter(s => s.trim()))}
                                className="w-full h-40 p-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-mono text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none resize-y"
                            />
                        </div>

                        <button
                            onClick={handleGenerateZip}
                            disabled={isGenerating}
                            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-emerald-500/25 transition disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {isGenerating ? (
                                <>
                                    <Icons.Loader2 className="animate-spin" />
                                    Generating {progress.current}/{progress.total}
                                </>
                            ) : (
                                <>
                                    <Icons.Download /> Generate & Download ZIP
                                </>
                            )}
                        </button>
                    </div>
                )}
            </main>

            {/* Hidden Canvas for Processing */}
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
}
