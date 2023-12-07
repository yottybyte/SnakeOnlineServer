import { Injectable, Scope } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { Player } from '../entity/player.entity';
import RoomEntity from '../entity/room.entity';
import { WebSocketServer } from '@nestjs/websockets';
import { UserEntity } from '../entity/user.entity';

// interface PlayerRoom {
//   snake: Snake;
//   score: number;
// }
//
// interface Room {
//   isPause: boolean;
//   lifeTime: number;
//   players: PlayerRoom[];
//   eat: [];
// }

@Injectable({ scope: Scope.DEFAULT })
export class RoomService {
  private readonly rooms: Map<string, RoomEntity> = new Map();

  constructor() {}

  public getRoom(server: Server) {
    if (this.rooms.size <= 0) {
      const room = new RoomEntity([], server);
      this.rooms.set(room.getID(), room);
      this.rooms.get(room.getID()).startGameLoop();
    }

    const [firstRoom] = this.rooms.keys();
    return this.rooms.get(firstRoom);
  }

  public getFirstRoom() {
    const [room] = this.rooms.keys();
    return this.rooms.get(room);
  }

  // public addPlayer(client: Socket) {
  //   this.players.set(client.id, new Player(client));
  //   console.log('addPlayer', this.players.keys());
  // }
  //
  // public removePlayer(clientID: string) {
  //   this.players.delete(clientID);
  //   console.log('removePlayer', this.players.keys());
  // }
  //
  // public createRoom() {
  //   const roomId = uuidv4();
  //   this.rooms.set(roomId, new RoomEntity(roomId));
  // }
  // public removeRoom(uuid: string) {
  //   this.rooms.delete(uuid);
  // }

  // public addPlayerToRoom(playerID: string) {
  //   if (this.rooms.size <= 0) {
  //     this.createRoom();
  //   }
  //
  //   const player = this.players.get(playerID);
  //
  //   const [currentRoomKey] = this.rooms.keys();
  //   const currentRoom = this.rooms.get(currentRoomKey);
  //
  //   player.getSocket().join(currentRoomKey);
  //   const snake = new Snake(player, 2 + this.getRandomSnakePosition(2, 26), 20);
  //
  //   currentRoom.snakes.set(playerID, snake);
  //
  //   this.rooms.set(currentRoomKey, currentRoom);
  //
  //   player
  //     .getSocket()
  //     .broadcast.to(currentRoomKey)
  //     .emit(
  //       'joined-player',
  //       Array.from(currentRoom.snakes.values()).map((snake) => snake.serialize()),
  //     );
  //   setTimeout(() => {
  //     player
  //       .getSocket()
  //       // .to(currentRoomKey)
  //       .emit(
  //         'joined-player',
  //         Array.from(currentRoom.snakes.values()).map((snake) => snake.serialize()),
  //       );
  //   }, 1000);
  //
  //   return currentRoom;
  // }
  //
  // public removePlayerToRoom(playerID) {
  //   // const player = this.players.get(playerID);
  //   //
  //   // const currentRoomKey = this.rooms.keys()[0];
  //   // const currentRoom = this.rooms.get(currentRoomKey);
  // }
  //
  // private getRandomSnakePosition(min, max) {
  //   min = Math.ceil(min);
  //   max = Math.floor(max);
  //   return Math.floor(Math.random() * (max - min + 1)) + min;
  // }
  //
  // public getRoom(roomID) {
  //   return this.rooms.get(roomID);
  // }
}
