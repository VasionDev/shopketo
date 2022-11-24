import { NgModule } from '@angular/core';
import { IngredientComponent } from './ingredient.component';
import { IngredientApiService } from './services/ingredient-api.service';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';

const routes: Routes = [{ path: '**', component: IngredientComponent }];

@NgModule({
  declarations: [IngredientComponent],
  imports: [RouterModule.forChild(routes), SharedModule],
  providers: [IngredientApiService],
})
export class IngredientModule {}
