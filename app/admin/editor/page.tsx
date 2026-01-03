'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Template, TemplateField } from '@/lib/storage';

export default function TemplateEditor() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    const [name, setName] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [fields, setFields] = useState<TemplateField[]>([]);
    const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imgRef = useRef<HTMLImageElement | null>(null);

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
                });
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
            alert('Upload failed');
        } finally {
            setIsUploading(false);
        }
    };

    const addField = () => {
        const newField: TemplateField = {
            id: Math.random().toString(36).substr(2, 9),
            label: 'New Field',
            x: 50,
            y: 50,
            width: 300,
            fontSize: 40,
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

    // Interaction states
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

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

        // Check for resize handle click (right edge of selected field)
        if (selectedFieldId) {
            const field = fields.find(f => f.id === selectedFieldId);
            if (field) {
                const handleSize = 10; // Handle hit area
                // Handle is at (x + width, y + height/2) roughly, or just right edge
                // Let's put a handle at the mid-right
                const handleX = field.x + field.width;
                const handleY = field.y + (field.fontSize / 2); // Approximate middle

                // Simple distance check or box check for handle
                if (
                    x >= handleX - 10 && x <= handleX + 10 &&
                    y >= field.y && y <= field.y + field.fontSize * 1.5
                ) {
                    setIsResizing(true);
                    return;
                }
            }
        }

        // Check for field click
        // Reverse loop to select top-most element
        for (let i = fields.length - 1; i >= 0; i--) {
            const f = fields[i];
            if (
                x >= f.x && x <= f.x + f.width &&
                y >= f.y && y <= f.y + f.fontSize * 1.2
            ) {
                setSelectedFieldId(f.id);
                setIsDragging(true);
                setDragOffset({ x: x - f.x, y: y - f.y });
                return;
            }
        }

        // Deselect if clicked empty space
        setSelectedFieldId(null);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging && !isResizing) return;

        const { x, y } = getCanvasCoordinates(e);

        if (isDragging && selectedFieldId) {
            updateField(selectedFieldId, {
                x: x - dragOffset.x,
                y: y - dragOffset.y
            });
        }

        if (isResizing && selectedFieldId) {
            const field = fields.find(f => f.id === selectedFieldId);
            if (field) {
                const newWidth = Math.max(50, x - field.x); // Min width 50
                updateField(selectedFieldId, { width: newWidth });
            }
        }
    };

    const handleMouseUp = () => {
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

            // Draw Text
            ctx.fillStyle = field.color;
            ctx.font = `${field.fontSize}px ${field.fontFamily}`;
            ctx.textAlign = field.alignment;
            ctx.textBaseline = 'top'; // Easier for coordinate math

            let drawX = field.x;
            if (field.alignment === 'center') drawX = field.x + field.width / 2;
            if (field.alignment === 'right') drawX = field.x + field.width;

            ctx.fillText(field.label, drawX, field.y, field.width);

            // Draw Selection UI
            ctx.lineWidth = 2;
            if (isSelected) {
                // Border
                ctx.strokeStyle = '#3b82f6'; // Blue
                ctx.setLineDash([5, 5]);
                ctx.strokeRect(field.x - 5, field.y - 5, field.width + 10, field.fontSize + 10);
                ctx.setLineDash([]);

                // Resize Handle (Right edge)
                ctx.fillStyle = '#3b82f6';
                ctx.beginPath();
                ctx.arc(field.x + field.width + 5, field.y + field.fontSize / 2, 6, 0, Math.PI * 2);
                ctx.fill();

                // Show dimensions or labels
                ctx.fillStyle = '#3b82f6';
                ctx.font = 'bold 12px sans-serif';
                ctx.textAlign = 'left';
                ctx.fillText('Resize', field.x + field.width + 15, field.y + field.fontSize / 2 + 4);
            } else {
                // Dims for unselected
                ctx.strokeStyle = 'rgba(0,0,0,0.2)';
                ctx.strokeRect(field.x, field.y, field.width, field.fontSize);
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
            }
        } catch (err) {
            alert('Save failed');
        }
    };

    const selectedField = fields.find(f => f.id === selectedFieldId);

    return (
        <div className="p-8 max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">{id ? 'Edit Template' : 'New Template'}</h1>
                    <button
                        onClick={saveTemplate}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-semibold"
                    >
                        Save Template
                    </button>
                </div>

                <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Template Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2"
                            placeholder="e.g. Birthday Invitation"
                        />
                    </div>

                    {!image ? (
                        <div className="border-2 border-dashed rounded-xl p-12 text-center">
                            <input
                                type="file"
                                id="file-upload"
                                className="hidden"
                                onChange={handleFileUpload}
                                accept="image/*"
                            />
                            <label htmlFor="file-upload" className="cursor-pointer text-blue-600 hover:text-blue-700">
                                {isUploading ? 'Uploading...' : 'Click to upload base image'}
                            </label>
                        </div>
                    ) : (
                        <div className="relative border rounded-lg overflow-hidden bg-gray-50 flex justify-center items-start overflow-auto max-h-[70vh]">
                            <canvas
                                ref={canvasRef}
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                                className={`max-w-full h-auto shadow-sm ${isDragging ? 'cursor-move' : isResizing ? 'cursor-ew-resize' : 'cursor-default'}`}
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl border shadow-sm sticky top-8">
                    <h2 className="font-bold mb-4 flex justify-between items-center">
                        Fields
                        <button
                            onClick={addField}
                            className="text-sm bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100"
                        >
                            + Add Field
                        </button>
                    </h2>

                    <div className="space-y-4">
                        {fields.map(field => (
                            <button
                                key={field.id}
                                onClick={() => setSelectedFieldId(field.id)}
                                className={`w-full text-left p-3 rounded-lg border flex justify-between items-center ${selectedFieldId === field.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                                    }`}
                            >
                                <span className="font-medium truncate">{field.label}</span>
                                <span className="text-xs text-gray-400">{field.x}, {field.y}</span>
                            </button>
                        ))}
                    </div>

                    {selectedField && (
                        <div className="mt-8 pt-8 border-t space-y-4">
                            <h3 className="font-semibold text-blue-600">Edit Field: {selectedField.label}</h3>

                            <div>
                                <label className="block text-xs font-medium uppercase text-gray-500 mb-1">Label</label>
                                <input
                                    type="text"
                                    value={selectedField.label}
                                    onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                                    className="w-full border rounded px-2 py-1 text-sm"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-medium mb-1">X Position</label>
                                    <input type="number" value={selectedField.x} onChange={(e) => updateField(selectedField.id, { x: parseInt(e.target.value) })} className="w-full border rounded px-2 py-1 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium mb-1">Y Position</label>
                                    <input type="number" value={selectedField.y} onChange={(e) => updateField(selectedField.id, { y: parseInt(e.target.value) })} className="w-full border rounded px-2 py-1 text-sm" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium mb-1">Width (Paragraph Wrap)</label>
                                <input type="number" value={selectedField.width} onChange={(e) => updateField(selectedField.id, { width: parseInt(e.target.value) })} className="w-full border rounded px-2 py-1 text-sm" />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-medium mb-1">Font Size</label>
                                    <input type="number" value={selectedField.fontSize} onChange={(e) => updateField(selectedField.id, { fontSize: parseInt(e.target.value) })} className="w-full border rounded px-2 py-1 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium mb-1">Color</label>
                                    <input type="color" value={selectedField.color} onChange={(e) => updateField(selectedField.id, { color: e.target.value })} className="w-full h-8 border rounded px-1 py-1 text-sm" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium mb-1">Alignment</label>
                                <select
                                    value={selectedField.alignment}
                                    onChange={(e) => updateField(selectedField.id, { alignment: e.target.value as any })}
                                    className="w-full border rounded px-2 py-1 text-sm"
                                >
                                    <option value="left">Left</option>
                                    <option value="center">Center</option>
                                    <option value="right">Right</option>
                                </select>
                            </div>

                            <button
                                onClick={() => deleteField(selectedField.id)}
                                className="w-full mt-4 text-red-600 text-sm hover:bg-red-50 py-1 rounded"
                            >
                                Delete Field
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
