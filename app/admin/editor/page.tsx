'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Template, TemplateField, CustomFont } from '@/lib/storage';

// --- Icons ---
const Icons = {
    Back: () => (
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
    ),
    Save: () => (
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
        </svg>
    ),
    Image: () => (
        <svg className="w-8 h-8 text-indigo-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    ),
    Text: () => (
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
    ),
    Trash: () => (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
    ),
    AlignLeft: () => (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h7" /></svg>
    ),
    AlignCenter: () => (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M7 12h10M7 18h10" /></svg>
    ),
    AlignRight: () => (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M10 12h10M7 18h13" /></svg>
    ),
    Plus: () => (
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
    ),
    ZoomIn: () => (
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
    ),
    ZoomOut: () => (
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" /></svg>
    )
};

const BackgroundEffects = () => (
    <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-200/40 rounded-full blur-[100px] opacity-60 mix-blend-multiply animate-blob" />
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-200/40 rounded-full blur-[100px] opacity-60 mix-blend-multiply animate-blob animation-delay-2000" />
    </div>
);

function Toast({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) {
    return (
        <div className={`fixed bottom-4 right-4 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300 ${type === 'success' ? 'bg-indigo-900 text-white' : 'bg-red-500 text-white'
            }`}>
            {type === 'success' ? (
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            ) : (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            )}
            <span className="font-medium">{message}</span>
            <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
    );
}

function TemplateEditorContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    const [name, setName] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [fields, setFields] = useState<TemplateField[]>([]);
    const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Zoom State
    const [zoom, setZoom] = useState(1);

    // Toast State
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    // Font State
    const [customFonts, setCustomFonts] = useState<CustomFont[]>([]);
    const [isFontUploading, setIsFontUploading] = useState(false);

    // Interaction states
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [resizeStart, setResizeStart] = useState({ width: 0, fontSize: 0, mouseX: 0 });

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imgRef = useRef<HTMLImageElement | null>(null);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Check authentication
    useEffect(() => {
        const auth = sessionStorage.getItem('adminAuth');
        if (auth !== 'true') {
            router.push('/admin');
        } else {
            setIsAuthenticated(true);
        }
    }, [router]);

    // Load fonts
    useEffect(() => {
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
    }, []);

    // Load template or draft
    useEffect(() => {
        const loadData = async () => {
            const draftKey = `draft_${id || 'new'}`;
            const savedDraft = localStorage.getItem(draftKey);

            if (savedDraft) {
                try {
                    const parsed = JSON.parse(savedDraft);
                    setName(parsed.name || '');
                    setImage(parsed.image);
                    setFields(parsed.fields || []);
                    if (parsed.image) {
                        const img = new Image();
                        img.src = parsed.image;
                        img.onload = () => {
                            imgRef.current = img;
                            draw();
                        };
                    }
                    showToast('Restored unsaved draft', 'success');
                    return; // Skip DB fetch if draft exists
                } catch (e) {
                    console.error('Failed to parse draft', e);
                }
            }

            if (id) {
                fetch('/api/templates')
                    .then(res => res.json())
                    .then((data: Template[]) => {
                        const template = data.find(t => t.id === id);
                        if (template) {
                            setName(template.name);
                            setImage(template.imageUrl);
                            setFields(template.fields);

                            const img = new Image();
                            img.src = template.imageUrl;
                            img.onload = () => {
                                imgRef.current = img;
                                draw();
                            };
                        }
                    })
                    .catch(console.error);
            }
        };
        loadData();
    }, [id]);

    // Auto-save draft
    useEffect(() => {
        if (!name && !image && fields.length === 0) return;

        const draftKey = `draft_${id || 'new'}`;
        const draftData = { name, image, fields };
        localStorage.setItem(draftKey, JSON.stringify(draftData));
    }, [name, image, fields, id]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/templates/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            if (data.imageUrl) {
                setImage(data.imageUrl);
                const img = new Image();
                img.src = data.imageUrl;
                img.onload = () => {
                    imgRef.current = img;
                    draw();
                };
                showToast('Image uploaded successfully', 'success');
            }
        } catch (err: any) {
            console.error('Upload error:', err);
            showToast(err.message || 'Upload failed', 'error');
        } finally {
            setIsUploading(false);
        }
    };

    const handleFontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const fontName = prompt('Enter font name (e.g. MyHindiFont):');
        if (!fontName) return;

        setIsFontUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', fontName);

        try {
            const res = await fetch('/api/fonts', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.success && data.font) {
                setCustomFonts([...customFonts, data.font]);
                const styleEl = document.getElementById('dynamic-fonts');
                if (styleEl) {
                    styleEl.textContent += `
                        @font-face {
                            font-family: '${data.font.name}';
                            src: url('${data.font.dataUrl}');
                        }
                    `;
                }
                showToast('Font uploaded successfully', 'success');
            }
        } catch (err) {
            showToast('Font upload failed', 'error');
        } finally {
            setIsFontUploading(false);
        }
    };

    const addField = () => {
        const newField: TemplateField = {
            id: Math.random().toString(36).substr(2, 9),
            label: 'New Text',
            x: 50,
            y: 50,
            width: 300,
            fontSize: 40,
            fontWeight: 400,
            fontFamily: 'Arial',
            color: '#000000',
            alignment: 'left',
        };
        setFields([...fields, newField]);
        setSelectedFieldId(newField.id);
    };

    const updateField = (fieldId: string, updates: Partial<TemplateField>) => {
        setFields(fields.map(f => f.id === fieldId ? { ...f, ...updates } : f));
    };

    const deleteField = (fieldId: string) => {
        setFields(fields.filter(f => f.id !== fieldId));
        if (selectedFieldId === fieldId) setSelectedFieldId(null);
    };

    const getCanvasCoordinates = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        // Adjust for Zoom
        // The rect is already scaled by CSS zoom. 
        // We want coordinates relative to unscaled canvas.
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        const { x, y } = getCanvasCoordinates(e);

        if (selectedFieldId) {
            const field = fields.find(f => f.id === selectedFieldId);
            if (field) {
                const handleX = field.x + field.width;
                if (x >= handleX - 20 && x <= handleX + 20 && y >= field.y - 10 && y <= field.y + field.fontSize + 10) {
                    setIsResizing(true);
                    setResizeStart({
                        width: field.width,
                        fontSize: field.fontSize,
                        mouseX: x
                    });
                    return;
                }
            }
        }

        for (let i = fields.length - 1; i >= 0; i--) {
            const f = fields[i];
            if (x >= f.x && x <= f.x + f.width && y >= f.y && y <= f.y + f.fontSize * 1.2) {
                setSelectedFieldId(f.id);
                setIsDragging(true);
                setDragOffset({ x: x - f.x, y: y - f.y });
                return;
            }
        }
        setSelectedFieldId(null);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging && !isResizing) return;
        const { x, y } = getCanvasCoordinates(e);

        if (isDragging && selectedFieldId) {
            updateField(selectedFieldId, { x: x - dragOffset.x, y: y - dragOffset.y });
        }
        if (isResizing && selectedFieldId) {
            const field = fields.find(f => f.id === selectedFieldId);
            if (field) {
                const deltaX = x - resizeStart.mouseX;

                // Scale width
                const newWidth = Math.max(50, resizeStart.width + deltaX);

                // Scale font size proportionally
                // Ratio: NewWidth / OldWidth
                const scale = newWidth / resizeStart.width;
                const newFontSize = Math.max(10, Math.round(resizeStart.fontSize * scale));

                updateField(selectedFieldId, {
                    width: newWidth,
                    fontSize: newFontSize
                });
            }
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setIsResizing(false);
    };

    // Touch Handling
    const handleTouchStart = (e: React.TouchEvent) => { e.preventDefault(); handleMouseDown({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY } as any); };
    const handleTouchMove = (e: React.TouchEvent) => { e.preventDefault(); handleMouseMove({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY } as any); };
    const handleTouchEnd = () => handleMouseUp();

    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas || !imgRef.current) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = imgRef.current.width;
        canvas.height = imgRef.current.height;

        ctx.drawImage(imgRef.current, 0, 0);

        fields.forEach(field => {
            const isSelected = field.id === selectedFieldId;

            ctx.fillStyle = field.color;
            const weight = field.fontWeight || 400;
            ctx.font = `${weight} ${field.fontSize}px "${field.fontFamily}"`;
            ctx.textAlign = field.alignment;
            ctx.textBaseline = 'top';

            let drawX = field.x;
            if (field.alignment === 'center') drawX = field.x + field.width / 2;
            if (field.alignment === 'right') drawX = field.x + field.width;

            ctx.fillText(field.label, drawX, field.y, field.width);

            if (isSelected) {
                ctx.lineWidth = 2;
                ctx.strokeStyle = '#6366f1';
                ctx.setLineDash([5, 5]);
                ctx.strokeRect(field.x - 5, field.y - 5, field.width + 10, field.fontSize + 10);
                ctx.setLineDash([]);

                // Resize handle
                ctx.fillStyle = '#6366f1';
                ctx.beginPath();
                ctx.arc(field.x + field.width + 5, field.y + field.fontSize / 2, 8, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    };

    useEffect(() => { draw(); }, [fields, selectedFieldId]);

    const saveTemplate = async () => {
        if (!name || !image) {
            showToast('Please provide a name and upload an image', 'error');
            return;
        }

        const template: Template = {
            id: id || Math.random().toString(36).substr(2, 9),
            name,
            imageUrl: image,
            fields,
        };

        try {
            const res = await fetch('/api/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(template),
            });
            if (res.ok) {
                localStorage.removeItem(`draft_${id || 'new'}`); // Clear draft on save
                showToast('Template saved successfully!', 'success');
                setTimeout(() => router.push('/admin'), 1000);
            } else {
                showToast('Save failed', 'error');
            }
        } catch (err) {
            showToast('Save failed', 'error');
        }
    };

    const selectedField = fields.find(f => f.id === selectedFieldId);
    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans selection:bg-indigo-500/10 selection:text-indigo-700">
            <BackgroundEffects />
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Top Bar */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-6 h-16 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <Link href="/admin" className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all">
                        <Icons.Back />
                    </Link>
                    <div className="h-6 w-px bg-slate-200" />
                    <div>
                        <h1 className="text-lg font-bold text-slate-900 leading-tight">
                            {id ? 'Edit Template' : 'New Design'}
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden md:block">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Template Name..."
                            className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none w-64 transition-all"
                        />
                    </div>
                    <button
                        onClick={saveTemplate}
                        className="flex items-center bg-indigo-600 text-white px-5 py-2 rounded-full font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all active:scale-95"
                    >
                        <Icons.Save /> Save
                    </button>
                </div>
            </header>

            <div className="relative z-10 max-w-[1800px] mx-auto p-4 lg:p-6 h-[calc(100vh-64px)] grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Left: Canvas Area */}
                <div className="lg:col-span-8 flex flex-col h-full gap-4">
                    <div className="md:hidden">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Template Name..."
                            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    <div className="flex-1 bg-white/50 backdrop-blur rounded-3xl border border-slate-200/60 shadow-sm relative overflow-hidden flex items-center justify-center p-8 group">
                        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

                        {/* Image Loading Spinner */}
                        {isUploading && (
                            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600 mb-4"></div>
                                <p className="text-indigo-600 font-bold animate-pulse">Uploading Image...</p>
                            </div>
                        )}

                        {!image ? (
                            <div className="text-center">
                                <label className="relative cursor-pointer group flex flex-col items-center justify-center w-full max-w-lg mx-auto p-12 border-3 border-dashed border-slate-300 rounded-3xl hover:border-indigo-500 hover:bg-indigo-50/50 transition-all duration-300">
                                    <div className="w-20 h-20 bg-white rounded-2xl shadow-md flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                        <Icons.Image />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800">Upload Base Design</h3>
                                    <p className="text-slate-500 mt-2 text-sm">Drag & drop your certificate image or click to browse</p>
                                    <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
                                </label>
                            </div>
                        ) : (
                            <div
                                className="relative shadow-2xl shadow-slate-900/10 rounded-lg overflow-hidden ring-1 ring-slate-900/5 max-h-full max-w-full transition-transform duration-200 ease-out"
                                style={{ transform: `scale(${zoom})` }}
                            >
                                <canvas
                                    ref={canvasRef}
                                    onMouseDown={handleMouseDown}
                                    onMouseMove={handleMouseMove}
                                    onMouseUp={handleMouseUp}
                                    onMouseLeave={handleMouseUp}
                                    onTouchStart={handleTouchStart}
                                    onTouchMove={handleTouchMove}
                                    onTouchEnd={handleTouchEnd}
                                    className={`block max-w-full max-h-[80vh] w-auto h-auto object-contain ${isDragging ? 'cursor-move' : isResizing ? 'cursor-ew-resize' : 'cursor-default'}`}
                                />
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => setImage(null)}
                                        className="bg-white text-red-500 p-2 rounded-lg shadow-lg hover:bg-red-50 transition border border-slate-100"
                                        title="Remove Image"
                                    >
                                        <Icons.Trash />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Bottom Toolbar */}
                    {image && (
                        <div className="flex justify-between items-center bg-white rounded-2xl p-3 px-6 shadow-sm border border-slate-200">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Canvas View</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}
                                    className="flex items-center text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                    <Icons.ZoomOut /> Zoom Out
                                </button>
                                <span className="text-sm font-bold text-slate-400 py-1.5 px-2">{Math.round(zoom * 100)}%</span>
                                <button
                                    onClick={() => setZoom(z => Math.min(2, z + 0.1))}
                                    className="flex items-center text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                    <Icons.ZoomIn /> Zoom In
                                </button>
                                <button
                                    className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors ml-4"
                                    onClick={() => {
                                        if (imgRef.current) {
                                            canvasRef.current!.width = imgRef.current.width;
                                            setZoom(1);
                                            draw();
                                        }
                                    }}
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Properties Panel */}
                <div className="lg:col-span-4 h-full overflow-y-auto pr-1 pb-10 custom-scrollbar">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col overflow-hidden min-h-full">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h2 className="font-bold text-slate-800">Layers & Properties</h2>
                            <button
                                onClick={addField}
                                className="bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-semibold hover:border-indigo-500 hover:text-indigo-600 transition shadow-sm flex items-center"
                            >
                                <Icons.Plus /> Add Text
                            </button>
                        </div>

                        <div className="p-5 border-b border-slate-100 bg-white">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Layers</h3>
                            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                                {fields.length === 0 ? (
                                    <div className="text-center py-6 border-2 border-dashed border-slate-100 rounded-xl">
                                        <p className="text-sm text-slate-400">No text layers yet.</p>
                                    </div>
                                ) : (
                                    fields.map(field => (
                                        <div
                                            key={field.id}
                                            onClick={() => setSelectedFieldId(field.id)}
                                            className={`p-3 rounded-xl border cursor-pointer flex justify-between items-center transition-all group ${selectedFieldId === field.id
                                                ? 'border-indigo-500 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-500/20'
                                                : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${selectedFieldId === field.id ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500'}`}>T</div>
                                                <span className={`text-sm font-medium truncate ${selectedFieldId === field.id ? 'text-indigo-900' : 'text-slate-600'}`}>{field.label}</span>
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); deleteField(field.id); }}
                                                className={`p-1.5 rounded-md hover:bg-red-50 hover:text-red-500 transition-colors ${selectedFieldId === field.id ? 'text-indigo-300' : 'text-slate-300 opacity-0 group-hover:opacity-100'}`}
                                            >
                                                <Icons.Trash />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {selectedField ? (
                            <div className="p-6 space-y-6 bg-white animate-in slide-in-from-right-4 duration-300">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Text Content</label>
                                    <input
                                        type="text"
                                        value={selectedField.label}
                                        onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Font Family</label>
                                        <div className="flex gap-2">
                                            <select
                                                value={selectedField.fontFamily}
                                                onChange={(e) => updateField(selectedField.id, { fontFamily: e.target.value })}
                                                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none appearance-none font-medium text-slate-700"
                                            >
                                                <option value="Arial">Arial</option>
                                                <option value="Times New Roman">Times New Roman</option>
                                                <option value="Courier New">Courier New</option>
                                                {customFonts.map(font => (
                                                    <option key={font.id} value={font.name} style={{ fontFamily: font.name }}>{font.name}</option>
                                                ))}
                                            </select>
                                            <label className="bg-white border border-slate-200 text-slate-600 px-3 rounded-xl cursor-pointer hover:border-indigo-500 hover:text-indigo-600 transition flex items-center justify-center shadow-sm" title="Upload Custom Font">
                                                <input type="file" className="hidden" accept=".ttf,.woff,.woff2" onChange={handleFontUpload} disabled={isFontUploading} />
                                                <Icons.Plus />
                                            </label>
                                        </div>
                                    </div>

                                    <div className="col-span-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex justify-between">
                                            <span>Size</span>
                                            <span className="text-indigo-600">{selectedField.fontSize}px</span>
                                        </label>
                                        <div className="flex gap-2 items-center">
                                            <input
                                                type="range"
                                                min="10"
                                                max="200"
                                                value={selectedField.fontSize}
                                                onChange={(e) => updateField(selectedField.id, { fontSize: parseInt(e.target.value) })}
                                                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                            />
                                            <input
                                                type="number"
                                                value={selectedField.fontSize}
                                                onChange={(e) => updateField(selectedField.id, { fontSize: parseInt(e.target.value) })}
                                                className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-sm text-center outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="col-span-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Color</label>
                                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2">
                                            <input
                                                type="color"
                                                value={selectedField.color}
                                                onChange={(e) => updateField(selectedField.id, { color: e.target.value })}
                                                className="w-8 h-8 rounded-lg cursor-pointer border-none p-0 bg-transparent"
                                            />
                                            <span className="text-xs font-mono text-slate-500 uppercase flex-1 text-center">{selectedField.color}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Weight: {selectedField.fontWeight || 400}</label>
                                    <input
                                        type="range"
                                        min="100"
                                        max="900"
                                        step="10"
                                        value={selectedField.fontWeight || 400}
                                        onChange={(e) => updateField(selectedField.id, { fontWeight: parseInt(e.target.value) })}
                                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                    />
                                    <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
                                        <span>Thin</span>
                                        <span>Regular</span>
                                        <span>Bold</span>
                                        <span>Heavy</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Alignment</label>
                                    <div className="flex bg-slate-100 rounded-xl p-1">
                                        {['left', 'center', 'right'].map((align) => (
                                            <button
                                                key={align}
                                                onClick={() => updateField(selectedField.id, { alignment: align as any })}
                                                className={`flex-1 py-2 rounded-lg flex justify-center transition-all ${selectedField.alignment === align
                                                    ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5'
                                                    : 'text-slate-400 hover:text-slate-600'
                                                    }`}
                                            >
                                                {align === 'left' && <Icons.AlignLeft />}
                                                {align === 'center' && <Icons.AlignCenter />}
                                                {align === 'right' && <Icons.AlignRight />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-10 flex flex-col items-center justify-center text-center h-64 bg-slate-50/50">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                                    <span className="text-2xl">👆</span>
                                </div>
                                <h3 className="font-bold text-slate-700">No Layer Selected</h3>
                                <p className="text-sm text-slate-400 mt-1 max-w-[200px]">Click on a text layer in the canvas or list to edit its properties.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function TemplateEditor() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div></div>}>
            <TemplateEditorContent />
        </Suspense>
    );
}