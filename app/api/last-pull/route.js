import { NextResponse } from 'next/server';

const GoogleDrive = require('../../../modules/Jimper/lib/GoogleDrive.js');

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const lastPull = await GoogleDrive.getLatestFileTimestamp();
    return NextResponse.json({ lastPull });
  } catch (error) {
    console.error('Failed to fetch last pull timestamp', error);
    return NextResponse.json({ lastPull: null }, { status: 500 });
  }
}
