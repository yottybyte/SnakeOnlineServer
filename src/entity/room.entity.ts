import {v4 as uuidv4} from 'uuid';
import {Player} from './player.entity';
import {UserEntity} from './user.entity';
import {DirectionsEnum, SnakeEntity} from './snake.entity';
import {MapEntity, MapItemTypeEnum} from './map.entity';
import {Server} from 'socket.io';
import {IStepGameLoop} from "../interfaces/IStepGameLoop";
import BulletEntity from "./bullet.entity";

export default class RoomEntity {
  private server: Server;

  private readonly STEP_INTERVAL = 25;

  private readonly id: string;
  private readonly map: MapEntity;
  private readonly players: Map<string, Player> = new Map();
  private readonly stepLoopEntities: IStepGameLoop[] = [];
  private lifeTime: number = 0;


  constructor(users: UserEntity[], server: Server) {
    this.server = server;
    this.id = uuidv4();

    this.map = new MapEntity(48, 24);


    users.forEach((user) => {
      this.addUser(user);
    });
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
          bullets: this.getBullets()
        });
      }
      const diffTime = Date.now() - startTime;
      this.lifeTime += this.STEP_INTERVAL;
      await this.snooze(this.STEP_INTERVAL - diffTime);
    }
  }

  private handleGameLoop(time: number) {
    if (time % 1000 === 0) {
      this.server.to(this.id).emit('time-sec');
    }
    // Расчет логики
    for (const entity of this.stepLoopEntities) {
      entity.gameStep(this.lifeTime);
    }

    // Считаем коллизии по стенам
    for (const ceil of this.map.getMap().physicalItems) {
      if (ceil.type !== MapItemTypeEnum.SOLID) {
        continue;
      }
      for (const entity of this.stepLoopEntities) {
        if (ceil.x === entity.getX() && ceil.y === entity.getY()) {
          if (entity instanceof BulletEntity) {
            entity.destroy();
          }
        }
      }
    }
  }

  private async snooze(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  public addLoopEntity(entity: IStepGameLoop): void {
    this.stepLoopEntities.push(entity);
  }

  public addUser(user: UserEntity) {
    const player = new Player(
      this,
      user,
      new SnakeEntity(this,8 + this.players.size * 2, 10, DirectionsEnum.UP),
    );
    user.addRoom(this.id);

    user.getSocket().broadcast.to(this.id).emit('joined-player', player.serialize());
    this.players.set(user.getID(), player);
  }

  public deleteBullet(id: string): void {
     const bulletIndex = this.stepLoopEntities
       .findIndex((entity) => entity instanceof BulletEntity && entity.getId() === id);
     this.stepLoopEntities.splice(bulletIndex, 1);
     this.server.to(this.id).emit('delete-bullet', {
       id: id
     });
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
  public getBullets() {
    return this.stepLoopEntities.filter(entity => entity instanceof BulletEntity).map((bullet: BulletEntity) => {
      return bullet.serialize();
    });
  }
}
