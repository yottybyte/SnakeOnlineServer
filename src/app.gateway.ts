import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { RoomService } from './room/room.service';

@WebSocketGateway({
  namespace: 'snake',
  cors: {
    origin: '*',
  },
})
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(private roomService: RoomService) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('sendMessage')
  async handleSendMessage(client: Socket): Promise<void> {
    this.server.emit('recMessage', 'payload');
  }

  afterInit(server: Server) {
    //Выполняем действия
  }

  handleDisconnect(client: Socket) {
    this.roomService.removePlayer(client.id);
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.roomService.addPlayer(client);
  }

  @SubscribeMessage('start-game')
  startGame(@ConnectedSocket() client: Socket): WsResponse<unknown> {
    const roomID = this.roomService.addPlayerToRoom(client.id);
    return { event: 'joined-room', data: { room: this.roomService.getRoom(roomID) } };
  }
}
