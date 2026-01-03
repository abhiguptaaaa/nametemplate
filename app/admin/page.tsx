'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Template } from '@/lib/storage';

export default function AdminDashboard() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/templates')
            .then(res => res.json())
            .then(data => {
                setTemplates(data);
                setLoading(false);
            });
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Dashboard</h1>
                        <p className="text-slate-500 mt-1">Manage your templates and designs</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/" className="text-slate-500 hover:text-indigo-600 font-medium text-sm transition-colors">
                            View Site
                        </Link>
                        <Link
                            href="/admin/editor"
                            className="bg-indigo-600 text-white px-5 py-2.5 rounded-full hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 font-bold flex items-center gap-2"
                        >
                            <span>+</span> Create New Template
                        </Link>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                ) : templates.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-300">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✨</div>
                        <p className="text-slate-900 font-bold text-lg">No templates yet</p>
                        <p className="text-slate-500 mb-6">Create your first template to get started.</p>
                        <Link href="/admin/editor" className="text-indigo-600 hover:underline font-medium">
                            Create your first template
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {templates.map(template => (
                            <div key={template.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200">
                                <div className="aspect-video bg-slate-100 relative overflow-hidden text-center">
                                    <img
                                        src={template.imageUrl}
                                        alt={template.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                </div>
                                <div className="p-5 flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-slate-900 line-clamp-1">{template.name}</h3>
                                        <p className="text-xs text-slate-500">{template.fields.length} Fields</p>
                                    </div>
                                    <Link
                                        href={`/admin/editor?id=${template.id}`}
                                        className="text-slate-400 hover:text-indigo-600 p-2 hover:bg-indigo-50 rounded-full transition-all"
                                        title="Edit Template"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
