import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';
import { LogsService } from '../logs/logs.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ContactsService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway,
    private logsService: LogsService,
    private notificationsService: NotificationsService,
  ) {}

  async create(data: { name: string; email: string; phone?: string; subject: string; message: string }) {
    if (!data.name?.trim() || !data.email?.trim() || !data.subject?.trim() || !data.message?.trim()) {
      throw new BadRequestException('Nom, email, sujet et message sont requis');
    }

    const contact = await this.prisma.contact.create({
      data: {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone?.trim() || null,
        subject: data.subject.trim(),
        message: data.message.trim(),
      },
    });

    this.eventsGateway.emitContact(contact);
    await this.logsService.createLog(
      'vitrine',
      'create',
      'contact',
      'success',
      '0.0.0.0',
      `${contact.name} - ${contact.subject}`,
    );
    await this.notificationsService.create({
      type: 'contact',
      title: 'Nouveau contact',
      message: `${contact.name}: ${contact.subject}`,
    });

    return contact;
  }

  async findAll() {
    return this.prisma.contact.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.contact.findUnique({ where: { id } });
  }

  async update(
    id: number,
    data: Partial<{ name: string; email: string; phone: string; subject: string; message: string; status: string }>,
  ) {
    return this.prisma.contact.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    return this.prisma.contact.delete({ where: { id } });
  }
}
