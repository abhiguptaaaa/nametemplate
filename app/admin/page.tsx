'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Template } from '@/lib/storage';
import { Loader } from '@/components/ui/Loader';

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
    ),
    Sparkles: () => (
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
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

function Toast({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) {
    return (
        <div className={`fixed bottom-4 right-4 z-[9999] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300 ${type === 'success' ? 'bg-indigo-900 text-white' : 'bg-red-500 text-white'
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

// --- Main Component ---

export default function AdminDashboard() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const [settings, setSettings] = useState({
        maintenanceMode: false,
        accessCodeEnabled: false,
        accessCode: '1234'
    });
    const [savingSettings, setSavingSettings] = useState(false);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        const auth = sessionStorage.getItem('adminAuth');
        if (auth === 'true') {
            setIsAuthenticated(true);
            loadTemplates();
            loadSettings();
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

    const loadSettings = async () => {
        try {
            const res = await fetch('/api/settings');
            const data = await res.json();
            setSettings(data);
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    };

    const handleSaveSettings = async () => {
        setSavingSettings(true);
        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            if (res.ok) {
                showToast('Settings saved successfully', 'success');
            } else {
                showToast('Failed to save settings', 'error');
            }
        } catch (error) {
            console.error('Save settings error:', error);
            showToast('Failed to save settings', 'error');
        } finally {
            setSavingSettings(false);
        }
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (username === 'abhi' && password === 'abHI0905@@') {
            sessionStorage.setItem('adminAuth', 'true');
            setIsAuthenticated(true);
            loadTemplates();
            loadSettings();
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
        setDeletingId(id);
        try {
            const res = await fetch(`/api/templates?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setTemplates(templates.filter(t => t.id !== id));
                showToast('Template deleted successfully', 'success');
            } else {
                showToast('Failed to delete template', 'error');
            }
        } catch (error) {
            console.error('Delete error:', error);
            showToast('Failed to delete template', 'error');
        } finally {
            setDeletingId(null);
        }
    };

    // --- Login View ---
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950 p-4 transition-colors duration-200">
                <BackgroundEffects />
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl w-full max-w-md border border-white/50 dark:border-slate-700/50 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600 dark:text-indigo-400">
                            <Icons.Lock />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Admin Access</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Please enter credentials to continue</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Username</label>
                            <div className="relative group">
                                <span className="absolute left-3 top-2.5">
                                    <Icons.User />
                                </span>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all group-hover:border-indigo-300 dark:text-slate-100"
                                    placeholder="Enter username"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Password</label>
                            <div className="relative group">
                                <span className="absolute left-3 top-2.5">
                                    <Icons.Lock />
                                </span>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all group-hover:border-indigo-300 dark:text-slate-100"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                        {error && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl flex items-center gap-2 animate-shake">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                {error}
                            </div>
                        )}
                        <button type="submit" className="w-full py-3 bg-slate-900 dark:bg-indigo-600 text-white rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl active:scale-[0.98]">
                            Login
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // --- Dashboard View ---
    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500/10 selection:text-indigo-700 transition-colors duration-200">
            <BackgroundEffects />
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Sticky Header */}
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-700/60 supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60 transition-colors duration-200">
                <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 relative flex-shrink-0">
                            <img src="/xcanvas-logo.png" alt="XCanvas" className="w-full h-full object-contain" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">XCanvas Admin</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/"
                            className="hidden md:flex items-center px-4 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors rounded-full hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                            <Icons.External /> View Site
                        </Link>
                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden md:block" />
                        <button
                            onClick={handleLogout}
                            className="flex items-center px-4 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-full hover:bg-red-50 dark:hover:bg-red-900/10"
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
                        <h2 className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mb-2">Dashboard</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-lg">Manage your design library and configurations.</p>
                    </div>
                    <div className="flex gap-4">
                        <Link
                            href="/admin/editor?new=true"
                            className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-full font-semibold shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all active:scale-95"
                        >
                            <Icons.Plus /> Create New Template
                        </Link>
                    </div>
                </div>


                <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700/50 p-6 md:p-8 shadow-sm mb-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 dark:bg-indigo-900/20 rounded-bl-full -mr-16 -mt-16 pointer-events-none" />

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 relative z-10">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 p-2 rounded-lg">⚙️</span>
                                System Configuration
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Control access and visibility of the platform.</p>
                        </div>
                        <button
                            onClick={handleSaveSettings}
                            disabled={savingSettings}
                            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95 disabled:opacity-70 flex items-center gap-2"
                        >
                            {savingSettings ? (
                                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Saving...</>
                            ) : (
                                <>Save Configuration</>
                            )}
                        </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 relative z-10">
                        {/* Maintenance Mode Toggle */}
                        <div className={`p-5 rounded-2xl border transition-all ${settings.maintenanceMode ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-900/30' : 'bg-slate-50 border-slate-200 dark:bg-slate-900/50 dark:border-slate-800'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        🚧 Maintenance Mode
                                        {settings.maintenanceMode && <span className="text-amber-600 text-xs bg-amber-100 px-2 py-0.5 rounded-full">ACTIVE</span>}
                                    </h4>
                                    <p className="text-xs text-slate-500 mt-1 max-w-[250px]">
                                        Hides the website content and shows a "Under Maintenance" screen with contact info. Admin panel remains accessible.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${settings.maintenanceMode ? 'bg-amber-500' : 'bg-slate-300'}`}
                                >
                                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-300 ${settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>

                        {/* Access Code Toggle */}
                        <div className={`p-5 rounded-2xl border transition-all ${settings.accessCodeEnabled ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/10 dark:border-indigo-900/30' : 'bg-slate-50 border-slate-200 dark:bg-slate-900/50 dark:border-slate-800'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        🔒 Access Code Protection
                                        {settings.accessCodeEnabled && <span className="text-indigo-600 text-xs bg-indigo-100 px-2 py-0.5 rounded-full">ACTIVE</span>}
                                    </h4>
                                    <p className="text-xs text-slate-500 mt-1 max-w-[250px]">
                                        Restricts access to the entire site. Users must enter the code below to view any content.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSettings({ ...settings, accessCodeEnabled: !settings.accessCodeEnabled })}
                                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${settings.accessCodeEnabled ? 'bg-indigo-600' : 'bg-slate-300'}`}
                                >
                                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-300 ${settings.accessCodeEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>

                            {settings.accessCodeEnabled && (
                                <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Access Code</label>
                                    <input
                                        type="text"
                                        value={settings.accessCode}
                                        onChange={(e) => setSettings({ ...settings, accessCode: e.target.value })}
                                        className="w-full bg-white dark:bg-slate-900 border border-slate-300/60 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-mono font-bold tracking-widest text-center focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="Enter code"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                {
                    loading ? (
                        <div className="flex justify-center items-center py-32">
                            <Loader />
                        </div>
                    ) : !loading && templates.length === 0 ? (
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
                                <div key={template.id} className="group bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700/50 p-4 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-1">
                                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                        <img
                                            src={template.imageUrl}
                                            alt={template.name}
                                            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-indigo-900/0 group-hover:bg-indigo-900/5 transition-colors" />
                                    </div>

                                    <div className="px-2 mb-6">
                                        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-1 line-clamp-1">{template.name}</h3>
                                        <div className="flex items-center text-xs font-semibold text-slate-500 dark:text-slate-400">
                                            <Icons.Sparkles />
                                            <span>{template.fields.length} Customizable Fields</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 mt-auto">
                                        <Link
                                            href={`/admin/editor?id=${template.id}`}
                                            className="flex-1 flex items-center justify-center px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-semibold hover:bg-indigo-100 hover:text-indigo-700 transition w-full"
                                        >
                                            <Icons.Edit /> Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(template.id)}
                                            disabled={deletingId === template.id}
                                            className="flex items-center justify-center px-4 py-2 bg-red-50 text-red-500 rounded-xl font-semibold hover:bg-red-100 hover:text-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px]"
                                        >
                                            {deletingId === template.id ? (
                                                <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <><Icons.Trash /> Delete</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                }
            </main >
        </div >
    );
}