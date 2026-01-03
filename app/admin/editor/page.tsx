'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Template, TemplateField, CustomFont } from '@/lib/storage';

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

    // Font State
    const [customFonts, setCustomFonts] = useState<CustomFont[]>([]);
    const [isFontUploading, setIsFontUploading] = useState(false);

    // Interaction states
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imgRef = useRef<HTMLImageElement | null>(null);

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
    }, []);

    // Load template
    useEffect(() => {
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
    }, [id]);

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
            }
        } catch (err) {
            console.error('Upload error:', err);
            alert(`Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
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
                alert('Font uploaded!');
            }
        } catch (err) {
            console.error('Font upload failed:', err);
            alert('Font upload failed');
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
                const newWidth = Math.max(50, x - field.x);
                updateField(selectedFieldId, { width: newWidth });
            }
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setIsResizing(false);
    };

    // Touch Handling
    const getTouchCoordinates = (e: React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const touch = e.touches[0];
        return {
            x: (touch.clientX - rect.left) * scaleX,
            y: (touch.clientY - rect.top) * scaleY
        };
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        e.preventDefault();
        const { x, y } = getTouchCoordinates(e);

        if (selectedFieldId) {
            const field = fields.find(f => f.id === selectedFieldId);
            if (field) {
                const handleX = field.x + field.width;
                if (x >= handleX - 20 && x <= handleX + 20 && y >= field.y - 10 && y <= field.y + field.fontSize + 10) {
                    setIsResizing(true);
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

    const handleTouchMove = (e: React.TouchEvent) => {
        e.preventDefault();
        if (!isDragging && !isResizing) return;
        const { x, y } = getTouchCoordinates(e);

        if (isDragging && selectedFieldId) {
            updateField(selectedFieldId, { x: x - dragOffset.x, y: y - dragOffset.y });
        }
        if (isResizing && selectedFieldId) {
            const field = fields.find(f => f.id === selectedFieldId);
            if (field) {
                const newWidth = Math.max(50, x - field.x);
                updateField(selectedFieldId, { width: newWidth });
            }
        }
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
        setIsResizing(false);
    };

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
                ctx.strokeStyle = '#3b82f6';
                ctx.setLineDash([5, 5]);
                ctx.strokeRect(field.x - 5, field.y - 5, field.width + 10, field.fontSize + 10);
                ctx.setLineDash([]);

                // Resize handle
                ctx.fillStyle = '#3b82f6';
                ctx.beginPath();
                ctx.arc(field.x + field.width + 5, field.y + field.fontSize / 2, 8, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    };

    useEffect(() => {
        draw();
    }, [fields, selectedFieldId]);

    const saveTemplate = async () => {
        if (!name || !image) {
            alert('Please provide a name and upload an image');
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
                router.push('/admin');
            } else {
                alert('Save failed');
            }
        } catch (err) {
            alert('Save failed');
        }
    };

    const selectedField = fields.find(f => f.id === selectedFieldId);

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-indigo-100 via-slate-100 to-indigo-100 p-4 lg:p-8">
            <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

                {/* Left Column: Canvas Area */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/50 shadow-sm">
                        <div>
                            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                                {id ? 'Edit Template' : 'New Template'}
                            </h1>
                            <p className="text-sm text-slate-500">Design your certificate or card</p>
                        </div>
                        <button
                            onClick={saveTemplate}
                            className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-8 py-2.5 rounded-full hover:shadow-lg hover:shadow-indigo-500/30 transition-all font-semibold active:scale-95"
                        >
                            Save Template
                        </button>
                    </div>

                    <div className="bg-white/40 backdrop-blur-xl p-4 lg:p-8 rounded-3xl border border-white/60 shadow-xl shadow-indigo-100/50">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Template Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-white/50 border border-indigo-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 outline-none transition"
                                placeholder="e.g. Certificate of Achievement"
                            />
                        </div>

                        <div className="mt-6">
                            {!image ? (
                                <div className="border-3 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/30 hover:bg-indigo-50/50 rounded-2xl p-12 text-center transition-all cursor-pointer group">
                                    <input
                                        type="file"
                                        id="file-upload"
                                        className="hidden"
                                        onChange={handleFileUpload}
                                        accept="image/*"
                                    />
                                    <label htmlFor="file-upload" className="cursor-pointer block">
                                        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm text-indigo-500 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        </div>
                                        <span className="text-lg font-semibold text-indigo-900">Upload Base Image</span>
                                        <p className="text-sm text-indigo-400 mt-1">Click to select a certificate or card background</p>
                                    </label>
                                </div>
                            ) : (
                                <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-slate-200/50 bg-slate-800 ring-4 ring-white">
                                    <div className="overflow-auto max-h-[60vh] flex justify-center bg-[url('/grid.svg')]">
                                        <canvas
                                            ref={canvasRef}
                                            onMouseDown={handleMouseDown}
                                            onMouseMove={handleMouseMove}
                                            onMouseUp={handleMouseUp}
                                            onMouseLeave={handleMouseUp}
                                            onTouchStart={handleTouchStart}
                                            onTouchMove={handleTouchMove}
                                            onTouchEnd={handleTouchEnd}
                                            className={`max-w-full h-auto ${isDragging ? 'cursor-move' : isResizing ? 'cursor-ew-resize' : 'cursor-default'}`}
                                            style={{ touchAction: 'none' }}
                                        />
                                    </div>
                                    <button
                                        onClick={() => setImage(null)}
                                        className="absolute top-4 right-4 bg-white/90 backdrop-blur text-red-500 p-2 rounded-xl shadow-lg hover:bg-red-50 transition"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Controls */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white/50 shadow-xl shadow-indigo-100/50 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto custom-scrollbar">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm">Tt</span>
                                Text Fields
                            </h2>
                            <button
                                onClick={addField}
                                className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 active:scale-95"
                            >
                                + Add Text
                            </button>
                        </div>

                        <div className="space-y-3 mb-8">
                            {fields.map(field => (
                                <div
                                    key={field.id}
                                    onClick={() => setSelectedFieldId(field.id)}
                                    className={`p-3 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${selectedFieldId === field.id
                                            ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500'
                                            : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-8 rounded-full ${selectedFieldId === field.id ? 'bg-indigo-500' : 'bg-slate-300'}`} />
                                        <span className="font-medium text-slate-700 truncate">{field.label}</span>
                                    </div>
                                    {selectedFieldId === field.id && (
                                        <span className="text-xs bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded-full font-bold">Edit</span>
                                    )}
                                </div>
                            ))}
                            {fields.length === 0 && (
                                <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-dashed text-sm">
                                    No fields added yet.<br />Click "+ Add Text" to start.
                                </div>
                            )}
                        </div>

                        {selectedField && (
                            <div className="space-y-5 animate-in slide-in-from-right-4 fade-in duration-200">
                                <div className="border-t border-slate-200 pt-6">
                                    <div className="flex justify-between items-end mb-4">
                                        <h3 className="font-bold text-indigo-900">Edit Selected Field</h3>
                                        <button
                                            onClick={() => deleteField(selectedField.id)}
                                            className="text-red-500 text-xs font-semibold hover:bg-red-50 px-2 py-1 rounded transition"
                                        >
                                            Delete
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Label Text</label>
                                            <input
                                                type="text"
                                                value={selectedField.label}
                                                onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                            />
                                        </div>

                                        {/* Font Family Selector */}
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Font Family</label>
                                            <div className="flex gap-2">
                                                <select
                                                    value={selectedField.fontFamily}
                                                    onChange={(e) => updateField(selectedField.id, { fontFamily: e.target.value })}
                                                    className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                                >
                                                    <option value="Arial">Arial</option>
                                                    <option value="Times New Roman">Times New Roman</option>
                                                    <option value="Courier New">Courier New</option>
                                                    {customFonts.map(font => (
                                                        <option key={font.id} value={font.name} style={{ fontFamily: font.name }}>{font.name}</option>
                                                    ))}
                                                </select>
                                                <label className="bg-indigo-50 text-indigo-600 px-3 py-2 rounded-lg cursor-pointer hover:bg-indigo-100 transition whitespace-nowrap text-sm font-bold flex items-center">
                                                    <input type="file" className="hidden" accept=".ttf,.woff,.woff2" onChange={handleFontUpload} disabled={isFontUploading} />
                                                    {isFontUploading ? '...' : '+ Font'}
                                                </label>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Font Size</label>
                                                <input
                                                    type="number"
                                                    value={selectedField.fontSize}
                                                    onChange={(e) => updateField(selectedField.id, { fontSize: parseInt(e.target.value) })}
                                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Boldness ({selectedField.fontWeight || 400})</label>
                                                <input
                                                    type="range"
                                                    min="100"
                                                    max="900"
                                                    step="100"
                                                    value={selectedField.fontWeight || 400}
                                                    onChange={(e) => updateField(selectedField.id, { fontWeight: parseInt(e.target.value) })}
                                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 my-3"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Color</label>
                                            <div className="flex gap-2 items-center">
                                                <input
                                                    type="color"
                                                    value={selectedField.color}
                                                    onChange={(e) => updateField(selectedField.id, { color: e.target.value })}
                                                    className="w-10 h-10 border border-slate-200 rounded-lg cursor-pointer"
                                                />
                                                <span className="text-xs font-mono text-slate-500">{selectedField.color}</span>
                                            </div>
                                        </div>

                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Alignment</label>
                                            <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
                                                {['left', 'center', 'right'].map((align) => (
                                                    <button
                                                        key={align}
                                                        onClick={() => updateField(selectedField.id, { alignment: align as any })}
                                                        className={`flex-1 py-1.5 rounded-md text-xs font-bold capitalize transition-all ${selectedField.alignment === align
                                                                ? 'bg-indigo-100 text-indigo-700 shadow-sm'
                                                                : 'text-slate-400 hover:text-slate-600'
                                                            }`}
                                                    >
                                                        {align}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
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
