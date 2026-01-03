import { NextRequest, NextResponse } from 'next/server';
import { getGlobalTemplates, saveGlobalTemplate } from '@/lib/db';
import { Template } from '@/lib/storage';

// Fetch all shared templates from Vercel KV
export async function GET() {
    const templates = await getGlobalTemplates();
    return NextResponse.json(templates);
}

// Admin saves a shared template
export async function POST(req: NextRequest) {
    try {
        const template: Template = await req.json();
        await saveGlobalTemplate(template);
        return NextResponse.json({ success: true, template });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Failed to save template' }, { status: 500 });
    }
}
