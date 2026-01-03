import { NextRequest, NextResponse } from 'next/server';
import { getTemplates, saveTemplates, Template } from '@/lib/storage';

export async function GET() {
    const templates = await getTemplates();
    return NextResponse.json(templates);
}

export async function POST(req: NextRequest) {
    try {
        const template: Template = await req.json();
        const templates = await getTemplates();

        const index = templates.findIndex(t => t.id === template.id);
        if (index !== -1) {
            templates[index] = template;
        } else {
            templates.push(template);
        }

        await saveTemplates(templates);
        return NextResponse.json({ success: true, template });
    } catch (error) {
        console.error('Save template error:', error);
        return NextResponse.json({ error: 'Failed to save template' }, { status: 500 });
    }
}
