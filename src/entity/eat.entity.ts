import { IStepGameLoop } from '../interfaces/IStepGameLoop';
import { v4 as uuidv4 } from 'uuid';

export class EatEntity implements IStepGameLoop {
  private LIFE_TIME: number = 30;
  private createAt: number;

  private id: string;
  private x: number;
  private y: number;

  constructor(x: number, y: number) {
    this.id = uuidv4();
    this.x = x;
    this.y = y;
    this.createAt = this.LIFE_TIME;
  }

  public getX() {
    return this.x;
  }

  public getY() {
    return this.y;
  }

  public getID() {
    return this.id;
  }

  public gameStep(timeDelta: number): void {
    if (timeDelta % 1000 === 0) {
      this.createAt -= 1;
    }
  }

  public isDead() {
    return this.createAt <= 0;
  }
}
