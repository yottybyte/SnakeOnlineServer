import { Socket } from 'socket.io';

export class Player {
  private socket: Socket;

  constructor(socket: Socket) {
    this.socket = socket;
  }

  public getSocket() {
    return this.socket;
  }
}
