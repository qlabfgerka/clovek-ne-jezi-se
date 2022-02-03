import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { mergeMap, take } from 'rxjs';
import { RoomDTO } from 'src/app/models/room/room.model';
import { PlayerDTO } from 'src/app/models/user/user.model';
import { DataService } from 'src/app/services/data/data.service';
import { RoomService } from 'src/app/services/room/room.service';
import { SocketService } from 'src/app/services/socket/socket.service';
import { AuthService } from 'src/app/services/user/auth/auth.service';
import { BoardComponent } from 'src/app/shared/components/game/board/board.component';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
})
export class GameComponent implements OnInit {
  @ViewChild('board') board!: BoardComponent;

  public displayedColumns: string[] = ['name'];
  public dataSource!: MatTableDataSource<PlayerDTO>;
  public room!: RoomDTO;
  public roll: number = 0;
  public turnEndable: boolean = false;
  public rolled: boolean = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly roomService: RoomService,
    private readonly authService: AuthService,
    private readonly socketService: SocketService,
    private readonly dataService: DataService
  ) {}

  ngOnInit(): void {
    this.socketService.socket.on(
      'rolled',
      (data: { room: RoomDTO; roll: number }) => {
        this.room = data.room;
        this.roll = data.roll;

        this.dataService.setAll(
          `p${this.playerNumber}`,
          this.room.turn!,
          this.roll
        );
      }
    );

    this.socketService.socket.on(
      'boardChanged',
      (data: { child: string; oldParent: string; newParent: string }) => {
        console.log(data);
        if (data.child && data.oldParent && data.newParent)
          this.board.update(data.child, data.oldParent, data.newParent);
      }
    );

    this.refreshRoom();
  }

  public get getUserID(): string {
    return this.authService.getUserID();
  }

  public get playerNickname(): string {
    return this.room.playerList![this.room.turn!].player?.nickname as string;
  }

  public get playerNumber(): number {
    return (
      (this.room.playerList?.indexOf(
        this.room.playerList.find(
          (player: PlayerDTO) => player.player?.id === this.getUserID
        ) as PlayerDTO
      ) as number) + 1
    );
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
    if (this.room.sorted) {
      this.rolled = true;
      this.turnEndable = true;
    }
    this.roomService
      .rollDice(this.room.id!)
      .pipe(take(1))
      .subscribe((room: RoomDTO) => {
        this.room = room;
      });
  }

  public updateTurn(): void {
    this.socketService.updateBoard(
      this.room.id!,
      this.dataService.getChild(),
      this.dataService.getOldParent(),
      this.dataService.getNewParent()
    );

    this.roomService
      .updateTurn(this.room.id!)
      .pipe(take(1))
      .subscribe((room: RoomDTO) => {
        this.room = room;
        this.rolled = false;
        this.turnEndable = false;
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
