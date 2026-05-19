import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CalendarService {
  constructor(private prisma: PrismaService) {}

  getAppointments() {
    return this.prisma.appointment.findMany({
      include: { client: true }
    });
  }

  createAppointment(data: any) {
    return this.prisma.appointment.create({
      data: {
        title: data.title,
        date: new Date(data.date),
        status: data.status || 'scheduled',
        clientId: data.clientId ? Number(data.clientId) : null,
      }
    });
  }

  updateAppointment(id: number, data: any) {
    return this.prisma.appointment.update({
      where: { id },
      data: {
        title: data.title,
        date: data.date ? new Date(data.date) : undefined,
        status: data.status,
        clientId: data.clientId ? Number(data.clientId) : undefined,
      }
    });
  }

  deleteAppointment(id: number) {
    return this.prisma.appointment.delete({ where: { id } });
  }

  // Alias methods for controller
  findAll() {
    return this.getAppointments();
  }

  create(data: any) {
    return this.createAppointment(data);
  }

  update(id: number, data: any) {
    return this.updateAppointment(id, data);
  }

  remove(id: number) {
    return this.deleteAppointment(id);
  }
}
