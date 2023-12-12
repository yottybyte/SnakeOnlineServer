import { UserEntity } from './user.entity';
import { SnakeEntity } from './snake.entity';
import RoomEntity from './room.entity';

export class Player {
  private score: number = 0;
  private readonly user: UserEntity;
  private snake: SnakeEntity;
  private readonly room: RoomEntity;

  constructor(room: RoomEntity, user: UserEntity) {
    this.user = user;
    this.room = room;
  }

  public getUser() {
    return this.user;
  }

  public getSnake() {
    return this.snake;
  }

  public setSnake(snake: SnakeEntity) {
    this.snake = snake;
  }

  public dead() {
    const spawnData = this.room.map.getSpawner(this.getUser().getID());
    const playerIndex = this.room.stepLoopEntities.findIndex(
      (entity) =>
        entity instanceof SnakeEntity && entity.getID() === this.getSnake().getID(),
    );
    if (playerIndex !== -1) {
      this.room.stepLoopEntities.splice(playerIndex, 1);

      this.room.server.to(this.room.id).emit('dead', {
        id: this.getUser().getID(),
      });
      setTimeout(() => {
        this.setSnake(
          new SnakeEntity(this.room, this, spawnData.x, spawnData.y, spawnData.directions),
        );
        this.snake.waitRespawn();
      }, 500)
    }
  }

  public serialize() {
    return {
      id: this.user.getID(),
      name: this.user.getName(),
      score: this.score,
      snake: this.snake.serialize(),
    };
  }
}
