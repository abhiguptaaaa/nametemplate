import { NextResponse } from 'next/server';
import { getGlobalSettings, saveGlobalSettings, SystemSettings } from '@/lib/db';

export async function GET() {
    try {
        const settings = await getGlobalSettings();
        return NextResponse.json(settings);
    } catch (error) {
        console.error('Failed to fetch settings:', error);
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const settings: SystemSettings = {
            maintenanceMode: Boolean(body.maintenanceMode),
            accessCodeEnabled: Boolean(body.accessCodeEnabled),
            accessCode: String(body.accessCode || '1234')
        };

        await saveGlobalSettings(settings);
        return NextResponse.json({ success: true, settings });
    } catch (error) {
        console.error('Failed to save settings:', error);
        return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
    }
}
