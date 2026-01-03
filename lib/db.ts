import { kv } from '@vercel/kv';
import { Template, CustomFont } from './storage';

// --- TEMPLATES ---

export async function getGlobalTemplates(): Promise<Template[]> {
    try {
        const templatesDict = await kv.hgetall('templates');
        if (!templatesDict) return [];
        return Object.values(templatesDict) as Template[];
    } catch (error) {
        console.error('KV Error (getGlobalTemplates):', error);
        return [];
    }
}

export async function saveGlobalTemplate(template: Template): Promise<void> {
    try {
        await kv.hset('templates', { [template.id]: template });
    } catch (error) {
        console.error('KV Error (saveGlobalTemplate):', error);
        throw error;
    }
}

export async function deleteGlobalTemplate(id: string): Promise<void> {
    try {
        await kv.hdel('templates', id);
    } catch (error) {
        console.error('KV Error (deleteGlobalTemplate):', error);
        throw error;
    }
}

// --- FONTS ---

export async function getGlobalFonts(): Promise<CustomFont[]> {
    try {
        const fontsDict = await kv.hgetall('fonts');
        if (!fontsDict) return [];
        return Object.values(fontsDict) as CustomFont[];
    } catch (error) {
        console.error('KV Error (getFonts):', error);
        return [];
    }
}

export async function saveGlobalFont(font: CustomFont): Promise<void> {
    try {
        await kv.hset('fonts', { [font.id]: font });
    } catch (error) {
        console.error('KV Error (saveFont):', error);
        throw error;
    }
}

export async function deleteGlobalFont(id: string): Promise<void> {
    try {
        await kv.hdel('fonts', id);
    } catch (error) {
        console.error('KV Error (deleteFont):', error);
        throw error;
    }
}
