import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export async function POST(req: NextRequest) {
    try {
        const apiKey = process.env.GROQ_API_KEY;

        if (!apiKey || apiKey.startsWith('your_')) {
            return NextResponse.json(
                { error: 'Groq API Key not configured' },
                { status: 500 }
            );
        }

        const formData = await req.formData();
        const file = formData.get('image') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No image provided' },
                { status: 400 }
            );
        }

        // Convert file to base64
        const buffer = Buffer.from(await file.arrayBuffer());
        const base64Image = buffer.toString('base64');
        const dataUrl = `data:${file.type};base64,${base64Image}`;

        const groq = new Groq({ apiKey });

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: 'Analyze this image and identify all names (and surnames) listed. Return strictly a JSON object with a single key "names" containing an array of strings. Do not return any other text or markdown formatting. Example: {"names": ["John Doe", "Jane Smith"]}.'
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: dataUrl
                            }
                        }
                    ]
                }
            ],
            model: 'llama-3.2-11b-vision-preview', // Or 90b if available/needed
            temperature: 0,
            response_format: { type: 'json_object' }
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) {
            throw new Error('No content received from AI');
        }

        const result = JSON.parse(content);

        // Ensure we handle various AI return formats gracefully
        const names = result.names || result.Names || (Array.isArray(result) ? result : []);

        return NextResponse.json({ names });

    } catch (error: any) {
        console.error('AI Extraction Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to extract names' },
            { status: 500 }
        );
    }
}
