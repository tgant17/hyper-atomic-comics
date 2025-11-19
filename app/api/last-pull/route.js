import { NextResponse } from 'next/server';

const GoogleDrive = require('../../../modules/Jimper/lib/GoogleDrive.js');

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const lastPull = await GoogleDrive.getLatestFileTimestamp();
    const comicCount = await GoogleDrive.getFileCount();
    return NextResponse.json({ lastPull, comicCount });
  } catch (error) {
    console.error('Failed to fetch last pull timestamp', error);
    return NextResponse.json({ lastPull: null, comicCount: null }, { status: 500 });
  }
}
