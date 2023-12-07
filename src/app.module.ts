import { Module } from '@nestjs/common';
import { AppGateway } from './app.gateway';
import { RoomService } from './room/room.service';
import { PlayerService } from './player/player.service';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [EventEmitterModule.forRoot()],
  controllers: [],
  providers: [AppGateway, RoomService, PlayerService],
})
export class AppModule {}
