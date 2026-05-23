import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  const assetPath = resolveAssetPath(resolvedParams.path);
  
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

function resolveAssetPath(pathSegments: string[]) {
  const baseDir = path.join(process.cwd(), 'content/posts');
  const candidatePath = path.join(baseDir, ...pathSegments);

  if (fs.existsSync(candidatePath)) {
    return candidatePath;
  }

  if (pathSegments.length === 0) {
    return candidatePath;
  }

  const directoryPath = path.join(baseDir, ...pathSegments.slice(0, -1));
  const fileName = pathSegments[pathSegments.length - 1];

  if (!fs.existsSync(directoryPath) || !fs.statSync(directoryPath).isDirectory()) {
    return candidatePath;
  }

  const matchedName = fs
    .readdirSync(directoryPath)
    .find((entry) => entry.normalize('NFC') === fileName.normalize('NFC'));

  return matchedName ? path.join(directoryPath, matchedName) : candidatePath;
}
