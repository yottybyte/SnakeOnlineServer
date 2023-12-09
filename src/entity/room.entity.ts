import { v4 as uuidv4 } from 'uuid';
import { Player } from './player.entity';
import { UserEntity } from './user.entity';
import { DirectionsEnum, SnakeEntity } from './snake.entity';
import { MapEntity } from './map.entity';
import { Server } from 'socket.io';

export default class RoomEntity {
  private server: Server;

  private readonly STEP_INTERVAL = 25;

  private readonly id: string;
  private readonly map: MapEntity;
  private readonly players: Map<string, Player> = new Map();
  private lifeTime: number = 0;


  constructor(users: UserEntity[], server: Server) {
    this.server = server;
    this.id = uuidv4();

    this.map = new MapEntity(48, 24);


    users.forEach((user) => {
      this.addUser(user);
    });
  }

  public addUser(user: UserEntity) {
    const player = new Player(
      user,
      new SnakeEntity(8 + this.players.size * 2, 10, DirectionsEnum.UP),
    );
    user.addRoom(this.id);

    user.getSocket().broadcast.to(this.id).emit('joined-player', player.serialize());
    this.players.set(user.getID(), player);
  }

  public getID() {
    return this.id;
  }

  public getMap() {
    return this.map.getMap();
  }

  public getPlayer(playerID: string) {
    return this.players.get(playerID);
  }

  public getPlayers() {
    return Array.from(this.players.values()).map((player) => player.serialize());
  }

  public destroy() {
    for (const [key, player] of this.players.entries()) {
      player.getUser().removeRoom(this.id);
      this.players.delete(key);
    }
  }

  public async startGameLoop() {
    while (true) {
      const startTime = Date.now();
      if (this.players.size > 0) {
        this.handleGameLoop(this.lifeTime);
        this.server.to(this.id).emit('step', {
          time: startTime,
          eat: [],
          players: this.getPlayers(),
        });
      }
      const diffTime = Date.now() - startTime;
      this.lifeTime += this.STEP_INTERVAL;
      await this.snooze(this.STEP_INTERVAL - diffTime);
    }
  }

  private handleGameLoop(time: number) {
    for (const player of this.players.values()) {
      if (time % 1000 === 0) {
        this.server.to(this.id).emit('time-sec');
      }
      if (time % 150 === 0) {
        if (!player.getSnake().isSpeedBonusActive()) {
          player.getSnake().gameStep();
        }
      }
      if (time % 50 === 0) {
        if (player.getSnake().isSpeedBonusActive()) {
          player.getSnake().gameStep();
        }
      }
      if (time % 25 === 0) {
        // Снаряды
      }

      // Все остальное (колизии, еда, и прочее)
    }

    // for (const player of this.players.values()) {
    // snake.player.getSocket().emit('step', this.serialize());
    // }
  }

  private async snooze(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
