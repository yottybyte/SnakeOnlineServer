import { v4 as uuidv4 } from 'uuid';
import { stringToColour } from '../utils/stringToColour';
import { IStepGameLoop } from '../interfaces/IStepGameLoop';
import RoomEntity from './room.entity';
import BulletEntity from './bullet.entity';

export enum DirectionsEnum {
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right',
}

export interface ISnakeBody {
  x: number;
  y: number;
}

export class SnakeEntity implements IStepGameLoop {
  private readonly SPEED: number = 1;
  private readonly BULLET_RESET: number = 2;

  private readonly id: string;
  private readonly color: number;
  private readonly room: RoomEntity;
  private body: ISnakeBody[] = [];
  private direction: DirectionsEnum;
  private isSpeedBonus: boolean = false;
  private currentResetTime: number = 0;

  constructor(room: RoomEntity, mX: number, mY: number, initialDirection: DirectionsEnum) {
    this.id = uuidv4();
    this.color = stringToColour(this.id);
    this.direction = initialDirection;
    this.room = room;

    this.createBody(mX, mY);
    this.room.addLoopEntity(this);
  }

  public getID() {
    return this.id;
  }

  public getBody() {
    return this.body;
  }

  public activateSpeedBonus() {
    if (this.isSpeedBonus) {
      return;
    }
    this.isSpeedBonus = true;
    setTimeout(() => {
      this.isSpeedBonus = false;
    }, 500);
  }

  public spawnBullet() {
    if (this.currentResetTime) {
      return;
    }
    this.currentResetTime = this.BULLET_RESET;
    const snakeHead = this.body[0];
    this.room.addLoopEntity(
      new BulletEntity(this.room, snakeHead.x, snakeHead.y, this.direction, this.id, this.color),
    );
  }

  public isSpeedBonusActive(): boolean {
    return this.isSpeedBonus;
  }

  // Тут БАГ с возможностью самоубиться, из за последней строки
  public setDirection(newDirection: DirectionsEnum) {
    if (
      (this.direction === DirectionsEnum.UP && newDirection === DirectionsEnum.DOWN) ||
      (this.direction === DirectionsEnum.DOWN && newDirection === DirectionsEnum.UP) ||
      (this.direction === DirectionsEnum.LEFT && newDirection === DirectionsEnum.RIGHT) ||
      (this.direction === DirectionsEnum.RIGHT && newDirection === DirectionsEnum.LEFT)
    ) {
      return;
    }

    this.direction = newDirection;
  }

  public getDirection(): DirectionsEnum {
    return this.direction;
  }

  public getColor(): number {
    return this.color;
  }

  public addCeil() {
    const lastBodyItem = this.body[this.body.length - 1];
    this.body.push({
      x: lastBodyItem.x,
      y: lastBodyItem.y,
    });
  }

  private createBody(x: number, y: number) {
    this.body = [];
    for (let i = 1; i <= 5; i++) {
      this.body.push({ x: x, y: y + i });
    }
  }

  public gameStep(time: number) {
    if (time % 1000 === 0) {
      if (this.currentResetTime > 0) {
        this.currentResetTime--;
      }
    }
    if (
      (time % 150 === 0 && !this.isSpeedBonusActive()) ||
      (time % 75 === 0 && this.isSpeedBonusActive())
    ) {
      this.move();
    }
  }

  protected move() {
    for (let i = this.body.length - 1; i >= 0; i--) {
      // Голова
      if (i === 0) {
        switch (this.direction) {
          case 'up':
            this.body[i].y -= this.SPEED;
            break;
          case 'down':
            this.body[i].y += this.SPEED;
            break;
          case 'left':
            this.body[i].x -= this.SPEED;
            break;
          case 'right':
            this.body[i].x += this.SPEED;
            break;
        }
        break;
      }

      this.body[i].x = this.body[i - 1].x;
      this.body[i].y = this.body[i - 1].y;
    }
  }

  public serialize() {
    return {
      color: this.getColor(),
      direction: this.getDirection(),
      body: this.body,
    };
  }

  public getX(): number {
    return this.body[0].x;
  }

  public getY(): number {
    return this.body[0].y;
  }
}
