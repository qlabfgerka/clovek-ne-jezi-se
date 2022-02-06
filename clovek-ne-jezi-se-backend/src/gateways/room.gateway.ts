import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketService } from 'src/services/socket/socket.service';

@WebSocketGateway({ cors: true })
export class RoomGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly socketService: SocketService) {}

  afterInit(server: Server): void {
    this.socketService.server = server;
    this.socketService.clients = new Array<{
      client: Socket;
      userId: string;
      roomId: string;
    }>();
  }

  handleConnection(client: any): void {
    console.log(`${client.id} connected`);
  }

  handleDisconnect(client: any): void {
    const index = this.socketService.clients.indexOf(
      this.socketService.clients.find(
        (currentClient) => currentClient.client.id === client.id,
      ),
    );

    if (index > -1) {
      this.socketService.clients[index].client.leave(
        this.socketService.clients[index].roomId,
      );
      this.socketService.clients.splice(index, 1);
    }
  }

  @SubscribeMessage('joinRoom')
  public handleJoinRoom(
    client: Socket,
    data: { roomId: string; userId: string },
  ): void {
    this.socketService.clients.push({
      roomId: data.roomId,
      userId: data.userId,
      client: client,
    });

    client.join(data.roomId);
    client.emit('joinedRoom', data.roomId);
  }

  @SubscribeMessage('leaveRoom')
  public handleLeaveRoom(client: Socket, roomId: string): void {
    const index = this.socketService.clients.indexOf(
      this.socketService.clients.find(
        (currentClient) =>
          currentClient.roomId === roomId &&
          currentClient.client.id === client.id,
      ),
    );

    if (index > -1) this.socketService.clients.splice(index, 1);

    client.leave(roomId);
    client.emit('leftRoom', roomId);
  }

  @SubscribeMessage('kick')
  public handleKick(
    _client: Socket,
    data: { roomId: string; userId: string },
  ): void {
    const index = this.socketService.clients.indexOf(
      this.socketService.clients.find(
        (currentClient) =>
          currentClient.roomId === data.roomId &&
          currentClient.userId === data.userId,
      ),
    );

    if (index > -1) {
      this.socketService.clients[index].client.leave(data.roomId);
      this.socketService.clients[index].client.emit('kicked', data.roomId);
      this.socketService.clients.splice(index, 1);
    }
  }

  @SubscribeMessage('board')
  public handleBoard(
    _client: Socket,
    data: {
      roomId: string;
      child: string;
      oldParent: string;
      newParent: string;
      home: string;
      eaten: string;
      userId: string;
    },
  ): void {
    this.socketService.server.to(data.roomId).emit('boardChanged', {
      child: data.child,
      oldParent: data.oldParent,
      newParent: data.newParent,
      home: data.home,
      eaten: data.eaten,
      userId: data.userId,
    });
  }

  @SubscribeMessage('help')
  public handleHelp(
    _client: Socket,
    data: { roomId: string; word: string; index: number },
  ): void {
    this.socketService.server
      .to(data.roomId)
      .emit('getHelp', { character: data.word[data.index], index: data.index });
  }
}
