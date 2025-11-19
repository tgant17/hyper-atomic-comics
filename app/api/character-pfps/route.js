import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

const CHARACTER_IDS = ['a', 'c', 'f', 'r', 't'];
const ID_TO_PREFIX = {
  a: 'alien',
  c: 'campfire',
  f: 'foggy',
  r: 'robot',
  t: 'toast-ghost'
};

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];

const matchesExtension = (filename) =>
  IMAGE_EXTENSIONS.some((ext) => filename.toLowerCase().endsWith(ext));

const matchesPrefix = (filename, prefix) => {
  const base = path.parse(filename).name.toLowerCase();
  const normalizedPrefix = prefix.toLowerCase();
  return (
    base === normalizedPrefix ||
    base.startsWith(`${normalizedPrefix}-`) ||
    base.startsWith(`${normalizedPrefix}_`) ||
    base.startsWith(normalizedPrefix)
  );
};

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const directory = path.join(process.cwd(), 'public', 'assets', 'characters');
    const files = await fs.readdir(directory);

    const images = CHARACTER_IDS.reduce((acc, id) => {
      const prefix = ID_TO_PREFIX[id];
      acc[id] = files
        .filter((file) => matchesExtension(file) && matchesPrefix(file, prefix))
        .map((file) => `/assets/characters/${file}`);
      return acc;
    }, {});

    return NextResponse.json({ images });
  } catch (error) {
    console.error('Failed to load character pfps', error);
    return NextResponse.json({ images: {} }, { status: 500 });
  }
}
