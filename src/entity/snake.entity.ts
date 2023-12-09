import { v4 as uuidv4 } from 'uuid';
import { stringToColour } from '../utils/stringToColour';

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

export class SnakeEntity {
  private readonly SPEED: number = 1;

  private readonly id: string;
  private readonly color: number;
  private body: ISnakeBody[] = [];
  private direction: DirectionsEnum;
  private isSpeedBonus: boolean = false;

  constructor(mX: number, mY: number, initialDirection: DirectionsEnum) {
    this.id = uuidv4();
    this.color = stringToColour(this.id);
    this.direction = initialDirection;

    this.createBody(mX, mY);
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

  public isSpeedBonusActive(): boolean {
    return this.isSpeedBonus;
  }

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
    this.body.push(this.body[this.body.length - 1]);
  }

  private createBody(x: number, y: number) {
    this.body = [];
    for (let i = 1; i <= 5; i++) {
      this.body.push({ x: x, y: y + i});
    }
  }

  public gameStep() {
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
}
