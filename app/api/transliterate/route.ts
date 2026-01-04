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
        if (data && data[0] === 'SUCCESS' && Array.isArray(data[1])) {
            // Map over all segments to construct full sentence
            // data[1] is an array of [original_token, [suggestions], ...]
            const transliterated = data[1]
                .map((segment: any) => {
                    // Return first suggestion (segment[1][0]) or fallback to original token (segment[0])
                    return (segment[1] && segment[1][0]) ? segment[1][0] : segment[0];
                })
                .join(''); // Join all segments (spaces/punctuation are usually their own segments or included)

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
