import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import { extname, join } from 'path';

@Injectable()
export class StorageService {
  async saveInspectionImage(file: Express.Multer.File) {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.mimetype)) throw new BadRequestException('Only JPG, PNG and WEBP images are allowed');
    if (file.size > 5 * 1024 * 1024) throw new BadRequestException('Image must be 5MB or smaller');
    const dir = process.env.UPLOAD_DIR ?? 'uploads';
    await mkdir(dir, { recursive: true });
    const fileName = `${randomUUID()}${extname(file.originalname) || '.jpg'}`;
    const filePath = join(dir, fileName);
    await writeFile(filePath, file.buffer);
    return { fileName, filePath, mimeType: file.mimetype, sizeBytes: file.size };
  }
}
