import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MediaService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  async findAll() {
    return this.prisma.media.findMany({
      orderBy: { uploadedAt: 'desc' },
    });
  }

  async saveMediaInfo(
    name: string,
    type: string,
    size: string,
    url: string,
    category: string = 'general',
    publicId?: string,
  ) {
    return this.prisma.media.create({
      data: {
        name,
        type,
        size,
        url,
        category,
        publicId: publicId || null,
      },
    });
  }

  async uploadFile(file: { buffer?: Buffer; path?: string; originalname: string; mimetype: string; size: number }, category: string) {
    if (!file?.buffer && !file?.path) {
      throw new BadRequestException('Fichier invalide');
    }

    const buffer =
      file.buffer ?? (file.path ? fs.readFileSync(file.path) : null);
    if (!buffer) {
      throw new BadRequestException('Fichier illisible');
    }
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2) + ' MB';

    if (this.cloudinary.isConfigured()) {
      const result = await this.cloudinary.uploadImage(buffer, 'taoman/media');
      return this.saveMediaInfo(
        file.originalname,
        file.mimetype,
        sizeInMB,
        result.secure_url,
        category,
        result.public_id,
      );
    }

    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const filename = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const dest = path.join(uploadsDir, filename);
    fs.writeFileSync(dest, buffer);
    return this.saveMediaInfo(file.originalname, file.mimetype, sizeInMB, `/uploads/${filename}`, category);
  }

  async delete(id: number) {
    const media = await this.prisma.media.findUnique({ where: { id } });
    if (!media) return null;

    if (media.publicId && this.cloudinary.isConfigured()) {
      const resourceType = media.type?.includes('pdf') || media.url?.endsWith('.json') ? 'raw' : 'image';
      try {
        await this.cloudinary.delete(media.publicId, resourceType as 'image' | 'raw');
      } catch {
        // ignore cloud delete errors
      }
    } else if (media.url?.startsWith('/uploads/')) {
      const filePath = path.join(process.cwd(), media.url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    return this.prisma.media.delete({ where: { id } });
  }

  async migrateToCloudinary() {
    if (!this.cloudinary.isConfigured()) {
      throw new BadRequestException('Cloudinary non configuré');
    }

    const items = await this.prisma.media.findMany({
      where: { publicId: null, url: { startsWith: '/uploads/' } },
    });

    let migrated = 0;
    for (const item of items) {
      const filePath = path.join(process.cwd(), item.url);
      if (!fs.existsSync(filePath)) continue;
      const buffer = fs.readFileSync(filePath);
      const result = await this.cloudinary.uploadImage(buffer, 'taoman/media');
      await this.prisma.media.update({
        where: { id: item.id },
        data: { url: result.secure_url, publicId: result.public_id },
      });
      migrated++;
    }

    return { migrated, total: items.length };
  }
}
