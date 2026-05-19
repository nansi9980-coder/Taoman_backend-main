import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BackupsService {
  constructor(private prisma: PrismaService) {}

  async createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.T]/g, '-').slice(0, 19);
    const backupName = `backup-${timestamp}.json`;

    const data = {
      timestamp: new Date(),
      clients: await this.prisma.client.findMany(),
      quotes: await this.prisma.quote.findMany({ include: { client: true } }),
      appointments: await this.prisma.appointment.findMany(),
      investments: await this.prisma.investment.findMany(),
    };

    const sizeBytes = Buffer.byteLength(JSON.stringify(data));
    const sizeMB = sizeBytes / 1024 / 1024;

    const backup = await this.prisma.backup.create({
      data: {
        name: backupName,
        size: sizeMB,
        type: 'Manuel',
        status: 'Complété',
        duration: '< 1s',
      },
    });

    return {
      id: backup.id,
      name: backup.name,
      size: sizeMB.toFixed(2) + ' MB',
      type: backup.type,
      status: backup.status,
      createdAt: backup.createdAt,
    };
  }

  async findAll() {
    const backups = await this.prisma.backup.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return backups.map((b) => ({
      id: b.id,
      name: b.name,
      size: b.size.toFixed(2) + ' MB',
      type: b.type,
      status: b.status,
      duration: b.duration,
      createdAt: b.createdAt,
    }));
  }

  async runBackup() {
    return this.createBackup();
  }

  async delete(id: number) {
    const backup = await this.prisma.backup.findUnique({ where: { id } });
    if (!backup) {
      return { success: false, message: 'Backup introuvable' };
    }
    await this.prisma.backup.delete({ where: { id } });
    return { success: true, message: 'Backup supprimé' };
  }
}