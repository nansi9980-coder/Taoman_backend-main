import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class LogsService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway,
  ) {}

  async findAll() {
    return this.prisma.log.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async createLog(
    user: string,
    action: string,
    resource: string,
    status: string,
    ip: string,
    details?: string,
  ) {
    const log = await this.prisma.log.create({
      data: { user, action, resource, status, ip, details },
    });
    this.eventsGateway.emitLog(log);
    return log;
  }
}
