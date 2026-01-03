'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Template } from '@/lib/storage';

// Inline Icons for better performance without external dependencies
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
  ),
  Settings: () => (
    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Step1: () => (
    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
  ),
  Step2: () => (
    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
  ),
  Step3: () => (
    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
  )
};

export default function Home() {
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
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 selection:bg-indigo-500/10 selection:text-indigo-700 font-sans">

      {/* Decorative Background Mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-200/40 rounded-full blur-[100px] opacity-60 mix-blend-multiply animate-blob" />
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-200/40 rounded-full blur-[100px] opacity-60 mix-blend-multiply animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-20%] left-[20%] w-[500px] h-[500px] bg-blue-200/40 rounded-full blur-[100px] opacity-60 mix-blend-multiply animate-blob animation-delay-4000" />
      </div>

      {/* Header */}
      <header className="fixed w-full top-0 z-50 transition-all duration-300 bg-white/70 backdrop-blur-xl border-b border-white/50 supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-7xl mx-auto px-6 h-16 md:h-20 flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-default">
            <div className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/30 transition-shadow">
              N
            </div>
            <span className="text-xl md:text-2xl font-bold tracking-tight text-slate-800">Nora</span>
          </div>
          <nav>
            <Link
              href="/admin"
              className="flex items-center px-4 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-full transition-all shadow-sm hover:shadow-md"
            >
              <Icons.Settings />
              <span className="hidden md:inline">Dashboard</span>
              <span className="md:hidden">Admin</span>
            </Link>
          </nav>
        </div>
      </header>

      <main className="relative z-10 pt-24 pb-20">

        {/* Hero Section */}
        <section className="px-6 md:px-10 lg:px-8 max-w-7xl mx-auto mb-20 md:mb-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center pt-10 md:pt-20">

            {/* Left Content */}
            <div className="max-w-2xl text-center lg:text-left mx-auto lg:mx-0">
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur border border-slate-200/60 rounded-full px-4 py-1.5 shadow-sm mb-8 animate-fade-in-up">
                <span className="flex relative h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                </span>
                <span className="text-sm font-medium text-slate-600">Template Engine v2.0</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
                Design <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 animate-gradient-x">Excellence</span> <br />
                Made Simple.
              </h1>

              <p className="text-lg md:text-xl text-slate-600 mb-8 leading-relaxed max-w-lg mx-auto lg:mx-0">
                Create professional certificates, ID cards, and social assets in seconds. Select a template, personalize fields, and export.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a href="#templates" className="px-8 py-4 bg-slate-900 text-white rounded-full font-semibold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 text-center">
                  Browse Templates
                </a>
                <a href="#how-it-works" className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-full font-semibold hover:bg-slate-50 transition-all hover:border-slate-300 text-center">
                  How it Works
                </a>
              </div>
            </div>

            {/* Right Abstract Visual (Desktop Only) */}
            <div className="hidden lg:block relative h-[500px]">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[500px] bg-gradient-to-tr from-white to-slate-50 rounded-2xl border border-white/50 shadow-2xl rotate-[-6deg] z-10 flex flex-col overflow-hidden">
                <div className="h-32 bg-indigo-50 border-b border-indigo-100 p-6 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-white shadow-sm"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-white rounded-full"></div>
                    <div className="h-3 w-20 bg-white/60 rounded-full"></div>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="h-4 w-3/4 bg-slate-100 rounded-full"></div>
                  <div className="h-4 w-1/2 bg-slate-100 rounded-full"></div>
                  <div className="h-32 w-full bg-slate-50 rounded-xl border border-dashed border-slate-200 mt-8"></div>
                </div>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[500px] bg-slate-900 rounded-2xl shadow-xl rotate-[6deg] opacity-10 z-0 scale-95"></div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="px-6 md:px-10 lg:px-8 max-w-7xl mx-auto mb-24 md:mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">How It Works</h2>
            <p className="text-slate-500 max-w-md mx-auto">Create stunning visuals in three simple steps.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Select Template", desc: "Browse our collection of professionally designed templates.", icon: <Icons.Step1 /> },
              { title: "Customize", desc: "Fill in the details. The real-time preview shows you exactly what you get.", icon: <Icons.Step2 /> },
              { title: "Download", desc: "Get your high-quality image instantly, ready to share or print.", icon: <Icons.Step3 /> }
            ].map((step, idx) => (
              <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg shadow-indigo-500/5 hover:shadow-indigo-500/10 transition-all flex flex-col items-center text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-6 group-hover:scale-110 transition-transform">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Templates Grid Section */}
        <section id="templates" className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <h3 className="text-3xl font-bold text-slate-900 mb-2">Featured Templates</h3>
              <p className="text-slate-500">Choose a design to start customizing.</p>
            </div>

            {!loading && templates.length > 0 && (
              <div className="bg-white px-4 py-2 rounded-full border border-slate-200 text-sm font-medium text-slate-600 shadow-sm">
                {templates.length} Available Designs
              </div>
            )}
          </div>

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
                  className="group relative flex flex-col bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 hover:-translate-y-1"
                >
                  {/* Image Container */}
                  <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                    <img
                      src={template.imageUrl}
                      alt={template.name}
                      className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-colors duration-300" />

                    {/* Floating Action Button */}
                    <div className="absolute bottom-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <span className="bg-white text-slate-900 px-4 py-2 rounded-full text-sm font-semibold shadow-lg flex items-center">
                        Use Template <Icons.ArrowRight />
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-xl text-slate-900 group-hover:text-indigo-600 transition-colors">{template.name}</h3>
                      {idx < 2 && (
                        <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">New</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mt-auto pt-4 border-t border-slate-50 flex items-center">
                      <Icons.Sparkles />
                      <span className="ml-2">{template.fields.length} Smart Fields</span>
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="bg-white border-t border-slate-200 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} Nora Dashboard. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-slate-400 hover:text-indigo-600 transition-colors text-sm font-medium">Privacy</Link>
            <Link href="/terms" className="text-slate-400 hover:text-indigo-600 transition-colors text-sm font-medium">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}