import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Subscription } from 'rxjs';
import { finalize, first, mergeMap, take } from 'rxjs/operators';
import { RoomDTO } from 'src/app/models/room/room.model';
import { PlayerDTO, UserDTO } from 'src/app/models/user/user.model';
import { RoomService } from 'src/app/services/room/room.service';
import { SocketService } from 'src/app/services/socket/socket.service';
import { AuthService } from 'src/app/services/user/auth/auth.service';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss'],
})
export class LobbyComponent implements OnInit {
  public room!: RoomDTO;
  public dataSource!: MatTableDataSource<PlayerDTO>;
  public displayedColumns: string[] = ['name', 'kick'];
  public roomForm!: FormGroup;
  public isLoading!: boolean;
  public userId!: string;
  private subscription!: Subscription;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly roomService: RoomService,
    private readonly formBuilder: FormBuilder,
    private readonly socketService: SocketService,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserID();
    this.refreshRoom(true);

    this.socketService.socket.on('roomChanged', () => {
      this.refreshRoom();
    });

    this.socketService.socket.on('kicked', () => {
      this.router.navigate(['']);
    });

    this.socketService.socket.on('goToGame', () => {
      this.router.navigate([`game/${this.room.id}`]);
    });
  }

  public leaveRoom(): void {
    this.subscription.unsubscribe();
    this.socketService.socket.off('roomChanged');
    this.socketService.socket.off('kicked');
    this.socketService.socket.off('gameStarted');

    this.socketService.leaveRoom(this.room.id!);
    this.roomService
      .leaveRoom(this.room.id!)
      .pipe(
        take(1),
        finalize(() => {
          this.router.navigate(['']);
        })
      )
      .subscribe(() => {});
  }

  public startGame(): void {
    this.roomService
      .startGame(this.room.id!)
      .pipe(take(1))
      .subscribe(() => {});
  }

  public kickPlayer(user: UserDTO): void {
    this.roomService
      .kickPlayer(this.room.id!, user)
      .pipe(take(1))
      .subscribe(() => {
        this.socketService.kickPlayer(this.room.id!, user.id!);
      });
  }

  public updateRoom(): void {
    if (this.roomForm.valid) {
      this.room.password = this.roomForm.get('password')!.value;
      this.room.title = this.roomForm.get('title')!.value;

      this.roomService
        .updateRoom(this.room)
        .pipe(take(1))
        .subscribe(() => {
          this.refreshRoom();
        });
    }
  }

  public get errorControl() {
    return this.roomForm.controls;
  }

  private refreshRoom(firstConnect: boolean = false): void {
    this.isLoading = true;

    this.subscription = this.route.paramMap
      .pipe(
        take(1),
        mergeMap((paramMap) =>
          this.roomService.getRoom(paramMap.get('id')!).pipe(take(1))
        )
      )
      .subscribe((room: RoomDTO) => {
        this.room = room;
        this.dataSource = new MatTableDataSource(this.room.playerList!);

        if (firstConnect) {
          this.socketService.joinRoom(
            this.room.id!,
            this.authService.getUserID()
          );
        }

        this.roomForm = this.formBuilder.group({
          title: [this.room.title, [Validators.required]],
          password: [this.room.password],
        });

        if (this.room.admin!.id !== this.userId) this.roomForm.disable();

        this.isLoading = false;
      });
  }
}
