import { UserEntity } from './user.entity';
import { SnakeEntity } from './snake.entity';
import RoomEntity from "./room.entity";

export class Player {
  private score: number = 0;
  private readonly user: UserEntity;
  private readonly snake: SnakeEntity;
  private readonly room: RoomEntity;

  constructor(room: RoomEntity, user: UserEntity, snake: SnakeEntity) {
    this.user = user;
    this.snake = snake;
    this.room = room;
  }

  public getUser() {
    return this.user;
  }

  public getSnake() {
    return this.snake;
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
