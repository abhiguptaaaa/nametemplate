
import React from 'react';

export const Loader = () => (
    <div className="flex items-center justify-center w-full h-full min-h-[200px]">
        <div className="relative flex flex-col items-center gap-4">
            <div className="relative w-16 h-16">
                {/* Background Ring */}
                <div className="absolute inset-0 rounded-full border-4 border-slate-100 dark:border-slate-800"></div>
                {/* Spinner */}
                <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
                {/* Inner Pulse */}
                <div className="absolute inset-4 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse"></div>
                </div>
            </div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest animate-pulse">Loading...</p>
        </div>
    </div>
);
