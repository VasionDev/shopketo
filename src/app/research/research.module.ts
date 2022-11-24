import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { ResearchComponent } from './research.component';
import { RouterModule, Routes } from '@angular/router';
import { ResearchHomeComponent } from './components/research-home/research-home.component';
import { StoreModule } from '@ngrx/store';
import { SharedModule } from '../shared/shared.module';
import { ResearchApiService } from './services/research-api.service';
import * as fromResearch from './store/research.reducer';

const routes: Routes = [
  {
    path: '',
    component: ResearchComponent,
    children: [{ path: '', component: ResearchHomeComponent }],
  },
];

@NgModule({
  declarations: [ResearchComponent, ResearchHomeComponent],
  imports: [
    SharedModule,
    RouterModule.forChild(routes),
    StoreModule.forFeature('research', fromResearch.researchesReducer),
  ],
  exports: [RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [ResearchApiService],
})
export class ResearchModule {}
