import { NextResponse } from 'next/server';

const { generateComic } = require('../../../lib/generateComic');

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const comic = await generateComic();
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
