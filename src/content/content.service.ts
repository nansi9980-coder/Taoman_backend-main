import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContentService {
  constructor(private prisma: PrismaService) {}

  // ── ServiceCard ───────────────────────────────────────────────────────────

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
    return this.prisma.serviceCard.create({ data });
  }

  updateServiceCard(id: number, data: any) {
    return this.prisma.serviceCard.update({ where: { id }, data });
  }

  deleteServiceCard(id: number) {
    return this.prisma.serviceCard.delete({ where: { id } });
  }

  // ── SiteContent (textes éditables) ───────────────────────────────────────

  getSiteContents() {
    return this.prisma.siteContent.findMany();
  }

  getSiteContentBySection(section: string) {
    return this.prisma.siteContent.findUnique({ where: { section } });
  }

  upsertSiteContent(section: string, content: string) {
    return this.prisma.siteContent.upsert({
      where: { section },
      update: { content },
      create: { section, content },
    });
  }
}