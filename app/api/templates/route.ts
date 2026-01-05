import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getGlobalTemplates, saveGlobalTemplate, deleteGlobalTemplate } from '@/lib/db';
import { Template } from '@/lib/storage';

// Fetch all shared templates
export async function GET() {
    const templates = await getGlobalTemplates();
    return NextResponse.json(templates);
}

// Admin saves a shared template
export async function POST(req: NextRequest) {
    try {
        const template: Template = await req.json();
        await saveGlobalTemplate(template);
        revalidatePath('/templates'); // Invalidate cache so new template shows up instantly
        return NextResponse.json({ success: true, template });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Failed to save template' }, { status: 500 });
    }
}

// Delete a shared template
export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
    }

    try {
        await deleteGlobalTemplate(id);
        revalidatePath('/templates'); // Invalidate cache on delete too
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('API Error (DELETE):', error);
        return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
    }
}
