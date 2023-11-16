import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { ChampionComponent } from './champion/champion.component';

const routes: Routes = [
  { path: '', component: ChampionComponent },
];

@NgModule({
  declarations: [
    ChampionComponent
  ],
  imports:[RouterModule.forChild(routes), CommonModule, SharedModule],
})
export class LadybossChampionModule { }
