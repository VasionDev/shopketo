import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImplicitComponent } from './implicit/implicit.component';
import { ImplicitRoutingModule } from './implicit-routing.module';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [ImplicitComponent],
  imports: [CommonModule, ImplicitRoutingModule, SharedModule],
})
export class ImplicitModule {}
