import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';

@WebSocketGateway({ cors: { origin: '*' } })
export class AdminGateway
  implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server: Server;

  handleConnection(socket: Socket) {
    console.log('⚡ Incoming socket connection attempt');

    try {
      const token = socket.handshake.auth?.token;
      if (!token) throw new Error('No token');

      const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;

      if (payload.role !== 'admin') {
        throw new Error('Not admin');
      }

      socket.join('admin');
      console.log('🟢 ADMIN SOCKET CONNECTED:', socket.id);
    } catch (err) {
      console.log('❌ SOCKET AUTH FAILED:', err.message);
      socket.disconnect();
    }
  }


  handleDisconnect(socket: Socket) {
    console.log('🔴 SOCKET DISCONNECTED:', socket.id);
  }

  // ✅ ADD THESE TWO METHODS ⬇⬇⬇

  emitNewOrder(order: any) {
    this.server.to('admin').emit('order:new', order);
  }

  emitOrderUpdate(order: any) {
    this.server.to('admin').emit('order:update', order);
  }
}
