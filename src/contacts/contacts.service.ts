import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';
import { LogsService } from '../logs/logs.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MailService } from '../mail/mail.service';
import { MediaService } from '../media/media.service';

@Injectable()
export class ContactsService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway,
    private logsService: LogsService,
    private notificationsService: NotificationsService,
    private mailService: MailService,
    private mediaService: MediaService,
  ) {}

  async create(
    data: {
      name: string;
      email: string;
      phone?: string;
      subject: string;
      message: string;
      topic?: string;
    },
    attachment?: Express.Multer.File,
  ) {
    if (!data.name?.trim() || !data.email?.trim() || !data.subject?.trim() || !data.message?.trim()) {
      throw new BadRequestException('Nom, email, sujet et message sont requis');
    }

    let attachmentUrl: string | null = null;
    if (attachment) {
      const media = await this.mediaService.uploadFile(attachment, 'contact-attachments');
      attachmentUrl = media.url;
    }

    const contact = await this.prisma.contact.create({
      data: {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone?.trim() || null,
        subject: data.subject.trim(),
        message: data.message.trim(),
        attachmentUrl,
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

    const attachmentLine = attachmentUrl
      ? `<p><strong>Pièce jointe :</strong> <a href="${attachmentUrl}">${attachmentUrl}</a></p>`
      : '';
    const html = `<p><strong>${contact.name}</strong> (${contact.email})</p><p>${contact.message}</p>${attachmentLine}`;

    if (data.topic === 'partner') {
      const partnerEmail = process.env.PARTNER_CONTACT_EMAIL;
      if (partnerEmail) {
        await this.mailService.sendEmail(
          partnerEmail,
          `Partenariat B2B — ${contact.subject}`,
          html,
        );
      } else {
        await this.mailService.sendAdminAlert(`Partenariat B2B — ${contact.subject}`, html);
      }
    } else {
      await this.mailService.sendAdminAlert(`Nouveau contact — ${contact.subject}`, html);
    }

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
