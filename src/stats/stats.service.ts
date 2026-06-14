import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  private buildTimelines() {
    const months: { label: string; year: number; month: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: d.toLocaleString('fr-FR', { month: 'short' }),
        year: d.getFullYear(),
        month: d.getMonth(),
      });
    }
    return months;
  }

  async getDashboardStats() {
    const months = this.buildTimelines();

    const clientsCount = await this.prisma.user.count({ where: { role: 'user' } });
    const quotesCount = await this.prisma.quote.count();

    const quotes = await this.prisma.quote.findMany({
      where: { status: { not: 'Refusé' } },
    });
    const revenue = quotes.reduce((acc, q) => acc + (q.amount || 0), 0);

    const jobsCount = await this.prisma.job.count({ where: { published: true } });
    const pendingQuotes = await this.prisma.quote.count({ where: { status: 'En attente' } });
    const appointmentsCount = await this.prisma.appointment.count({ where: { status: 'scheduled' } });

    const acceptedQuotesCount = await this.prisma.quote.count({ where: { status: 'Accepté' } });
    const conversionRate = quotesCount > 0 ? Math.round((acceptedQuotesCount / quotesCount) * 100) : 0;

    const users = await this.prisma.user.findMany({ where: { role: 'user' } });
    const inscriptionsTimeline = months.map((m) => {
      const count = users.filter((u) => {
        const d = new Date(u.createdAt);
        return d.getFullYear() === m.year && d.getMonth() === m.month;
      }).length;
      return { mois: m.label, inscriptions: count };
    });

    const allQuotes = await this.prisma.quote.findMany();
    const quotesTimeline = months.map((m) => {
      const qs = allQuotes.filter((q) => {
        const d = new Date(q.createdAt);
        return d.getFullYear() === m.year && d.getMonth() === m.month;
      });
      return {
        mois: m.label,
        enAttente: qs.filter((q) => q.status === 'En attente').length,
        accepté: qs.filter((q) => q.status === 'Accepté').length,
        refusé: qs.filter((q) => q.status === 'Refusé').length,
      };
    });

    return {
      clients: clientsCount,
      quotes: quotesCount,
      revenue,
      jobs: jobsCount,
      pendingQuotes,
      acceptedQuotes: acceptedQuotesCount,
      conversionRate,
      appointments: appointmentsCount,
      inscriptionsTimeline,
      quotesTimeline,
    };
  }

  async getOverview() {
    const base = await this.getDashboardStats();

    const [
      newContacts,
      newProjectSubmissions,
      publishedServices,
      filledContentSections,
      recentContacts,
      recentQuotes,
      recentProjectSubmissions,
      recentLogs,
    ] = await Promise.all([
      this.prisma.contact.count({ where: { status: 'nouveau' } }),
      this.prisma.projectSubmission.count({ where: { status: 'nouveau' } }),
      this.prisma.serviceCard.count({ where: { published: true } }),
      this.prisma.siteContent.count(),
      this.prisma.contact.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.quote.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { client: true },
      }),
      this.prisma.projectSubmission.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.log.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      ...base,
      newContacts,
      newProjectSubmissions,
      publishedServices,
      filledContentSections,
      recentContacts,
      recentQuotes,
      recentProjectSubmissions,
      recentLogs,
    };
  }
}
