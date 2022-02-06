import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InformationDialogRoutingModule } from './information-dialog-routing.module';
import { InformationDialogComponent } from './information-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [InformationDialogComponent],
  imports: [CommonModule, InformationDialogRoutingModule, MatDialogModule],
  exports: [InformationDialogComponent],
})
export class InformationDialogModule {}
