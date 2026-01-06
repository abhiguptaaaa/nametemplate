'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ThemeToggle } from '@/components/ThemeToggle';

// --- Icons ---
const Icons = {
  Sparkles: () => (
    <svg className="w-4 h-4 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  ),
  ArrowRight: () => (
    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  ),
  Settings: () => (
    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Step1: () => (
    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
  ),
  Step2: () => (
    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
  ),
  Step3: () => (
    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
  ),
  Close: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
  )
};

// --- Components ---

const HowItWorksModal = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
    {/* Backdrop */}
    <div
      className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300"
      onClick={onClose}
    />

    {/* Modal Content */}
    <div className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 max-w-4xl w-full border border-white/20 dark:border-slate-700 animate-in zoom-in-95 duration-300 flex flex-col md:flex-row gap-8 overflow-hidden">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-all"
      >
        <Icons.Close />
      </button>

      {/* Visual Side */}
      <div className="hidden md:flex flex-col justify-center items-center w-1/3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10" />
        <div className="relative z-10 text-center">
          <h3 className="text-2xl font-bold text-indigo-900 dark:text-indigo-200 mb-2">Simple Process</h3>
          <p className="text-indigo-600 dark:text-indigo-400">Three easy steps to your perfect design.</p>
        </div>
      </div>

      {/* Steps Side */}
      <div className="flex-1 space-y-8 py-4">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">How it Works</h2>

        <div className="space-y-6">
          {[
            { title: "Select Template", desc: "Choose from our wide range of professional designs.", icon: <Icons.Step1 />, color: "from-blue-500 to-indigo-500" },
            { title: "Customize", desc: "Fill in your details and watch the preview update instantly.", icon: <Icons.Step2 />, color: "from-indigo-500 to-purple-500" },
            { title: "Download", desc: "Export your high-quality image ready for sharing.", icon: <Icons.Step3 />, color: "from-purple-500 to-pink-500" }
          ].map((step, idx) => (
            <div key={idx} className="flex items-start gap-4 group">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
                <div className="scale-75">{step.icon}</div>
              </div>
              <div className="pt-1">
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">{step.title}</h4>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default function Home() {
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  return (
    <div className="h-screen overflow-hidden bg-[#FAFAFA] dark:bg-slate-900 text-slate-900 dark:text-slate-100 selection:bg-indigo-500/10 selection:text-indigo-700 font-sans transition-colors duration-200 flex flex-col">

      {/* Decorative Background Mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-purple-200/40 dark:bg-purple-900/20 rounded-full blur-[120px] opacity-60 mix-blend-multiply dark:mix-blend-lighten animate-blob" />
        <div className="absolute top-[-10%] left-[-10%] w-[700px] h-[700px] bg-indigo-200/40 dark:bg-indigo-900/20 rounded-full blur-[120px] opacity-60 mix-blend-multiply dark:mix-blend-lighten animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-20%] left-[20%] w-[600px] h-[600px] bg-blue-200/40 dark:bg-blue-900/20 rounded-full blur-[120px] opacity-60 mix-blend-multiply dark:mix-blend-lighten animate-blob animation-delay-4000" />
      </div>

      {/* Header */}
      <header className="absolute top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 h-24 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 relative flex-shrink-0 bg-white/20 backdrop-blur-md rounded-xl p-1.5 border border-white/30 shadow-sm transition-transform group-hover:scale-105">
              <Image
                src="/xcanvas-logo.png"
                alt="XCanvas Logo"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">XCanvas</span>
          </Link>
          <nav className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              href="/admin"
              className="px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 rounded-full transition-all hover:bg-white dark:hover:bg-slate-800 shadow-sm hover:shadow-md flex items-center gap-2"
            >
              <Icons.Settings />
              <span>Dashboard</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content (Hero) */}
      <main className="flex-1 relative z-10 flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-2 gap-16 items-center">

          {/* Left Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-indigo-100 dark:border-indigo-900/50 rounded-full px-4 py-1.5 shadow-sm mb-8 animate-fade-in-up">
              <span className="flex relative h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
              </span>
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Template Engine v2.0 Live</span>
            </div>

            <h1 className="text-5xl sm:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1] mb-8">
              Design <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 animate-gradient-x">Excellence</span> <br />
              Made Simple.
            </h1>

            <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed max-w-lg mx-auto lg:mx-0">
              Create professional certificates, ID cards, and social assets in seconds. No design skills required.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
              <Link
                href="/templates"
                className="group px-8 py-4 bg-slate-900 dark:bg-indigo-600 text-white rounded-full font-bold text-lg hover:bg-slate-800 dark:hover:bg-indigo-700 transition-all shadow-xl hover:shadow-2xl hover:shadow-indigo-500/20 hover:-translate-y-1 active:translate-y-0 active:scale-95 flex items-center justify-center gap-1"
              >
                Browse Templates
                <Icons.ArrowRight />
              </Link>
              <button
                onClick={() => setShowHowItWorks(true)}
                className="px-8 py-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-full font-semibold text-lg hover:bg-white dark:hover:bg-slate-800 transition-all hover:border-slate-300 dark:hover:border-slate-600 active:scale-95 shadow-sm hover:shadow-lg"
              >
                How it Works
              </button>
            </div>
          </div>

          {/* Right Visual */}
          <div className="hidden lg:block relative h-[600px] w-full perspective-1000">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[600px] transition-transform duration-700 hover:rotate-y-12 hover:rotate-x-6">
              {/* Floating Elements */}
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-purple-400 rounded-2xl rotate-12 blur-xl opacity-40 animate-pulse"></div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-indigo-400 rounded-full blur-xl opacity-40 animate-pulse delay-700"></div>

              {/* Main Card */}
              <div className="relative w-full h-full bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-white/50 dark:border-slate-700 overflow-hidden flex flex-col">
                <div className="h-48 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 p-8 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-grid-slate-200/50 dark:bg-grid-slate-700/30 [mask-image:linear-gradient(0deg,transparent,black)]" />
                  <div className="w-24 h-24 bg-white dark:bg-slate-700 rounded-full shadow-lg flex items-center justify-center relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse-slow" />
                  </div>
                </div>
                <div className="p-8 space-y-6 flex-1 bg-white/50 dark:bg-slate-800/50 backdrop-blur-3xl">
                  <div className="h-6 w-3/4 bg-slate-100 dark:bg-slate-700 rounded-full" />
                  <div className="h-4 w-full bg-slate-50 dark:bg-slate-700/50 rounded-full" />
                  <div className="h-4 w-5/6 bg-slate-50 dark:bg-slate-700/50 rounded-full" />
                  <div className="mt-8 p-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 h-32 flex items-center justify-center">
                    <span className="text-slate-400 text-sm">Preview Area</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer (Minimal) */}
      <footer className="absolute bottom-6 w-full text-center z-10">
        <div className="flex items-center justify-center gap-6 text-sm font-medium text-slate-400 dark:text-slate-500">
          <Link href="/privacy" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Privacy</Link>
          <span>•</span>
          <p className="flex items-center gap-1">
            Created with <span className="text-red-500">♥</span> by <span className="text-slate-600 dark:text-slate-300">Abhi Gupta</span>
          </p>
          <span>•</span>
          <Link href="/terms" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Terms</Link>
        </div>
      </footer>

      {/* Modals */}
      {showHowItWorks && <HowItWorksModal onClose={() => setShowHowItWorks(false)} />}
    </div>
  );
}