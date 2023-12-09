import { DirectionsEnum } from "./snake.entity";
import { IStepGameLoop } from "../interfaces/IStepGameLoop";
import { IStateSerialize } from "../interfaces/IStateSerialize";
import { v4 as uuidv4 } from 'uuid';
import RoomEntity from "./room.entity";

export default class BulletEntity implements IStepGameLoop, IStateSerialize {
  protected mX: number;
  protected mY: number;

  protected readonly playerId: string;
  protected readonly color: number;
  protected readonly directionMove: DirectionsEnum;
  protected readonly room: RoomEntity;
  private readonly id: string;

  constructor(room: RoomEntity, x: number, y: number, direction: DirectionsEnum, id: string, color: number) {
    this.mX = x;
    this.mY = y;

    this.playerId = id;
    this.color = color;
    this.directionMove = direction;

    this.room = room;

    this.id = uuidv4();
  }

  gameStep(time: number): void {
    if (time % 50 === 0) {
      switch (this.directionMove) {
        case DirectionsEnum.RIGHT: this.mX++; break;
        case DirectionsEnum.UP: this.mY--; break;
        case DirectionsEnum.LEFT: this.mX--; break;
        case DirectionsEnum.DOWN: this.mY++; break;
      }
    }
  }

  serialize() {
    return {
      x: this.mX,
      y: this.mY,
      id: this.id,
      direction: this.directionMove,
      color: this.color,
    }
  }

  public destroy() {
    this.room.deleteBullet(this.id);
  }

  public getX(): number {
    return this.mX;
  }

  public getY(): number {
    return this.mY;
  }

  public getId(): string {
    return this.id;
  }
}
