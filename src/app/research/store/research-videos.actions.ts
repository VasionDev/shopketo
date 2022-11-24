import { Action } from '@ngrx/store';
import { Research } from '../models/research.model';

export enum ReseachTypes {
  SET_RESEARCH_VIDEOS = '[RESEARCH] Set Research Videos',
}

export class SetResearchVideos implements Action {
  readonly type = ReseachTypes.SET_RESEARCH_VIDEOS;

  constructor(public payload: { videos: Research[] }) {}
}

export type ResearchActions = SetResearchVideos;
