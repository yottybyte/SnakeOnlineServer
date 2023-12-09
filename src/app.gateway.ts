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
import { DirectionsEnum } from './entity/snake.entity';
import { UserEntity } from './entity/user.entity';

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
  afterInit(server: Server) {}

  handleDisconnect(client: Socket) {}

  handleConnection(client: Socket, ...args: any[]) {
    console.log(client.id);
    client.emit('connected', client.id);
  }

  @SubscribeMessage('start-game')
  startGame(@ConnectedSocket() client: Socket) {
    const room = this.roomService.getRoom(this.server);
    room.addUser(new UserEntity({ socket: client, name: 'test' }));
    return {
      event: 'joined-room',
      data: {
        map: room.getMap(),
        eat: [],
        players: room.getPlayers(),
      },
    };
    // const room = this.roomService.addPlayerToRoom(client.id);
    // return { event: 'joined-room', data: { id: client.id, room: room.serialize() } };
  }

  @SubscribeMessage('direction')
  changeDirection(
    @ConnectedSocket() client: Socket,
    @MessageBody('direction') direction: DirectionsEnum,
  ) {
    this.roomService.getFirstRoom().getPlayer(client.id).getSnake().setDirection(direction);
    // const [_s, roomID] = client.rooms.keys();
    // this.roomService.getRoom(roomID).snakes.get(client.id).setDirection(direction);
  }

  @SubscribeMessage('speedBonus')
  activateSpeedBonus(
    @ConnectedSocket() client: Socket,
  ) {
    this.roomService.getFirstRoom().getPlayer(client.id).getSnake().activateSpeedBonus();
  }

  @SubscribeMessage('shot')
  createShot(
    @ConnectedSocket() client: Socket,
  ) {
    this.roomService.getFirstRoom().getPlayer(client.id).getSnake().spawnBullet();
  }
}
