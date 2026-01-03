import { NextRequest, NextResponse } from 'next/server';

// Since we're using client-side localStorage, this API route just returns an empty array
// The actual data is stored in the browser's localStorage
export async function GET() {
    return NextResponse.json([]);
}

export async function POST(req: NextRequest) {
    // Client-side storage - this endpoint is not used
    return NextResponse.json({ success: true });
}
