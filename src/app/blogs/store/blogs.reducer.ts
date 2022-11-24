import { BlogAuthorsReducer } from './blog-author.reducer';
import { BlogCategoriesReducer } from './blog-category.reducer';
import { BlogsListReducer } from './blogs-list.reducer';
import * as BlogListsState from './blogs-list.reducer';
import * as BlogAuthorsState from './blog-author.reducer';
import * as BlogCategoriesState from './blog-category.reducer';
import { ActionReducerMap } from '@ngrx/store';
import * as fromRoot from '../../store/app.reducer';

export interface BlogsCombineState {
  blogsList: BlogListsState.State;
  blogAuthors: BlogAuthorsState.State;
  blogCategories: BlogCategoriesState.State;
}

export const BlogsReducer: ActionReducerMap<BlogsCombineState> = {
  blogsList: BlogsListReducer,
  blogAuthors: BlogAuthorsReducer,
  blogCategories: BlogCategoriesReducer,
};

export interface BlogState extends fromRoot.AppState {
  blogs: BlogsCombineState;
}
