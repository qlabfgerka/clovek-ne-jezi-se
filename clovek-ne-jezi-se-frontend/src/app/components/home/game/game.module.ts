import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GameRoutingModule } from './game-routing.module';
import { GameComponent } from './game.component';
import { BoardModule } from 'src/app/shared/components/game/board/board.module';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [GameComponent],
  imports: [CommonModule, GameRoutingModule, BoardModule, MatButtonModule],
})
export class GameModule {}
