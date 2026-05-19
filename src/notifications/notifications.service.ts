import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway,
  ) {}

  findAll() {
    return this.prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: { type: string; title: string; message: string; userId?: number }) {
    const notification = await this.prisma.notification.create({ data });
    this.eventsGateway.emitNotification(notification);
    return notification;
  }

  markRead(id: number) {
    return this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }

  markAllRead() {
    return this.prisma.notification.updateMany({
      data: { read: true },
    });
  }

  remove(id: number) {
    return this.prisma.notification.delete({ where: { id } });
  }
}
