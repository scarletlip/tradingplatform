import fs from 'fs';
import path from 'path';

const MAX_SIZE_MB = 5;

/**
 * Server-side: save uploaded file to public/uploads/.
 * Client-side compression should happen before upload.
 */
export async function saveImage(file: File): Promise<string> {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  const ext = path.extname(file.name).toLowerCase() || '.jpg';
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  const filePath = path.join(uploadsDir, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(filePath, buffer);

  return `/uploads/${filename}`;
}

/**
 * Validate image file type and size.
 */
export function validateImage(file: File): string | null {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    return '只支持 JPG/PNG/WebP/GIF 格式';
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return `图片大小不能超过 ${MAX_SIZE_MB}MB`;
  }
  return null;
}
