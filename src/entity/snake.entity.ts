import { IStepGameLoop } from '../interfaces/IStepGameLoop';
import {Player} from "./player.entity";
import {IStateSerialize} from "../interfaces/IStateSerialize";

export enum DirectionsEnum {
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right',
}

export class Snake implements IStepGameLoop, IStateSerialize {
  private readonly SPEED: number = 1;

  private readonly id: string;
  public readonly player: Player;
  private readonly color: number;
  private body: { mX: number; mY: number; direction: DirectionsEnum }[] = [];
  private direction: DirectionsEnum;

  constructor(player: Player, mX: number, mY: number) {
    this.player = player;
    this.id = player.getSocket().id;
    this.color = Snake.stringToColour(player.getSocket().id);
    this.direction = DirectionsEnum.UP;

    this.createBody(mX, mY);

    this.player.getSocket().emit('create-id', {
      id: this.player.getSocket().id,
    })
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
    for (let i = 1; i <= 3; i++) {
      this.body.push({mX: x, mY: y + i, direction: DirectionsEnum.UP});
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

  serialize(): any {
    return {
      id: this.id,
      color: this.color,
      needsUpdate: true,
      body: this.body.map(ceil => {
        return {
          mx: ceil.mX,
          my: ceil.mY,
          d: ceil.direction
        }
      })
    }
  }
}
