import { Module } from '@nestjs/common';
import { QuotesController } from './quotes.controller';
import { QuotesService } from './quotes.service';
import { PrismaModule } from '../prisma/prisma.module';
import { LogsModule } from '../logs/logs.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { MailModule } from '../mail/mail.module';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [PrismaModule, LogsModule, NotificationsModule, MailModule, MediaModule],
  controllers: [QuotesController],
  providers: [QuotesService],
})
export class QuotesModule {}