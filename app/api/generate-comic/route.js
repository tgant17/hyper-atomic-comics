import { NextResponse } from 'next/server';

const { generateComic } = require('../../../lib/generateComic');

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    let payload = {};
    if (request) {
      const contentType = request.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        payload = await request.json().catch(() => ({}));
      }
    }

    const comic = await generateComic(payload);
    return NextResponse.json({
      ...comic,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to generate comic', error);
    return NextResponse.json(
      { error: error?.message ?? 'Unable to generate comic' },
      { status: 500 }
    );
  }
}
