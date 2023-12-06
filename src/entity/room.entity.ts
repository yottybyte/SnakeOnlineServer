import {Player} from "./player.entity";
import {Snake} from "./snake.entity";
import {IStateSerialize} from "../interfaces/IStateSerialize";

interface PlayerRoom {
  snake: Snake;
  score: number;
}

export default class RoomEntity implements IStateSerialize{
  private readonly STEP_INTERVAL = 50;
  private isRunning = false;
  private readonly id: string;

  public snakes: Snake[] = [];
  constructor(roomId: string) {
    this.id = roomId;
    this.startGameLoop();
  }

  private async startGameLoop() {
    this.isRunning = true;
    while (this.isRunning) {
      const startTime = Date.now();
      this.handleGameLoop(startTime);
      const diffTime = Date.now() - startTime;
      await this.snooze(this.STEP_INTERVAL - diffTime);
    }
  }

  private handleGameLoop(time: number) {
    for (const snake of this.snakes) {
      snake.gameStep();
    }

    for (const snake of this.snakes) {
      snake.player.getSocket().emit('step', this.serialize());
    }
  }

  private async snooze(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  serialize(): any {
    return {
      id: this.id,
      players: this.snakes.map(snake => snake.serialize()),
      eats: [],
    };
  }
}
