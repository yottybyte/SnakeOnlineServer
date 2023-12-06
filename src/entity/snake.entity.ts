import { IStepGameLoop } from '../interfaces/IStepGameLoop';

export enum DirectionsEnum {
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right',
}

export class Snake implements IStepGameLoop {
  private readonly SPEED: number = 1;

  private readonly color: number;
  private body: { mX: number; mY: number; direction: DirectionsEnum }[] = [];
  private direction: DirectionsEnum;

  constructor(id: string, mX: number, mY: number) {
    this.color = Snake.stringToColour(id);
    this.direction = DirectionsEnum.UP;
    this.body.push({ mX: mX, mY: mY, direction: this.direction });
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

  public gameStep() {
    for (let i = this.body.length - 1; i >= 0; i--) {
      // Голова
      if (i === 0) {
        switch (this.direction) {
          case 'up':
            this.body[i].mY -= this.SPEED;
            break;
          case 'down':
            this.body[i].mY += this.SPEED;
            break;
          case 'left':
            this.body[i].mX -= this.SPEED;
            break;
          case 'right':
            this.body[i].mX += this.SPEED;
            break;
        }
        this.body[i].direction = this.direction;
        break;
      }

      this.body[i].mX = this.body[i - 1].mX;
      this.body[i].mY = this.body[i - 1].mY;
      this.body[i].direction = this.body[i - 1].direction;
    }
  }

  // Никто не знает как это работает, НИКОГДА НЕ ТРОГАТЬ
  private static stringToColour = (str: string): number => {
    let hash = 0;
    str.split('').forEach((char) => {
      hash = char.charCodeAt(0) + ((hash << 5) - hash);
    });
    let colour = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff;
      colour += value.toString(16).padStart(2, '0');
    }
    colour = colour.replace('#', '');
    colour = `0x${colour}`;

    return +colour;
  };
}
