import { v4 as uuidv4 } from 'uuid';
import { Player } from './player.entity';
import { UserEntity } from './user.entity';
import { SnakeEntity } from './snake.entity';
import { MapEntity, MapItemTypeEnum } from './map.entity';
import { Server } from 'socket.io';
import { IStepGameLoop } from '../interfaces/IStepGameLoop';
import BulletEntity from './bullet.entity';
import { EatEntity } from './eat.entity';

export default class RoomEntity {
  public server: Server;

  private readonly STEP_INTERVAL = 25;

  public readonly id: string;
  public readonly map: MapEntity;
  public readonly players: Map<string, Player> = new Map();
  public readonly stepLoopEntities: IStepGameLoop[] = [];
  protected lifeTime: number = 0;
  protected freeLoadPercents: number = 100;

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
          bullets: this.getBullets(),
        });
      }
      const diffTime = Date.now() - startTime;
      this.lifeTime += this.STEP_INTERVAL;
      const freeTime = this.STEP_INTERVAL - diffTime;
      const onePercent = 100 / this.STEP_INTERVAL;
      this.freeLoadPercents = 100 - (onePercent * freeTime);
      await this.snooze(freeTime);
    }
  }

  private handleGameLoop(time: number) {
    if (time % 1000 === 0) {
      this.server.to(this.id).emit('time-sec');
    }

    if (time % 6000 === 0) {
      const eat = this.map.createEat();
      this.addLoopEntity(eat);
      if (eat) {
        this.server.to(this.id).emit('spawn-eat', {
          id: eat.getID(),
          x: eat.getX(),
          y: eat.getY(),
        });
      }
    }

    // Расчет логики
    for (const entity of this.stepLoopEntities) {
      entity.gameStep(this.lifeTime);
    }

    // Считаем коллизии еды
    for (const [keyEat, eat] of this.map.getEats()) {
      if (eat.isDead()) {
        this.map.destroyEat(keyEat);
        const eatIndex = this.stepLoopEntities.findIndex(
          (item) => item instanceof EatEntity && item.getID() === keyEat,
        );
        this.stepLoopEntities.splice(eatIndex, 1);
        this.server.to(this.id).emit('destroy-eat', {
          id: keyEat,
        });
      }

      // Коллизии с едой
      for (const player of this.players.values()) {
        const snake = player.getSnake();
        if (eat.getX() === snake.getX() && eat.getY() === snake.getY()) {
          this.map.destroyEat(keyEat);
          const eatIndex = this.stepLoopEntities.findIndex(
            (item) => item instanceof EatEntity && item.getID() === keyEat,
          );
          this.stepLoopEntities.splice(eatIndex, 1);
          player.getSnake().addCeil();
          this.server.to(this.id).emit('destroy-eat', {
            id: keyEat,
          });
        }
      }
    }

    // Коллизии змеек
    for (const [onePlayerKey, player] of this.players) {
      // со змейками
      for (const [twoPlayerKey, otherPlayer] of this.players) {
        if (player.getUser().getID() === otherPlayer.getUser().getID()) {
          continue;
        }

        for (const twoPlayerSnakeBody of otherPlayer.getSnake().getBody()) {
          if (
            twoPlayerSnakeBody.y === player.getSnake().getY() &&
            twoPlayerSnakeBody.x === player.getSnake().getX()
          ) {
            player.dead();
            break;
          }
        }
      }
      // Со своей змейкой
      for (let i = 0; i < player.getSnake().getBody().length; i++) {
        const bodyItem = player.getSnake().getBody()[i];
        if (i > 0 && player.getSnake().getX() === bodyItem.x && player.getSnake().getY() === bodyItem.y) {
          player.dead();
          break;
        }
      }
      // С пулькой
      const bullets: BulletEntity[] = this.stepLoopEntities.filter(item => item instanceof BulletEntity) as BulletEntity[];
      for (const bullet of bullets) {
        for (let i = 0; i < player.getSnake().getBody().length; i++) {
          const bodyItem = player.getSnake().getBody()[i];
          if (player.getUser().getID() !== bullet.getPlayerId() && bodyItem.x === bullet.getX() && bodyItem.y === bullet.getY()) {
            bullet.destroy();
            player.shorten(i);
            if (player.getSnake().getBody().length < 3) {
              player.dead();
            }
            break;
          }
        }
      }

      // С едой туду
    }

    // Коллизии со стенами
    for (const ceil of this.map.getMap().physicalItems) {
      if (ceil.type !== MapItemTypeEnum.SOLID) {
        continue;
      }
      for (const entity of this.stepLoopEntities) {
        if (ceil.x === entity.getX() && ceil.y === entity.getY()) {
          if (entity instanceof SnakeEntity) {
            const player = Array.from(this.players.values()).find(
              (player) => player.getSnake().getID() === entity.getID(),
            );

            if (player) {
              player.dead()
            }
          }
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
    const spawnData = this.map.getSpawner(user.getID());

    const player = new Player(this, user);
    player.setSnake(new SnakeEntity(this, player, spawnData.x, spawnData.y, spawnData.directions));
    user.addRoom(this.id);

    user.getSocket().broadcast.to(this.id).emit('joined-player', player.serialize());
    this.players.set(user.getID(), player);
  }

  public removeUser(userID: string) {
    const player = this.players.get(userID);
    if (player) {
      const playerIndex = this.stepLoopEntities.findIndex(
        (entity) => entity instanceof SnakeEntity && entity.getID() === player.getSnake().getID(),
      );
      this.stepLoopEntities.splice(playerIndex, 1);
      this.players.delete(userID);
      this.map.clearSpawner(userID);

      this.server.to(this.id).emit('delete-player', {
        id: userID,
      });
    }
  }

  public deleteBullet(id: string): void {
    const bulletIndex = this.stepLoopEntities.findIndex(
      (entity) => entity instanceof BulletEntity && entity.getId() === id,
    );
    this.stepLoopEntities.splice(bulletIndex, 1);
    this.server.to(this.id).emit('delete-bullet', {
      id: id,
    });
  }

  public getServerStats() {
    return {
      serverLoad: this.freeLoadPercents,
      timestamp: Date.now(),
    }
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
    return this.stepLoopEntities
      .filter((entity) => entity instanceof BulletEntity)
      .map((bullet: BulletEntity) => {
        return bullet.serialize();
      });
  }
}
