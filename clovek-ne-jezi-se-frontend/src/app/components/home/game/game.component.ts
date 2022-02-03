import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { mergeMap, take } from 'rxjs';
import { RoomDTO } from 'src/app/models/room/room.model';
import { PlayerDTO } from 'src/app/models/user/user.model';
import { RoomService } from 'src/app/services/room/room.service';
import { SocketService } from 'src/app/services/socket/socket.service';
import { AuthService } from 'src/app/services/user/auth/auth.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
})
export class GameComponent implements OnInit {
  public displayedColumns: string[] = ['name'];
  public dataSource!: MatTableDataSource<PlayerDTO>;
  public room!: RoomDTO;
  public roll: number = 0;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly roomService: RoomService,
    private readonly authService: AuthService,
    private readonly socketService: SocketService
  ) {}

  ngOnInit(): void {
    this.socketService.socket.on(
      'rolled',
      (data: { room: RoomDTO; roll: number }) => {
        this.room = data.room;
        this.roll = data.roll;
      }
    );

    this.refreshRoom();
  }

  public get getUserID(): string {
    return this.authService.getUserID();
  }

  public get turn(): boolean {
    return (
      this.room.playerList?.indexOf(
        this.room.playerList.find(
          (player: PlayerDTO) => player.player?.id === this.getUserID
        ) as PlayerDTO
      ) === this.room.turn
    );
  }

  public rollDice(): void {
    console.log(this.room);
    this.roomService
      .rollDice(this.room.id!)
      .pipe(take(1))
      .subscribe((room: RoomDTO) => {
        this.room = room;
      });
  }

  private refreshRoom(): void {
    this.route.paramMap
      .pipe(
        take(1),
        mergeMap((paramMap) =>
          this.roomService.getRoom(paramMap.get('id')!).pipe(take(1))
        )
      )
      .subscribe((room: RoomDTO) => {
        this.room = room;
        this.dataSource = new MatTableDataSource(this.room.playerList!);
      });
  }
}
