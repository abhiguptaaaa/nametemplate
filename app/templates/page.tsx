'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Template } from '@/lib/storage';

const Icons = {
    Sparkles: () => (
        <svg className="w-4 h-4 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
    ),
    ArrowRight: () => (
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
    ),
    FolderOpen: () => (
        <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
        </svg>
    )
};

const BackgroundEffects = () => (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-200/40 rounded-full blur-[100px] opacity-60 mix-blend-multiply animate-blob" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-[100px] opacity-60 mix-blend-multiply animate-blob animation-delay-2000" />
    </div>
);

export default function TemplatesPage() {
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
        <div className="min-h-screen bg-[#FAFAFA] text-slate-900 font-sans selection:bg-indigo-500/10 selection:text-indigo-700">
            <BackgroundEffects />

            {/* Header */}
            <header className="fixed w-full top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/50 shadow-sm supports-[backdrop-filter]:bg-white/60">
                <div className="max-w-7xl mx-auto px-6 h-16 md:h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 -ml-2 text-slate-500 hover:text-slate-900 hover:bg-black/5 rounded-full transition-all">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        </Link>
                        <h1 className="text-xl font-bold text-slate-900">All Templates</h1>
                    </div>
                </div>
            </header>

            <main className="relative z-10 pt-28 pb-20 px-6 max-w-7xl mx-auto">
                <div className="mb-10 text-center md:text-left">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Browse Collection</h2>
                    <p className="text-slate-500 max-w-xl text-lg">Explore our diverse collection of professionally designed templates. Click 'Use Template' to customize.</p>
                </div>

                {!loading && templates.length > 0 && (
                    <div className="bg-white inline-block px-4 py-2 rounded-full border border-slate-200 text-sm font-medium text-slate-600 shadow-sm mb-8">
                        {templates.length} Designs Available
                    </div>
                )}

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-3xl h-[400px] border border-slate-100 shadow-sm p-4 space-y-4">
                                <div className="w-full h-48 bg-slate-100 rounded-2xl animate-pulse" />
                                <div className="h-6 w-2/3 bg-slate-100 rounded animate-pulse" />
                                <div className="h-4 w-1/2 bg-slate-100 rounded animate-pulse" />
                            </div>
                        ))}
                    </div>
                ) : templates.length === 0 ? (
                    <div className="text-center py-32 bg-white/50 backdrop-blur-sm rounded-3xl border border-dashed border-slate-300">
                        <Icons.FolderOpen />
                        <h3 className="text-xl font-bold text-slate-900">No Templates Found</h3>
                        <p className="text-slate-500 mt-2 max-w-sm mx-auto">It looks quiet here. Check back later or ask an admin to upload new designs.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {templates.map((template, idx) => (
                            <Link
                                key={template.id}
                                href={`/create/${template.id}`}
                                className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-1"
                            >
                                {/* Image Container */}
                                <div className="aspect-[4/3] bg-gradient-to-br from-slate-50 to-slate-100 relative overflow-hidden flex items-center justify-center p-4">
                                    <img
                                        src={template.imageUrl}
                                        alt={template.name}
                                        loading="lazy"
                                        className="max-w-full max-h-full object-contain transition-transform duration-700 ease-in-out group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-indigo-900/0 group-hover:bg-indigo-900/10 transition-colors duration-300" />
                                </div>

                                {/* Card Body */}
                                <div className="p-6 flex flex-col flex-grow">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="font-bold text-xl text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">{template.name}</h3>
                                        {idx < 2 && (
                                            <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border border-indigo-100">New</span>
                                        )}
                                    </div>

                                    <div className="flex items-center text-sm text-slate-500 mb-6">
                                        <Icons.Sparkles />
                                        <span className="ml-2">{template.fields.length} Editable Fields</span>
                                    </div>

                                    <div className="mt-auto w-full bg-slate-50 text-slate-900 font-bold py-3 px-4 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all flex items-center justify-center gap-2 border border-slate-200 group-hover:border-indigo-600">
                                        Use Template <Icons.ArrowRight />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
