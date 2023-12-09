import { UserEntity } from './user.entity';
import { SnakeEntity } from './snake.entity';

export class Player {
  private score: number = 0;
  private readonly user: UserEntity;
  private readonly snake: SnakeEntity;

  constructor(user: UserEntity, snake: SnakeEntity) {
    this.user = user;
    this.snake = snake;
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

  //
  // private emitEvent(roomID: string, event: string, data: any) {
  //   this.user.emitEventToUserRoom(roomID, event, data);
  // }
}
