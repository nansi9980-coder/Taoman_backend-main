import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [userCount, clientCount, quoteCount, jobCount, investmentCount, messageCount] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.client.count(),
      this.prisma.quote.count(),
      this.prisma.job.count(),
      this.prisma.investment.count(),
      this.prisma.message.count(),
    ]);

    const recentQuotes = await this.prisma.quote.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { client: true },
    });

    const totalInvestmentValue = await this.prisma.investment.aggregate({
      _sum: { amount: true },
    });

    return {
      counts: {
        users: userCount,
        clients: clientCount,
        quotes: quoteCount,
        jobs: jobCount,
        investments: investmentCount,
        messages: messageCount,
      },
      recentQuotes,
      totalInvestmentValue: totalInvestmentValue._sum.amount || 0,
    };
  }
}