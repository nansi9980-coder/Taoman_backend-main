import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MediaService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.media.findMany({
      orderBy: { uploadedAt: 'desc' },
    });
  }

  async saveMediaInfo(name: string, type: string, size: string, url: string, category: string = 'general') {
    return this.prisma.media.create({
      data: {
        name,
        type,
        size,
        url,
        category,
      },
    });
  }

  async delete(id: number) {
    const media = await this.prisma.media.findUnique({ where: { id } });
    if (media) {
      const filePath = path.join(process.cwd(), media.url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return this.prisma.media.delete({ where: { id } });
    }
    return null;
  }
}
