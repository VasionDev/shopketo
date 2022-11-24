import { Research } from '../models/research.model';
import { ReseachTypes, ResearchActions } from './research-videos.actions';

export interface ResearchState {
  researchVideos: Research[];
}

const initialResearch: ResearchState = {
  researchVideos: [],
};

export function ReseachReducer(state = initialResearch, action: any) {
  switch (action.type) {
    case ReseachTypes.SET_RESEARCH_VIDEOS:
      return {
        ...state,
        researchVideos: [...action.payload.videos],
      };

    default:
      return state;
  }
}
