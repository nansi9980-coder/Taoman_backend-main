import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { MailModule } from './mail/mail.module';
import { AuthModule } from './auth/auth.module';
import { ClientsModule } from './clients/clients.module';
import { QuotesModule } from './quotes/quotes.module';
import { ContentModule } from './content/content.module';
import { JobsModule } from './jobs/jobs.module';
import { InvestmentsModule } from './investments/investments.module';
import { MessagesModule } from './messages/messages.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { UsersModule } from './users/users.module';
import { LogsModule } from './logs/logs.module';
import { ReportsModule } from './reports/reports.module';
import { MediaModule } from './media/media.module';
import { BackupsModule } from './backups/backups.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ThemeModule } from './theme/theme.module';
import { CalendarModule } from './calendar/calendar.module';
import { StatsModule } from './stats/stats.module';
import { EventsModule } from './events/events.module';
import { ContactsModule } from './contacts/contacts.module';
import { NotificationsModule } from './notifications/notifications.module';
import { UserDashboardModule } from './user-dashboard/user-dashboard.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    CloudinaryModule,
    PassportModule,
    PrismaModule,
    MailModule,
    AuthModule,
    ClientsModule,
    QuotesModule,
    ContentModule,
    JobsModule,
    InvestmentsModule,
    MessagesModule,
    DashboardModule,
    UsersModule,
    LogsModule,
    ReportsModule,
    MediaModule,
    BackupsModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    ThemeModule,
    CalendarModule,
    StatsModule,
    EventsModule,
    ContactsModule,
    NotificationsModule,
    UserDashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
