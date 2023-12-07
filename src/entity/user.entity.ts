import { Socket } from 'socket.io';

export interface IUserEntityPayload {
  socket: Socket;
  name: string;
}

export class UserEntity {
  private readonly id: string;
  private readonly socket: Socket;
  private readonly name: string;

  constructor({ socket, name }: IUserEntityPayload) {
    this.id = socket.id;
    this.socket = socket;
    this.name = name;
  }

  // public emitEventToUserRoom(roomID: string, event: string, data: any) {
  //   if (this.socket.rooms.has(roomID)) {
  //     this.emitEventToUser(event, data);
  //   }
  // }
  //
  // public emitEventToUser(event: string, data: any) {
  //   this.socket.emit(event, data);
  // }

  public getSocket() {
    return this.socket;
  }

  public addRoom(roomID: string) {
    this.socket.join(roomID);
  }

  public removeRoom(roomID: string) {
    this.socket.leave(roomID);
  }

  public getID() {
    return this.id;
  }

  public getName() {
    return this.name;
  }
}
