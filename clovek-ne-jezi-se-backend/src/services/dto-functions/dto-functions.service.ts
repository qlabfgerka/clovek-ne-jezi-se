import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Room } from 'src/models/room/room.model';
import { RoomRoll } from 'src/models/room/room.roll.model';
import { Player, User, UserDocument } from 'src/models/user/user.model';

@Injectable()
export class DtoFunctionsService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  public userToDTO(user: User): User {
    if (!user) return undefined;
    const userDTO: User = {
      id: user.id,
      email: user.email,
      username: user.username,
      nickname: user.nickname,
      results: user.results,
      gamesPlayed: user.gamesPlayed,
    };

    return userDTO;
  }

  public usersToDTO(users: Array<User>): Array<User> {
    const usersDTO = new Array<User>();

    users.forEach((user: User) => {
      usersDTO.push(this.userToDTO(user));
    });

    return usersDTO;
  }

  public async playerToDTO(player: Player): Promise<Player> {
    const playerToDTO: Player = {
      id: player.id,
      player: this.userToDTO(await this.getUser(player.player)),
      finished: player.finished,
      roll: player.roll,
      pieces: player.pieces,
    };

    return playerToDTO;
  }

  public async playersToDTO(players: Array<Player>): Promise<Array<Player>> {
    const playersDTO = new Array<Player>();

    for (const player of players) {
      playersDTO.push(await this.playerToDTO(player));
    }

    return playersDTO;
  }

  public async roomToDTO(room: Room): Promise<Room> {
    const roomDTO: Room = {
      id: room.id,
      playerList: await this.playersToDTO(room.playerList),
      password: room.password,
      title: room.title,
      admin: this.userToDTO(await this.getUser(room.admin)),
      turn: room.turn,
      sorted: room.sorted,
    };

    return roomDTO;
  }

  public roomRollToDto(room: Room, roll: number): RoomRoll {
    const roomRollDTO: RoomRoll = {
      roll,
      room,
    };

    return roomRollDTO;
  }

  public async roomsToDTO(rooms: Array<Room>): Promise<Array<Room>> {
    const roomsDTO = new Array<Room>();

    for (const room of rooms) {
      roomsDTO.push(await this.roomToDTO(room));
    }

    return roomsDTO;
  }

  public async getUsers(users: Array<User>): Promise<Array<User>> {
    const usersDTO = new Array<User>();

    for (const user of users) {
      if (user.nickname) {
        usersDTO.push(await this.getUser(user));
      } else usersDTO.push(await this.getUser(user));
    }

    return usersDTO;
  }

  public async getUser(user: User): Promise<User> {
    if (!user) return undefined;
    if (user.nickname) {
      return await this.userModel.findById(user.id);
    } else return await this.userModel.findById(user.toString());
  }
}
