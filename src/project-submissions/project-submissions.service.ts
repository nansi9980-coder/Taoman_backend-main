import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';
import { LogsService } from '../logs/logs.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MailService } from '../mail/mail.service';
import { MediaService } from '../media/media.service';

@Injectable()
export class ProjectSubmissionsService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway,
    private logsService: LogsService,
    private notificationsService: NotificationsService,
    private mailService: MailService,
    private mediaService: MediaService,
  ) {}

  async submit(
    data: {
      projectName: string;
      sector: string;
      location: string;
      amount?: string;
      horizon?: string;
      website?: string;
      description: string;
      contactName: string;
      contactEmail: string;
      contactPhone: string;
    },
    attachment?: Express.Multer.File,
  ) {
    if (!data.projectName?.trim()) {
      throw new BadRequestException('Le nom du projet est requis');
    }
    if (!data.sector?.trim()) {
      throw new BadRequestException('Le secteur est requis');
    }
    if (!data.location?.trim()) {
      throw new BadRequestException('La localisation est requise');
    }
    if (!data.description?.trim()) {
      throw new BadRequestException('La description du projet est requise');
    }
    if (!data.contactName?.trim()) {
      throw new BadRequestException('Le nom du contact est requis');
    }
    if (!data.contactEmail?.trim()) {
      throw new BadRequestException("L'email du contact est requis");
    }
    if (!data.contactPhone?.trim()) {
      throw new BadRequestException('Le téléphone du contact est requis');
    }

    let attachmentUrl: string | null = null;
    if (attachment) {
      const media = await this.mediaService.uploadFile(attachment, 'project-submissions');
      attachmentUrl = media.url;
    }

    const submission = await this.prisma.projectSubmission.create({
      data: {
        projectName: data.projectName.trim(),
        sector: data.sector.trim(),
        location: data.location.trim(),
        amount: data.amount?.trim() || null,
        horizon: data.horizon?.trim() || null,
        website: data.website?.trim() || null,
        description: data.description.trim(),
        contactName: data.contactName.trim(),
        contactEmail: data.contactEmail.trim().toLowerCase(),
        contactPhone: data.contactPhone.trim(),
        attachmentUrl,
      },
    });

    this.eventsGateway.emitProjectSubmission(submission);
    await this.logsService.createLog(
      'vitrine',
      'submit',
      'project_submission',
      'success',
      '0.0.0.0',
      `Projet #${submission.id} - ${submission.projectName}`,
    );
    await this.notificationsService.create({
      type: 'project',
      title: 'Nouveau projet soumis',
      message: `${submission.projectName} — ${submission.contactName}`,
    });

    const attachmentLine = attachmentUrl
      ? `<p><strong>Document joint :</strong> <a href="${attachmentUrl}">${attachmentUrl}</a></p>`
      : '';

    await this.mailService.sendAdminAlert(
      `Nouveau projet soumis — ${submission.projectName}`,
      `<p><strong>${submission.contactName}</strong> (${submission.contactEmail})</p>
       <p><strong>Secteur :</strong> ${submission.sector}</p>
       <p><strong>Ticket :</strong> ${submission.amount || '—'}</p>
       <p><strong>Horizon :</strong> ${submission.horizon || '—'}</p>
       <p>${submission.description}</p>${attachmentLine}`,
    );

    return submission;
  }

  findAll() {
    return this.prisma.projectSubmission.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: number) {
    return this.prisma.projectSubmission.findUnique({ where: { id } });
  }

  update(id: number, data: Partial<{ status: string }>) {
    return this.prisma.projectSubmission.update({
      where: { id },
      data,
    });
  }

  remove(id: number) {
    return this.prisma.projectSubmission.delete({ where: { id } });
  }
}
