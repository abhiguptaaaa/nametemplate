import Redis from 'ioredis';
import { Template, CustomFont } from './storage';

// Initialize Redis client with the connection string from env
const getClient = () => {
    if (!process.env.REDIS_URL) {
        console.error('REDIS_URL environment variable is not defined');
        // Return a dummy object or null to prevent crash during build
        return null;
    }
    return new Redis(process.env.REDIS_URL);
};

const redis = getClient();

// Helper to handle parsing/stringifying since Redis stores strings
const safeJsonParse = <T>(str: string | null): T | null => {
    try {
        return str ? JSON.parse(str) : null;
    } catch (e) {
        return null;
    }
};

// --- TEMPLATES ---

export async function getGlobalTemplates(): Promise<Template[]> {
    if (!redis) return [];
    try {
        const templatesDict = await redis.hgetall('templates');
        // hgetall returns object { [id]: stringified_template }
        // We need to parse each value
        return Object.values(templatesDict).map(str => safeJsonParse<Template>(str)).filter((t): t is Template => t !== null);
    } catch (error) {
        console.error('Redis Error (getGlobalTemplates):', error);
        return [];
    }
}

export async function saveGlobalTemplate(template: Template): Promise<void> {
    if (!redis) throw new Error('Redis not configured');
    try {
        // Store as stringified JSON in the hash
        await redis.hset('templates', { [template.id]: JSON.stringify(template) });
    } catch (error) {
        console.error('Redis Error (saveGlobalTemplate):', error);
        throw error;
    }
}

export async function deleteGlobalTemplate(id: string): Promise<void> {
    if (!redis) throw new Error('Redis not configured');
    try {
        await redis.hdel('templates', id);
    } catch (error) {
        console.error('Redis Error (deleteGlobalTemplate):', error);
        throw error;
    }
}

// --- FONTS ---

export async function getGlobalFonts(): Promise<CustomFont[]> {
    if (!redis) return [];
    try {
        const fontsDict = await redis.hgetall('fonts');
        return Object.values(fontsDict).map(str => safeJsonParse<CustomFont>(str)).filter((f): f is CustomFont => f !== null);
    } catch (error) {
        console.error('Redis Error (getFonts):', error);
        return [];
    }
}

export async function saveGlobalFont(font: CustomFont): Promise<void> {
    if (!redis) throw new Error('Redis not configured');
    try {
        await redis.hset('fonts', { [font.id]: JSON.stringify(font) });
    } catch (error) {
        console.error('Redis Error (saveFont):', error);
        throw error;
    }
}

export async function deleteGlobalFont(id: string): Promise<void> {
    if (!redis) throw new Error('Redis not configured');
    try {
        await redis.hdel('fonts', id);
    } catch (error) {
        console.error('Redis Error (deleteFont):', error);
        throw error;
    }
}
