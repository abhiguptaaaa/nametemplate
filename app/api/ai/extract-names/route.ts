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
                            text: 'Extract EVERY single name found in this image. This is a list of names for certificates. \n\nRules:\n1. Extract all names strictly as they appear.\n2. Ignore row numbers, dates, titles (like "List of Participants"), or other metadata.\n3. Return strictly a valid JSON object with a single key "names" which is an array of strings.\n4. Do not miss any names.\n\nExample Output Format: {"names": ["Name One", "Name Two"]}'
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
            model: 'meta-llama/llama-4-scout-17b-16e-instruct',
            temperature: 0.1, // Slight temp to allow for better reading of complex fonts? No, 0 is usually best for determinstic extraction. Keeping low. 
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
