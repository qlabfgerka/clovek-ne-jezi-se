import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { take } from 'rxjs';
import { RoomDTO } from 'src/app/models/room/room.model';

@Component({
  selector: 'app-create-room-dialog',
  templateUrl: './create-room-dialog.component.html',
  styleUrls: ['./create-room-dialog.component.scss'],
})
export class CreateRoomDialogComponent implements OnInit {
  public roomForm!: FormGroup;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly dialogRef: MatDialogRef<CreateRoomDialogComponent>
  ) {}

  ngOnInit(): void {
    this.roomForm = this.formBuilder.group({
      title: ['', [Validators.required]],
      password: [''],
    });
  }

  public createRoom(): void {
    if (this.roomForm.valid) {
      const room: RoomDTO = {
        password: this.roomForm.get('password')!.value,
        title: this.roomForm.get('title')!.value,
      };

      this.dialogRef.close(room);
    }
  }

  public get errorControl() {
    return this.roomForm.controls;
  }
}
