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
          bullets: this.getBullets(),
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
      console.log(this.stepLoopEntities.length);
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
        console.log(1);
        this.server.to(this.id).emit('destroy-eat', {
          id: keyEat,
        });
      }

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

    for (const [onePlayerKey, onePlayer] of this.players) {
      for (const [twoPlayerKey, twoPlayer] of this.players) {
        if (onePlayer.getUser().getID() === twoPlayer.getUser().getID()) {
          continue;
        }

        for (const twoPlayerSnakeBody of twoPlayer.getSnake().getBody()) {
          if (
            twoPlayerSnakeBody.y === onePlayer.getSnake().getY() &&
            twoPlayerSnakeBody.x === onePlayer.getSnake().getX()
          ) {
            const spawnData = this.map.getSpawner(onePlayer.getUser().getID());

            const playerIndex = this.stepLoopEntities.findIndex(
              (entity) =>
                entity instanceof SnakeEntity && entity.getID() === onePlayer.getSnake().getID(),
            );
            if (playerIndex !== -1) {
              this.stepLoopEntities.splice(playerIndex, 1);

              this.server.to(this.id).emit('dead', {
                id: onePlayer.getUser().getID(),
              });

              setTimeout(() => {
                onePlayer.setSnake(
                  new SnakeEntity(this, spawnData.x, spawnData.y, spawnData.directions),
                );

                this.server.to(this.id).emit('respawn', {
                  id: onePlayer.getUser().getID(),
                });
              }, 3000);
            }

            break;
          }
        }
      }
    }

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
              const spawnData = this.map.getSpawner(player.getUser().getID());

              const playerIndex = this.stepLoopEntities.findIndex(
                (entity) =>
                  entity instanceof SnakeEntity && entity.getID() === player.getSnake().getID(),
              );
              this.stepLoopEntities.splice(playerIndex, 1);

              this.server.to(this.id).emit('dead', {
                id: player.getUser().getID(),
              });

              setTimeout(() => {
                player.setSnake(
                  new SnakeEntity(this, spawnData.x, spawnData.y, spawnData.directions),
                );

                this.server.to(this.id).emit('respawn', {
                  id: player.getUser().getID(),
                });
              }, 3000);
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
    player.setSnake(new SnakeEntity(this, spawnData.x, spawnData.y, spawnData.directions));
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
