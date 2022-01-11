import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/models/user/user.model';
import { DtoFunctionsService } from './dto-functions.service';

@Module({
  providers: [DtoFunctionsService],
  exports: [DtoFunctionsService],
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
})
export class DtoFunctionsModule {}
