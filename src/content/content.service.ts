import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContentService {
  constructor(private prisma: PrismaService) {}

  private pickServiceCardData(data: any) {
    const allowed = ['title', 'description', 'icon', 'imageUrl', 'actionText', 'actionLink', 'published'];
    const picked: Record<string, unknown> = {};
    for (const key of allowed) {
      if (data[key] !== undefined) picked[key] = data[key];
    }
    return picked;
  }

  normalizeContent(content: string | Record<string, unknown>): string {
    if (typeof content === 'string') return content;
    return JSON.stringify(content);
  }

  getServiceCards(publishedOnly = false) {
    return this.prisma.serviceCard.findMany({
      where: publishedOnly ? { published: true } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  getServiceCardById(id: number) {
    return this.prisma.serviceCard.findUnique({ where: { id } });
  }

  createServiceCard(data: any) {
    return this.prisma.serviceCard.create({
      data: this.pickServiceCardData(data) as any,
    });
  }

  updateServiceCard(id: number, data: any) {
    return this.prisma.serviceCard.update({
      where: { id },
      data: this.pickServiceCardData(data),
    });
  }

  deleteServiceCard(id: number) {
    return this.prisma.serviceCard.delete({ where: { id } });
  }

  async getAdminOverview() {
    const [services, texts] = await Promise.all([
      this.getServiceCards(),
      this.getSiteContents(),
    ]);
    return { services, texts };
  }

  getSiteContents() {
    return this.prisma.siteContent.findMany({ orderBy: { section: 'asc' } });
  }

  getSiteContentBySection(section: string) {
    return this.prisma.siteContent.findUnique({ where: { section } });
  }

  upsertSiteContent(section: string, content: string | Record<string, unknown>) {
    const contentStr = this.normalizeContent(content);
    return this.prisma.siteContent.upsert({
      where: { section },
      update: { content: contentStr },
      create: { section, content: contentStr },
    });
  }

  deleteSiteContent(section: string) {
    return this.prisma.siteContent.delete({ where: { section } });
  }
}
