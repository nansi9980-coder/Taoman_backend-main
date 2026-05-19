import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.job.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  findPublished() {
    return this.prisma.job.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: number) {
    return this.prisma.job.findUnique({ where: { id } });
  }

  create(data: { title: string; category?: string; description: string; skills?: string; location?: string; type?: string; startDate?: string; endDate?: string }) {
    const jobData: any = { ...data };
    if (data.startDate) jobData.startDate = new Date(data.startDate);
    if (data.endDate) jobData.endDate = new Date(data.endDate);
    return this.prisma.job.create({ data: jobData });
  }

  update(id: number, data: Partial<{ title: string; category?: string; description: string; skills?: string; location?: string; type?: string; published: boolean; startDate?: string; endDate?: string }>) {
    const jobData: any = { ...data };
    if (data.startDate) jobData.startDate = new Date(data.startDate);
    if (data.endDate) jobData.endDate = new Date(data.endDate);
    return this.prisma.job.update({
      where: { id },
      data: jobData,
    });
  }

  remove(id: number) {
    return this.prisma.job.delete({ where: { id } });
  }

  // Alias for controller
  findPublic() {
    return this.findPublished();
  }
}