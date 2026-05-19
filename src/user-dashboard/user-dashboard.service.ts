import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserDashboardService {
  constructor(private prisma: PrismaService) {}

  private assertUser(role: string) {
    if (role !== 'user') {
      throw new ForbiddenException('Accès réservé aux clients');
    }
  }

  async getDashboard(userId: number, email: string, role: string) {
    this.assertUser(role);

    const quotes = await this.prisma.quote.findMany({
      where: {
        OR: [{ userId }, { client: { email } }],
      },
      include: { client: true },
      orderBy: { createdAt: 'desc' },
    });

    const pending = quotes.filter((q) => q.status === 'En attente').length;
    const inProgress = quotes.filter((q) =>
      ['En révision', 'Envoyé'].includes(q.status),
    ).length;
    const totalAmount = quotes.reduce((sum, q) => sum + (q.amount || 0), 0);

    const investments = await this.prisma.investment.findMany({
      where: { status: 'active' },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return {
      stats: {
        quotesTotal: quotes.length,
        quotesPending: pending,
        quotesInProgress: inProgress,
        totalAmount,
        activeInvestments: investments.length,
      },
      recentQuotes: quotes.slice(0, 5),
      featuredInvestments: investments,
    };
  }

  async getQuotes(userId: number, email: string, role: string) {
    this.assertUser(role);
    return this.prisma.quote.findMany({
      where: {
        OR: [{ userId }, { client: { email } }],
      },
      include: { client: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
