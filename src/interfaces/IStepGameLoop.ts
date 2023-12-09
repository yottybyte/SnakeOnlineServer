export interface IStepGameLoop {
  gameStep(timeDelta: number): void;
  getX(): number;
  getY(): number;
}
