import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { text } = await req.json();

        if (!text || typeof text !== 'string') {
            return NextResponse.json({ error: 'Invalid text input' }, { status: 400 });
        }

        // Use Google Input Tools API for transliteration
        // This is a free API that converts Hinglish to Hindi
        const url = 'https://inputtools.google.com/request?text=' +
            encodeURIComponent(text) +
            '&itc=hi-t-i0-und&num=1';

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Transliteration API failed');
        }

        const data = await response.json();

        // Extract the transliterated text from the response
        // Response format: [SUCCESS, [[text, [suggestions], metadata]]]
        if (data && data[0] === 'SUCCESS' && data[1] && data[1][0] && data[1][0][1]) {
            const transliterated = data[1][0][1][0]; // First suggestion
            return NextResponse.json({
                original: text,
                transliterated: transliterated
            });
        }

        // If transliteration fails, return original text
        return NextResponse.json({
            original: text,
            transliterated: text
        });

    } catch (error) {
        console.error('Transliteration error:', error);
        // Return original text on error
        return NextResponse.json({
            original: '',
            transliterated: ''
        }, { status: 500 });
    }
}
