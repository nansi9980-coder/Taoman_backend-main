import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: [
      process.env.FRONTEND_ADMIN_URL,
      process.env.FRONTEND_CLIENT_URL,
    ].filter(Boolean),
    credentials: true,
  },
})
export class EventsGateway {
  @WebSocketServer()
  server!: Server;

  emitLog(log: any) {
    this.server.emit('newLog', log);
  }

  emitNotification(notification: any) {
    this.server.emit('newNotification', notification);
  }

  emitQuote(quote: any) {
    this.server.emit('newQuote', quote);
  }

  emitQuoteUpdated(quote: any) {
    this.server.emit('quoteUpdated', quote);
  }

  emitContact(contact: any) {
    this.server.emit('newContact', contact);
  }
}