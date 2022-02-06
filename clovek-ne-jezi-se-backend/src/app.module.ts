import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './controllers/user/auth/auth.module';
import { DtoFunctionsModule } from './services/dto-functions/dto-functions.module';
import { RoomGateway } from './gateways/room.gateway';
import { SocketModule } from './services/socket/socket.module';
import { RoomModule } from './controllers/room/room.module';
import { UserModule } from './controllers/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    DtoFunctionsModule,
    SocketModule,
    RoomModule,
    UserModule,
  ],
  controllers: [],
  providers: [RoomGateway],
})
export class AppModule {}
