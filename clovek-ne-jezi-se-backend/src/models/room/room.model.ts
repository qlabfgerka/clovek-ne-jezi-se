import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { Player, User } from '../user/user.model';

export type RoomDocument = Room & Document;

@Schema()
export class Room {
  id?: string | undefined | null = null;

  @Prop()
  title: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  admin: User;

  @Prop()
  password: string;

  @Prop()
  playerList: Player[];

  @Prop()
  turn: number;

  @Prop()
  sorted: boolean;
}

export const RoomSchema = SchemaFactory.createForClass(Room);
