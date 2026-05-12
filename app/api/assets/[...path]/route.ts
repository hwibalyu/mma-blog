import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  const assetPath = path.join(process.cwd(), 'content/posts', ...resolvedParams.path);
  
  if (!fs.existsSync(assetPath)) {
    return new NextResponse(null, { status: 404 });
  }

  const file = fs.readFileSync(assetPath);
  const ext = path.extname(assetPath).toLowerCase();
  
  let contentType = 'application/octet-stream';
  if (ext === '.png') contentType = 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
  if (ext === '.gif') contentType = 'image/gif';
  if (ext === '.svg') contentType = 'image/svg+xml';
  if (ext === '.webp') contentType = 'image/webp';

  return new NextResponse(file, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
