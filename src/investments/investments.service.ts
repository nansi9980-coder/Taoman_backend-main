import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InvestmentsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.investment.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  findPublic() {
    return this.prisma.investment.findMany({
      where: { status: 'active' },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: number) {
    return this.prisma.investment.findUnique({ where: { id } });
  }

  create(data: { name: string; description?: string; amount: number; risk?: string }) {
    return this.prisma.investment.create({ data });
  }

  update(id: number, data: Partial<{ name: string; description?: string; amount: number; roi?: number; risk?: string; status?: string }>) {
    return this.prisma.investment.update({
      where: { id },
      data,
    });
  }

  remove(id: number) {
    return this.prisma.investment.delete({ where: { id } });
  }
}