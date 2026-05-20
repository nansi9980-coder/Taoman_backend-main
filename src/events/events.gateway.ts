import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

function socketCorsOrigin(
  origin: string | undefined,
  callback: (err: Error | null, allow?: boolean) => void,
) {
  if (!origin) return callback(null, true);
  const allowed = [
    process.env.FRONTEND_ADMIN_URL,
    process.env.FRONTEND_CLIENT_URL,
  ].filter((url): url is string => Boolean(url));
  if (allowed.includes(origin) || origin.endsWith('.vercel.app')) {
    return callback(null, true);
  }
  return callback(new Error(`Origin ${origin} not allowed by Socket.IO CORS`));
}

@WebSocketGateway({
  cors: {
    origin: socketCorsOrigin,
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