import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Room } from 'src/models/room/room.model';
import { User } from 'src/models/user/user.model';
import { SocketService } from 'src/services/socket/socket.service';
import { JwtAuthGuard } from '../user/auth/guards/jwt-auth.guard';
import { RoomService } from './room.service';

@Controller('room')
export class RoomController {
  constructor(
    private readonly roomService: RoomService,
    private readonly socketService: SocketService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  public async getRooms(): Promise<Array<Room>> {
    return await this.roomService.getRooms();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  public async getRoom(@Param('id') roomId: string): Promise<Room> {
    return await this.roomService.getRoom(roomId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('create')
  public async createRoom(
    @Request() req: any,
    @Body('room') room: Room,
  ): Promise<Room> {
    return await this.roomService.createRoom(req.user.id, room);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update')
  public async updateRoom(
    @Request() req: any,
    @Body('room') room: Room,
  ): Promise<Room> {
    const result = await this.roomService.updateRoom(req.user.id, room);
    this.socketService.server
      .to(result.id)
      .emit('roomChanged', 'hello from server');
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('join/:id')
  public async joinRoom(
    @Request() req: any,
    @Body('password') password: string,
    @Param('id') id: string,
  ): Promise<boolean> {
    const result = await this.roomService.joinRoom(id, req.user.id, password);

    if (result) {
      this.socketService.server.to(id).emit('roomChanged', 'hello from server');
    }

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('leave/:id')
  public async leaveRoom(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<boolean> {
    const result = await this.roomService.leaveRoom(id, req.user.id);

    if (result) {
      this.socketService.server
        .to(id)
        .emit('roomChanged', 'goodbye from server');
    }

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('leave')
  public async leaveRooms(@Request() req: any): Promise<Array<Room>> {
    const rooms = await this.roomService.leaveRooms(req.user.id);

    if (rooms) {
      rooms.forEach((room: Room) => {
        this.socketService.server
          .to(room.id)
          .emit('roomChanged', 'goodbye from server');
      });
    }

    return rooms;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('kick/:id')
  public async kickPlayer(
    @Param('id') roomId: string,
    @Body('user') user: User,
  ): Promise<boolean> {
    const result = await this.roomService.leaveRoom(roomId, user.id);

    if (result) {
      this.socketService.server
        .to(roomId)
        .emit('roomChanged', 'goodbye from server');
    }

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('start/:id')
  public async startGame(
    @Param('id') roomId: string,
    @Request() req: any,
  ): Promise<Room> {
    const result: Room = await this.roomService.startGame(roomId, req.user.id);

    if (result) {
      this.socketService.server.to(roomId).emit('goToGame', 'enter the game');

      setTimeout(() => {
        this.socketService.server
          .to(roomId)
          .emit('getReady', 'get ready for drawing');
      }, 2000);

      setTimeout(() => {
        this.socketService.server
          .to(roomId)
          .emit('gameStarted', 'game started');
      }, 7000);
    }

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('roll/:id')
  public async rollDice(
    @Param('id') roomId: string,
    @Request() req: any,
  ): Promise<Room> {
    const roomRoll = await this.roomService.rollDice(roomId, req.user.id);

    this.socketService.server
      .to(roomId)
      .emit('rolled', { room: roomRoll.room, roll: roomRoll.roll });

    return roomRoll.room;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('updateTurn/:id')
  public async updateTurn(
    @Param('id') roomId: string,
    @Body('home') home: number,
    @Request() req: any,
  ): Promise<Room> {
    const room = await this.roomService.updateTurn(roomId, home, req.user.id);
    const finished = await this.roomService.getFinished(roomId);

    if (finished === room.playerList.length) {
      this.socketService.server.to(roomId).emit('finished', { room: room });
    } else {
      this.socketService.server
        .to(roomId)
        .emit('rolled', { room: room, roll: 0 });
    }

    return room;
  }
}
