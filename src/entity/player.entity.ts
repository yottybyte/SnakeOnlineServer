import { Socket } from 'socket.io';
import {IStateSerialize} from "../interfaces/IStateSerialize";

export class Player implements IStateSerialize{
  private readonly socket: Socket;

  constructor(socket: Socket) {
    this.socket = socket;
  }

  public getSocket() {
    return this.socket;
  }

  serialize(): any {
    return null;
  }
}
