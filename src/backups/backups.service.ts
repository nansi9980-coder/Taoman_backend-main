import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

const BACKUP_VERSION = 1;

@Injectable()
export class BackupsService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  private async buildExportPayload() {
    const [
      clients,
      quotes,
      contacts,
      siteContent,
      serviceCards,
      media,
      jobs,
      investments,
      appointments,
      notifications,
    ] = await Promise.all([
      this.prisma.client.findMany(),
      this.prisma.quote.findMany({ include: { client: true } }),
      this.prisma.contact.findMany(),
      this.prisma.siteContent.findMany(),
      this.prisma.serviceCard.findMany(),
      this.prisma.media.findMany(),
      this.prisma.job.findMany(),
      this.prisma.investment.findMany(),
      this.prisma.appointment.findMany(),
      this.prisma.notification.findMany(),
    ]);

    return {
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      clients,
      quotes,
      contacts,
      siteContent,
      serviceCards,
      media,
      jobs,
      investments,
      appointments,
      notifications,
    };
  }

  async createBackup() {
    const start = Date.now();
    const data = await this.buildExportPayload();
    const json = JSON.stringify(data, null, 2);
    const buffer = Buffer.from(json, 'utf-8');
    const timestamp = new Date().toISOString().replace(/[:.T]/g, '-').slice(0, 19);
    const backupName = `backup-${timestamp}.json`;
    const sizeMB = buffer.length / 1024 / 1024;

    let url: string | null = null;
    let publicId: string | null = null;

    if (this.cloudinary.isConfigured()) {
      const publicIdBase = `backup-${timestamp}`;
      const result = await this.cloudinary.uploadRaw(buffer, publicIdBase, 'taoman/backups');
      url = result.secure_url;
      publicId = result.public_id;
    }

    const durationMs = Date.now() - start;
    const backup = await this.prisma.backup.create({
      data: {
        name: backupName,
        size: sizeMB,
        type: 'Manuel',
        status: 'Complété',
        duration: durationMs < 1000 ? '< 1s' : `${(durationMs / 1000).toFixed(1)}s`,
        url,
        publicId,
      },
    });

    return {
      id: backup.id,
      name: backup.name,
      size: sizeMB.toFixed(2) + ' MB',
      type: backup.type,
      status: backup.status,
      duration: backup.duration,
      url: backup.url,
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
      url: b.url,
      publicId: b.publicId,
      createdAt: b.createdAt,
    }));
  }

  async runBackup() {
    return this.createBackup();
  }

  async getDownloadPayload(id: number) {
    const backup = await this.prisma.backup.findUnique({ where: { id } });
    if (!backup) {
      throw new BadRequestException('Backup introuvable');
    }

    if (backup.url) {
      const buffer = await this.cloudinary.fetchRaw(backup.url);
      return { filename: backup.name, buffer };
    }

    throw new BadRequestException('Ce backup ne contient pas de fichier cloud');
  }

  async delete(id: number) {
    const backup = await this.prisma.backup.findUnique({ where: { id } });
    if (!backup) {
      return { success: false, message: 'Backup introuvable' };
    }

    if (backup.publicId && this.cloudinary.isConfigured()) {
      try {
        await this.cloudinary.delete(backup.publicId, 'raw');
      } catch {
        // ignore
      }
    }

    await this.prisma.backup.delete({ where: { id } });
    return { success: true, message: 'Backup supprimé' };
  }

  async restore(id: number) {
    const backup = await this.prisma.backup.findUnique({ where: { id } });
    if (!backup?.url) {
      throw new BadRequestException('Backup cloud introuvable');
    }

    const buffer = await this.cloudinary.fetchRaw(backup.url);
    const payload = JSON.parse(buffer.toString('utf-8'));

    if (!payload?.version) {
      throw new BadRequestException('Format de backup invalide');
    }

    await this.prisma.$transaction(async (tx) => {
      if (Array.isArray(payload.siteContent)) {
        for (const row of payload.siteContent) {
          await tx.siteContent.upsert({
            where: { section: row.section },
            update: { content: row.content },
            create: { section: row.section, content: row.content },
          });
        }
      }

      if (Array.isArray(payload.serviceCards)) {
        await tx.serviceCard.deleteMany();
        for (const card of payload.serviceCards) {
          const { id: _id, createdAt: _c, ...data } = card;
          await tx.serviceCard.create({ data });
        }
      }

      const clientIdMap = new Map<number, number>();
      if (Array.isArray(payload.clients)) {
        for (const client of payload.clients) {
          const { id: oldId, createdAt, updatedAt, quotes, appointments, ...data } = client;
          const saved = await tx.client.upsert({
            where: { email: data.email },
            update: {
              name: data.name,
              phone: data.phone,
              company: data.company,
              status: data.status,
            },
            create: {
              name: data.name,
              email: data.email,
              phone: data.phone,
              company: data.company,
              status: data.status ?? 'Actif',
            },
          });
          if (oldId) clientIdMap.set(oldId, saved.id);
        }
      }

      if (Array.isArray(payload.contacts)) {
        await tx.contact.deleteMany();
        for (const c of payload.contacts) {
          const { id: _id, createdAt, ...data } = c;
          await tx.contact.create({ data });
        }
      }

      if (Array.isArray(payload.quotes)) {
        await tx.quote.deleteMany();
        for (const q of payload.quotes) {
          const { id: _id, createdAt, updatedAt, client, user, ...data } = q;
          const clientId = data.clientId ? clientIdMap.get(data.clientId) ?? data.clientId : null;
          await tx.quote.create({
            data: {
              title: data.title,
              description: data.description,
              status: data.status,
              amount: data.amount,
              pdfUrl: data.pdfUrl,
              service: data.service,
              clientId,
              userId: data.userId,
            },
          });
        }
      }

      if (Array.isArray(payload.jobs)) {
        await tx.job.deleteMany();
        for (const job of payload.jobs) {
          const { id: _id, createdAt, updatedAt, ...data } = job;
          await tx.job.create({ data });
        }
      }

      if (Array.isArray(payload.investments)) {
        await tx.investment.deleteMany();
        for (const inv of payload.investments) {
          const { id: _id, createdAt, updatedAt, ...data } = inv;
          await tx.investment.create({ data });
        }
      }
    });

    await this.prisma.log.create({
      data: {
        user: 'admin',
        action: 'restore',
        resource: 'backup',
        status: 'success',
        ip: '0.0.0.0',
        details: `Restauration depuis ${backup.name}`,
      },
    });

    return { success: true, message: 'Restauration terminée' };
  }
}
