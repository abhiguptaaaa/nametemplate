'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Template } from '@/lib/storage';

export default function AdminDashboard() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        // Check if already authenticated
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
            });
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Check credentials
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

    // Login Form
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-8">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900">Admin Login</h1>
                            <p className="text-slate-500 mt-2">Enter your credentials to continue</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Username</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                    placeholder="Enter username"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                    placeholder="Enter password"
                                    required
                                />
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition font-semibold shadow-lg shadow-indigo-200"
                            >
                                Sign In
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <Link href="/" className="text-sm text-slate-500 hover:text-indigo-600 transition">
                                ← Back to Home
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Admin Dashboard (authenticated)
    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Dashboard</h1>
                        <p className="text-slate-500 mt-1">Manage your templates and designs</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleLogout}
                            className="text-slate-500 hover:text-red-600 font-medium text-sm transition-colors"
                        >
                            Logout
                        </button>
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
