import { v4 as uuidv4 } from 'uuid';
import { Injectable, Scope } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Player } from '../entity/player.entity';
import { Snake } from '../entity/snake.entity';
import RoomEntity from "../entity/room.entity";

interface PlayerRoom {
  snake: Snake;
  score: number;
}

interface Room {
  isPause: boolean;
  lifeTime: number;
  players: PlayerRoom[];
  eat: [];
}

@Injectable({ scope: Scope.DEFAULT })
export class RoomService {
  private readonly players: Map<string, Player> = new Map();
  private readonly rooms: Map<string, RoomEntity> = new Map();

  constructor() {}

  public addPlayer(client: Socket) {
    this.players.set(client.id, new Player(client));
    console.log('addPlayer', this.players.keys());
  }

  public removePlayer(clientID: string) {
    this.players.delete(clientID);
    console.log('removePlayer', this.players.keys());
  }

  public createRoom() {
    const roomId = uuidv4();
    this.rooms.set(roomId, new RoomEntity(roomId));
  }
  public removeRoom(uuid: string) {
    this.rooms.delete(uuid);
  }

  public addPlayerToRoom(playerID: string) {
    if (this.rooms.size <= 0) {
      this.createRoom();
    }

    const player = this.players.get(playerID);

    const [currentRoomKey] = this.rooms.keys();
    const currentRoom = this.rooms.get(currentRoomKey);

    currentRoom.snakes.push(new Snake(player,2 + this.getRandomSnakePosition(2, 26), 20));

    this.rooms.set(currentRoomKey, currentRoom);

    return currentRoomKey;
  }

  public removePlayerToRoom(playerID) {
    // const player = this.players.get(playerID);
    //
    // const currentRoomKey = this.rooms.keys()[0];
    // const currentRoom = this.rooms.get(currentRoomKey);
  }

  private getRandomSnakePosition(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  public getRoom(roomID) {
    return this.rooms.get(roomID).serialize();
  }
}
