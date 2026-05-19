import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LogsService } from '../logs/logs.service';

@Injectable()
export class ClientsService {
  constructor(
    private prisma: PrismaService,
    private logsService: LogsService,
  ) {}

  async findAll() {
    const clients = await this.prisma.client.findMany({
      include: { quotes: true },
    });
    const users = await this.prisma.user.findMany({
      where: { role: 'user' },
      include: { quotes: true },
    });

    const mappedUsers = users.map((u) => ({
      id: `user-${u.id}`,
      name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email.split('@')[0],
      email: u.email,
      phone: u.phone,
      company: 'Utilisateur Web',
      status: 'Actif',
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
      quotes: u.quotes,
      isWebUser: true,
    }));

    return [...clients, ...mappedUsers];
  }

  findOne(id: number) {
    return this.prisma.client.findUnique({
      where: { id },
      include: { quotes: true },
    });
  }

  async create(data: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    status?: string;
  }) {
    const client = await this.prisma.client.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        status: data.status || 'Actif',
      },
    });
    await this.logsService.createLog('admin', 'create', 'client', 'success', '0.0.0.0', client.name);
    return client;
  }

  async update(
    id: number,
    data: Partial<{ name: string; email: string; phone?: string; company?: string; status?: string }>,
  ) {
    const client = await this.prisma.client.update({
      where: { id },
      data,
    });
    await this.logsService.createLog('admin', 'update', 'client', 'success', '0.0.0.0', client.name);
    return client;
  }

  async remove(id: number) {
    const client = await this.prisma.client.delete({ where: { id } });
    await this.logsService.createLog('admin', 'delete', 'client', 'success', '0.0.0.0', client.name);
    return client;
  }
}
