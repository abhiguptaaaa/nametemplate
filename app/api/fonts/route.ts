import { NextRequest, NextResponse } from 'next/server';
import { getGlobalFonts, saveGlobalFont } from '@/lib/db';
import { CustomFont } from '@/lib/storage';

export async function GET() {
    const fonts = await getGlobalFonts();
    return NextResponse.json(fonts);
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const name = formData.get('name') as string;

        if (!file || !name) {
            return NextResponse.json({ error: 'File and name are required' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        // Simple mime type detection or default to font/ttf
        const mimeType = file.type || 'font/ttf';
        const base64 = buffer.toString('base64');
        const dataUrl = `data:${mimeType};base64,${base64}`;

        const font: CustomFont = {
            id: Math.random().toString(36).substr(2, 9),
            name,
            dataUrl
        };

        await saveGlobalFont(font);

        return NextResponse.json({ success: true, font });
    } catch (error) {
        console.error('Font Upload Error:', error);
        return NextResponse.json({ error: 'Failed to upload font' }, { status: 500 });
    }
}
