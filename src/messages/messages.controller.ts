import { Controller, Get, Post, Put, Param, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MessagesService } from './messages.service';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  findAll(@Request() req: any) {
    return this.messagesService.findAllForUser(req.user.userId);
  }

  @Get('sent')
  findSent(@Request() req: any) {
    return this.messagesService.findSentByUser(req.user.userId);
  }

  @Post()
  create(@Request() req: any, @Body() data: { subject: string; content: string; toId?: number }) {
    return this.messagesService.create(req.user.userId, data);
  }

  @Put(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.messagesService.markAsRead(+id);
  }
}