import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RealisationsService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    // Récupérer depuis SiteContent
    const siteContent = await this.prisma.siteContent.findUnique({
      where: { section: 'realisations' },
    });

    if (!siteContent?.content) {
      return [];
    }

    try {
      const content = typeof siteContent.content === 'string' 
        ? JSON.parse(siteContent.content) 
        : siteContent.content;
      return content.items || [];
    } catch {
      return [];
    }
  }

  async syncFromMedia(items: any[]) {
    // Sauvegarder directement dans SiteContent
    const content = {
      items: items.map(item => ({
        id: item.id || `real-${Date.now()}-${Math.random()}`,
        title: item.title || '',
        category: item.category || 'Terrain',
        progress: item.progress || 70,
        imageUrl: item.imageUrl || item.url || '',
      })),
    };

    return this.prisma.siteContent.upsert({
      where: { section: 'realisations' },
      update: { content: JSON.stringify(content) },
      create: { section: 'realisations', content: JSON.stringify(content) },
    });
  }

  async update(data: any) {
    const { items } = data;
    if (!Array.isArray(items)) {
      throw new Error('Items must be an array');
    }

    const content = {
      items: items.map(item => ({
        id: item.id || `real-${Date.now()}-${Math.random()}`,
        title: item.title || '',
        category: item.category || 'Terrain',
        progress: item.progress || 70,
        imageUrl: item.imageUrl || item.url || '',
      })),
    };

    return this.prisma.siteContent.upsert({
      where: { section: 'realisations' },
      update: { content: JSON.stringify(content) },
      create: { section: 'realisations', content: JSON.stringify(content) },
    });
  }
}
