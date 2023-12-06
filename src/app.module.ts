import { Module } from '@nestjs/common';
import { AppGateway } from './app.gateway';
import { RoomService } from './room/room.service';
import { PlayerService } from './player/player.service';
import { SnakeService } from './snake/snake.service';

@Module({
  imports: [],
  controllers: [],
  providers: [AppGateway, RoomService, PlayerService, SnakeService],
})
export class AppModule {}
