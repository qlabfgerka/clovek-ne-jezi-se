import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take, mergeMap } from 'rxjs';
import { UserDTO } from 'src/app/models/user/user.model';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  public user!: UserDTO;
  public isLoading!: boolean;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly userService: UserService
  ) {}

  ngOnInit(): void {
    this.refreshUser();
  }

  private refreshUser(): void {
    this.isLoading = true;
    this.route.paramMap
      .pipe(
        take(1),
        mergeMap((paramMap) =>
          this.userService.getUser(paramMap.get('id') as string).pipe(take(1))
        )
      )
      .subscribe((user: UserDTO) => {
        this.user = user;
        this.isLoading = false;
      });
  }
}
