import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Room, RoomDocument } from 'src/models/room/room.model';
import { Player, User, UserDocument } from 'src/models/user/user.model';
import { DtoFunctionsService } from 'src/services/dto-functions/dto-functions.service';
import * as bcrypt from 'bcrypt';
import { RoomRoll } from 'src/models/room/room.roll.model';

@Injectable()
export class RoomService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Room.name) private roomModel: Model<RoomDocument>,
    private readonly dtoFunctions: DtoFunctionsService,
  ) {}

  public async getRooms(): Promise<Array<Room>> {
    const rooms = await this.roomModel.find().exec();

    return await this.dtoFunctions.roomsToDTO(rooms);
  }

  public async getRoom(roomId: string): Promise<Room> {
    const room = await this.roomModel.findById(roomId);

    return await this.dtoFunctions.roomToDTO(room);
  }

  public async createRoom(adminId: string, room: Room): Promise<Room> {
    const admin = await this.userModel.findById(adminId);
    const player: Player = {
      finished: false,
      player: admin._id,
      roll: -1,
      pieces: 4,
    };

    const newRoom = new this.roomModel({
      title: room.title,
      admin: admin,
      password: await this.generateHash(room.password),
      playerList: [player],
      turn: -1,
      sorted: false,
    });

    await newRoom.save();

    return await this.dtoFunctions.roomToDTO(newRoom);
  }

  public async updateRoom(adminId: string, room: Room): Promise<Room> {
    const admin = await this.userModel.findById(adminId);
    const roomAdmin = await this.userModel.findById(room.admin.id);
    const currentRoom = await this.roomModel.findById(room.id);

    if (
      this.dtoFunctions.userToDTO(admin).id ===
      this.dtoFunctions.userToDTO(roomAdmin).id
    ) {
      currentRoom.title = room.title;
      currentRoom.password = await this.generateHash(room.password);
      await currentRoom.save();
    }

    return currentRoom;
  }

  public async joinRoom(
    roomId: string,
    userId: string,
    password: string,
  ): Promise<boolean> {
    const room = await this.roomModel.findById(roomId);
    const user = await this.userModel.findById(userId);
    const player: Player = {
      finished: false,
      player: user._id,
      roll: -1,
      pieces: 4,
    };

    if (room.password && !(await bcrypt.compare(password, room.password)))
      return false;

    if (room.playerList.length >= 4) return false;

    room.playerList.push(player);

    await room.save();

    return true;
  }

  public async leaveRoom(roomId: string, userId: string): Promise<boolean> {
    const room = await this.roomModel.findById(roomId);
    const user = await this.userModel.findById(userId);

    const index = room.playerList.indexOf(
      room.playerList.find(
        (player: Player) => user.id === player.player.toString(),
      ),
    );

    if (index > -1) {
      room.playerList.splice(index, 1);

      if (room.playerList.length === 0) {
        await room.delete();
        return true;
      } else if (room.admin.toString() === user.id) {
        room.admin = room.playerList[0].player;
      }

      await room.save();

      return true;
    }

    return false;
  }

  public async leaveRooms(userId: string): Promise<Array<Room>> {
    const user = await this.userModel.findById(userId);
    const room = await this.roomModel.find({
      playerList: { $elemMatch: { player: user._id } },
    });

    room.forEach(async (room: Room) => {
      await this.leaveRoom(room.id, user.id);
    });

    return await this.dtoFunctions.roomsToDTO(room);
  }

  public async startGame(roomId: string, userId: string): Promise<Room> {
    const room = await this.roomModel.findById(roomId);

    room.turn = 0;
    for (let i = 0; i < room.playerList.length; i++) {
      const p = await this.userModel.findById(
        room.playerList[i].player.toString(),
      );
      ++p.gamesPlayed;

      await p.save();

      room.playerList[i].finished = false;
    }

    room.markModified('playerList');
    await room.save();

    return await this.dtoFunctions.roomToDTO(room);
  }

  public async getFinished(roomId: string): Promise<number> {
    const room = await this.roomModel.findById(roomId);

    return room.playerList.filter((player: Player) => player.finished).length;
  }

  public async updateTurn(
    roomId: string,
    home: number,
    userId: string,
  ): Promise<Room> {
    const room = await this.roomModel.findById(roomId);
    const user = await this.userModel.findById(userId);

    ++room.turn;
    room.turn = room.turn % room.playerList.length;

    while (room.playerList[room.turn].finished) {
      ++room.turn;
      room.turn = room.turn % room.playerList.length;
    }

    const index = room.playerList.indexOf(
      room.playerList.find(
        (player: Player) => user.id === player.player.toString(),
      ),
    );

    if (index > -1 && home === -1) {
      --room.playerList[index].pieces;

      if (room.playerList[index].pieces === 0) {
        const position = await this.getFinished(room.id);
        room.playerList[index].finished = true;
        user.results[position]
          ? ++user.results[position]
          : (user.results[position] = 1);

        await user.save();
      }

      room.markModified('playerList');
    }

    await room.save();

    return await this.dtoFunctions.roomToDTO(room);
  }

  public async rollDice(roomId: string, userId: string): Promise<RoomRoll> {
    const room = await this.roomModel.findById(roomId);
    const user = await this.userModel.findById(userId);

    const index = room.playerList.indexOf(
      room.playerList.find(
        (player: Player) => user.id === player.player.toString(),
      ),
    );

    if (index > -1) {
      room.playerList[index].roll = this.randomIntFromInterval(1, 6);

      if (!room.sorted) {
        ++room.turn;
        room.turn = room.turn % room.playerList.length;

        if (!room.playerList.find((player: Player) => player.roll === -1)) {
          room.playerList.sort((player1: Player, player2: Player) =>
            player1.roll > player2.roll ? -1 : 1,
          );
          room.turn = 0;
          room.sorted = true;
        }
      }

      room.markModified('playerList');
      await room.save();
    }

    return this.dtoFunctions.roomRollToDto(
      await this.dtoFunctions.roomToDTO(room),
      room.playerList[index].roll,
    );
  }

  private async generateHash(password: string): Promise<string> {
    if (password === '') return '';

    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(password, salt);

    return hash;
  }

  private randomIntFromInterval(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
}
