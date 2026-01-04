'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function NotFound() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 flex items-center justify-center p-4 font-sans">
            {/* Animated Background Blobs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-200/40 rounded-full blur-[100px] opacity-60 mix-blend-multiply animate-blob" />
                <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-200/40 rounded-full blur-[100px] opacity-60 mix-blend-multiply animate-blob animation-delay-2000" />
                <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] bg-cyan-100/40 rounded-full blur-[80px] opacity-50 mix-blend-multiply animate-blob animation-delay-4000" />
            </div>

            <div className="relative z-10 max-w-2xl w-full text-center">
                {/* 404 Number */}
                <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h1 className="text-[120px] sm:text-[180px] font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-none tracking-tighter">
                        404
                    </h1>
                </div>

                {/* Message */}
                <div className="space-y-4 mb-12 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
                    <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
                        Page Not Found
                    </h2>
                    <p className="text-lg text-slate-600 max-w-md mx-auto">
                        Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                    <button
                        onClick={() => router.push('/')}
                        className="group px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-full shadow-lg shadow-slate-900/20 hover:shadow-slate-900/40 transition-all flex items-center gap-2 active:scale-95"
                    >
                        <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span>Go Home</span>
                    </button>

                    <button
                        onClick={() => router.push('/templates')}
                        className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 hover:border-indigo-300 font-semibold rounded-full transition-all flex items-center gap-2 active:scale-95"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                        </svg>
                        <span>Browse Templates</span>
                    </button>
                </div>

                {/* Decorative Element */}
                <div className="mt-16 animate-in fade-in duration-700 delay-500">
                    <p className="text-sm text-slate-400 font-medium">
                        Lost? Let's get you back on track.
                    </p>
                </div>
            </div>
        </div>
    );
}
