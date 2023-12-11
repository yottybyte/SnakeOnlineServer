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

  public serialize() {
    return {
      id: this.user.getID(),
      name: this.user.getName(),
      score: this.score,
      snake: this.snake.serialize(),
    };
  }
}
