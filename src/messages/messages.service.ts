import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class MessagesService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway,
  ) {}

  findAllForUser(userId: number) {
    return this.prisma.message.findMany({
      where: {
        OR: [
          { fromId: userId },
          { toId: userId },
        ],
      },
      include: { from: { select: { id: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  findSentByUser(userId: number) {
    return this.prisma.message.findMany({
      where: { fromId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(fromId: number, data: { subject: string; content: string; toId?: number }) {
    const msg = await this.prisma.message.create({
      data: {
        ...data,
        fromId,
      },
    });
    this.eventsGateway.emitNotification({ type: 'message', message: msg });
    return msg;
  }

  markAsRead(id: number) {
    return this.prisma.message.update({
      where: { id },
      data: { read: true },
    });
  }
}