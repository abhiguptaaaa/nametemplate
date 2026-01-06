'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface SystemSettings {
    maintenanceMode: boolean;
    accessCodeEnabled: boolean;
    accessCode: string;
}

const WhatsAppIcon = () => (
    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.374-5.03c0-5.429 4.417-9.868 9.856-9.868 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.429-4.415 9.869-9.835 9.869" />
    </svg>
);

export function SystemGuard({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith('/admin');

    // Default to allow rendering initially to prevent hydration mismatch, checking effect will clamp down
    const [settings, setSettings] = useState<SystemSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [accessGranted, setAccessGranted] = useState(false);
    const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
    const [accessInput, setAccessInput] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const checkSettings = async () => {
            try {
                const res = await fetch('/api/settings');
                const data = await res.json();
                // Only update if settings changed to prevent re-renders
                setSettings(prev => {
                    if (JSON.stringify(prev) === JSON.stringify(data)) return prev;
                    return data;
                });

                // Check admin login status
                const auth = sessionStorage.getItem('adminAuth');
                if (auth === 'true') {
                    setIsAdminLoggedIn(true);
                }

                // Check local access code
                if (data.accessCodeEnabled) {
                    const savedCode = localStorage.getItem('site_access_code');
                    if (savedCode === data.accessCode) {
                        setAccessGranted(true);
                    } else {
                        setAccessGranted(false);
                    }
                } else {
                    setAccessGranted(true);
                }
            } catch (error) {
                console.error('Failed to load settings', error);
            } finally {
                // Only set loading to false on initial load
                setIsLoading(prev => prev ? false : prev);
            }
        };

        checkSettings();

        // Poll every 5 seconds
        const interval = setInterval(checkSettings, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleAccessSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (settings && accessInput === settings.accessCode) {
            localStorage.setItem('site_access_code', accessInput);
            setAccessGranted(true);
            setError('');
        } else {
            setError('Invalid Access Code');
        }
    };

    // Always allow admin access (URL or Logged State)
    if (isAdmin || isAdminLoggedIn) {
        return <>{children}</>;
    }

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-slate-50 dark:bg-slate-900 flex items-center justify-center z-[100]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    // Maintenance Mode
    if (settings?.maintenanceMode) {
        const phoneNumber = '9238868090';
        const whatsappLink = `https://wa.me/${phoneNumber}`;

        return (
            <div className="min-h-screen bg-[#FAFAFA] dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
                {/* Minimal Header for Admin Access */}
                <header className="fixed w-full top-0 z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-white/50 dark:border-slate-700/50">
                    <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
                        <span className="font-bold text-xl">XCanvas</span>
                        <Link href="/admin" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                            Admin Login
                        </Link>
                    </div>
                </header>

                <main className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
                    {/* Background Blobs */}
                    <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-200/40 dark:bg-indigo-900/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-lighten animate-blob" />
                    <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-200/40 dark:bg-purple-900/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-lighten animate-blob animation-delay-2000" />

                    {/* Glass Card */}
                    <div className="relative z-10 max-w-lg w-full bg-white/40 dark:bg-slate-800/40 backdrop-blur-2xl border border-white/50 dark:border-slate-700/50 p-10 rounded-3xl shadow-2xl shadow-indigo-500/10 text-center">
                        <div className="w-20 h-20 bg-amber-100 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6 text-4xl shadow-lg shadow-amber-500/20">
                            ⚠️
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4">Website Under Maintenance</h1>
                        <p className="text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                            We are currently updating our systems to serve you better. We'll be back shortly.
                        </p>

                        <div className="bg-white/50 dark:bg-slate-700/50 rounded-2xl p-6 border border-white/50 dark:border-slate-600/50">
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Contact for details</p>
                            <p className="text-lg font-bold text-slate-900 dark:text-white mb-4">Abhi Gupta</p>
                            <a
                                href={whatsappLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-bold transition-all shadow-lg shadow-[#25D366]/20 hover:shadow-[#25D366]/40 active:scale-95"
                            >
                                <WhatsAppIcon />
                                <span>{phoneNumber}</span>
                            </a>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // Access Code Protection
    if (settings?.accessCodeEnabled && !accessGranted) {
        const phoneNumber = '9238868090';
        const whatsappLink = `https://wa.me/${phoneNumber}`;

        return (
            <div className="min-h-screen bg-[#FAFAFA] dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
                {/* Minimal Header for Admin Access */}
                <header className="fixed w-full top-0 z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-white/50 dark:border-slate-700/50">
                    <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
                        <span className="font-bold text-xl">XCanvas</span>
                        <Link href="/admin" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                            Admin Login
                        </Link>
                    </div>
                </header>

                <main className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
                    {/* Background Blobs */}
                    <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-200/40 dark:bg-indigo-900/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-lighten animate-blob" />
                    <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-pink-200/40 dark:bg-pink-900/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-lighten animate-blob animation-delay-2000" />

                    {/* Glass Card */}
                    <div className="relative z-10 max-w-md w-full bg-white/40 dark:bg-slate-800/40 backdrop-blur-2xl border border-white/50 dark:border-slate-700/50 p-10 rounded-3xl shadow-2xl shadow-indigo-500/10 text-center">
                        <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl shadow-lg shadow-indigo-500/20">
                            🔒
                        </div>
                        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">Restricted Access</h1>
                        <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">
                            Please enter the access code to continue.
                        </p>

                        <form onSubmit={handleAccessSubmit} className="space-y-4">
                            <div>
                                <input
                                    type="password"
                                    value={accessInput}
                                    onChange={(e) => setAccessInput(e.target.value)}
                                    placeholder="Enter Access Code"
                                    className="w-full text-center tracking-widest text-lg font-bold px-4 py-3 rounded-xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:font-normal placeholder:tracking-normal"
                                    autoFocus
                                />
                                {error && <p className="text-red-500 text-xs mt-2 font-medium">{error}</p>}
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/30 active:scale-95 flex items-center justify-center gap-2"
                            >
                                Enter Website
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </button>
                        </form>

                        <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700/50">
                            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Need Access?</p>
                            <a
                                href={whatsappLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 rounded-xl font-semibold transition-all"
                            >
                                <WhatsAppIcon />
                                <span>Contact on WhatsApp</span>
                            </a>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return <>{children}</>;
}
