import { ElementRef, Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  public socket: Socket;

  constructor() {
    this.socket = io('http://localhost:3000');
  }

  public joinRoom(roomId: string, userId: string): void {
    this.socket.emit('joinRoom', { roomId, userId });
  }

  public leaveRoom(roomId: string): void {
    this.socket.emit('leaveRoom', roomId);
  }

  public kickPlayer(roomId: string, userId: string): void {
    this.socket.emit('kick', { roomId, userId });
  }

  public updateBoard(
    roomId: string,
    child: string,
    oldParent: string,
    newParent: string
  ): void {
    this.socket.emit('board', { roomId, child, oldParent, newParent });
  }

  public stopListening(): void {
    this.socket.off('getReady');
    this.socket.off('roomChanged');
    this.socket.off('kicked');
    this.socket.off('goToGame');
    this.socket.off('gameStarted');
    this.socket.off('drawingChanged');
    this.socket.off('guessed');
    this.socket.off('roundOver');
    this.socket.off('gameOver');
    this.socket.off('wrong');
    this.socket.off('getHelp');
    this.socket.off('rolled');
  }
}
