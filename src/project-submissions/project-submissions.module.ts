import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { LogsModule } from '../logs/logs.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { MailModule } from '../mail/mail.module';
import { MediaModule } from '../media/media.module';
import { ProjectSubmissionsService } from './project-submissions.service';
import { ProjectSubmissionsController } from './project-submissions.controller';

@Module({
  imports: [PrismaModule, LogsModule, NotificationsModule, MailModule, MediaModule],
  controllers: [ProjectSubmissionsController],
  providers: [ProjectSubmissionsService],
  exports: [ProjectSubmissionsService],
})
export class ProjectSubmissionsModule {}
