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

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly roomService: RoomService,
    private readonly authService: AuthService,
    private readonly socketService: SocketService
  ) {}

  ngOnInit(): void {
    this.refreshRoom();
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
