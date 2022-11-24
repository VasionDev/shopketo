import { ActionReducerMap } from '@ngrx/store';
import * as fromRoot from '../../store/app.reducer';
import { ReseachReducer } from './research-videos.reducer';
import * as fromResearch from './research-videos.reducer';

export interface ResearchCombineState {
  researchVideos: fromResearch.ResearchState;
}

export const researchesReducer: ActionReducerMap<ResearchCombineState> = {
  researchVideos: ReseachReducer,
};

export interface ResearchState extends fromRoot.AppState {
  research: ResearchCombineState;
}
