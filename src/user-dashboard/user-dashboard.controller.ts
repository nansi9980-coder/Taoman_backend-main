import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserDashboardService } from './user-dashboard.service';

@Controller('me')
@UseGuards(JwtAuthGuard)
export class UserDashboardController {
  constructor(private readonly userDashboardService: UserDashboardService) {}

  @Get('dashboard')
  getDashboard(@Request() req: { user: { userId: number; email: string; role: string } }) {
    const { userId, email, role } = req.user;
    return this.userDashboardService.getDashboard(userId, email, role);
  }

  @Get('quotes')
  getQuotes(@Request() req: { user: { userId: number; email: string; role: string } }) {
    const { userId, email, role } = req.user;
    return this.userDashboardService.getQuotes(userId, email, role);
  }
}
