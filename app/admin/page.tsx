'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Template } from '@/lib/storage';

// --- Shared UI Components ---

const Icons = {
    Lock: () => (
        <svg className="w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
    ),
    User: () => (
        <svg className="w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    ),
    Plus: () => (
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
    ),
    Edit: () => (
        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
    ),
    Trash: () => (
        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
    ),
    Logout: () => (
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
    ),
    External: () => (
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
    )
};

const BackgroundEffects = () => (
    <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-200/40 rounded-full blur-[100px] opacity-60 mix-blend-multiply animate-blob" />
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-200/40 rounded-full blur-[100px] opacity-60 mix-blend-multiply animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-20%] left-[20%] w-[500px] h-[500px] bg-blue-200/40 rounded-full blur-[100px] opacity-60 mix-blend-multiply animate-blob animation-delay-4000" />
    </div>
);

// --- Main Component ---

export default function AdminDashboard() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const auth = sessionStorage.getItem('adminAuth');
        if (auth === 'true') {
            setIsAuthenticated(true);
            loadTemplates();
        } else {
            setLoading(false);
        }
    }, []);

    const loadTemplates = () => {
        fetch('/api/templates')
            .then(res => res.json())
            .then(data => {
                setTemplates(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to load templates:', err);
                setLoading(false);
            });
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (username === 'abhi' && password === 'abHI0905@@') {
            sessionStorage.setItem('adminAuth', 'true');
            setIsAuthenticated(true);
            loadTemplates();
        } else {
            setError('Invalid username or password');
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem('adminAuth');
        setIsAuthenticated(false);
        setUsername('');
        setPassword('');
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this template? This action cannot be undone.')) return;
        try {
            const res = await fetch(`/api/templates?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setTemplates(templates.filter(t => t.id !== id));
            } else {
                alert('Failed to delete template');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete template');
        }
    };

    // --- Login View ---
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6 relative overflow-hidden font-sans">
                <BackgroundEffects />

                <div className="w-full max-w-md relative z-10">
                    <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl shadow-indigo-500/10 border border-white/50 p-8 md:p-10">
                        <div className="text-center mb-10">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-indigo-500/30 mx-auto mb-6">
                                N
                            </div>
                            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h1>
                            <p className="text-slate-500 mt-2 font-medium">Sign in to manage templates</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-1 group">
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Username</label>
                                <div className="relative flex items-center">
                                    <div className="absolute left-4"><Icons.User /></div>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm font-medium text-slate-800 placeholder:text-slate-300"
                                        placeholder="Admin ID"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1 group">
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Password</label>
                                <div className="relative flex items-center">
                                    <div className="absolute left-4"><Icons.Lock /></div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm font-medium text-slate-800 placeholder:text-slate-300"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center animate-pulse">
                                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="w-full bg-slate-900 text-white py-4 rounded-2xl hover:bg-slate-800 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all font-bold tracking-wide shadow-lg"
                            >
                                Sign In
                            </button>
                        </form>

                        <div className="mt-8 text-center pt-6 border-t border-slate-100">
                            <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-indigo-600 transition-colors">
                                <span className="mr-1">←</span> Back to Homepage
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- Dashboard View ---
    return (
        <div className="min-h-screen bg-[#FAFAFA] text-slate-900 font-sans selection:bg-indigo-500/10 selection:text-indigo-700">
            <BackgroundEffects />

            {/* Sticky Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 supports-[backdrop-filter]:bg-white/60">
                <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-sm">A</div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900">Nora Admin</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/"
                            className="hidden md:flex items-center px-4 py-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors rounded-full hover:bg-slate-50"
                        >
                            <Icons.External /> View Site
                        </Link>
                        <div className="h-6 w-px bg-slate-200 hidden md:block" />
                        <button
                            onClick={handleLogout}
                            className="flex items-center px-4 py-2 text-sm font-medium text-slate-500 hover:text-red-600 transition-colors rounded-full hover:bg-red-50"
                        >
                            <Icons.Logout /> Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="relative z-10 max-w-7xl mx-auto px-6 py-10">

                {/* Dashboard Toolbar */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Dashboard</h2>
                        <p className="text-slate-500 text-lg">Manage your design library and configurations.</p>
                    </div>
                    <Link
                        href="/admin/editor?new=true"
                        className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-full font-semibold shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all active:scale-95"
                    >
                        <Icons.Plus /> Create New Template
                    </Link>
                </div>

                {/* Content Area */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-3xl border border-slate-100 p-4 shadow-sm h-[320px] flex flex-col gap-4">
                                <div className="w-full h-40 bg-slate-100 rounded-2xl animate-pulse" />
                                <div className="h-6 w-3/4 bg-slate-100 rounded animate-pulse" />
                                <div className="h-4 w-1/2 bg-slate-100 rounded animate-pulse" />
                                <div className="mt-auto flex gap-2">
                                    <div className="h-10 w-full bg-slate-100 rounded-xl animate-pulse" />
                                    <div className="h-10 w-full bg-slate-100 rounded-xl animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : templates.length === 0 ? (
                    <div className="text-center py-32 bg-white/60 backdrop-blur-sm rounded-3xl border border-dashed border-slate-300 max-w-2xl mx-auto">
                        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600">
                            <Icons.Plus />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">No templates yet</h3>
                        <p className="text-slate-500 mb-8 max-w-sm mx-auto">Your library is empty. Create your first certificate or card template to get started.</p>
                        <Link
                            href="/admin/editor?new=true"
                            className="inline-flex items-center px-6 py-3 bg-white border border-slate-300 shadow-sm text-slate-700 font-medium rounded-full hover:bg-slate-50 hover:border-slate-400 transition-all"
                        >
                            Create Template
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {templates.map(template => (
                            <div key={template.id} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 border border-slate-200 flex flex-col">
                                {/* Preview Image */}
                                <div className="aspect-[16/9] bg-slate-100 relative overflow-hidden">
                                    <img
                                        src={template.imageUrl}
                                        alt={template.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </div>

                                {/* Details */}
                                <div className="p-6 flex flex-col flex-grow">
                                    <div className="mb-4">
                                        <h3 className="font-bold text-xl text-slate-900 mb-1">{template.name}</h3>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                            {template.fields.length} Dynamic Fields
                                        </span>
                                    </div>

                                    {/* Action Footer */}
                                    <div className="mt-auto pt-4 border-t border-slate-50 grid grid-cols-2 gap-3">
                                        <Link
                                            href={`/admin/editor?id=${template.id}`}
                                            className="flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                        >
                                            <Icons.Edit /> Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(template.id)}
                                            className="flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-50 hover:bg-red-50 hover:text-red-600 transition-colors"
                                        >
                                            <Icons.Trash /> Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}