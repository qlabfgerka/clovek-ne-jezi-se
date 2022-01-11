import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./rooms/rooms.module').then((m) => m.RoomsModule),
      },
      {
        path: `lobby/:id`,
        loadChildren: () =>
          import('./lobby/lobby.module').then((m) => m.LobbyModule),
        //canActivate: [RoomGuard],
      },
      {
        path: `game/:id`,
        loadChildren: () =>
          import('./game/game.module').then((m) => m.GameModule),
        //canActivate: [RoomGuard],
      },
      {
        path: `profile/:id`,
        loadChildren: () =>
          import('../account/profile/profile.module').then(
            (m) => m.ProfileModule
          ),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeRoutingModule {}
