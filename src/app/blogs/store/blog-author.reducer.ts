import { BlogAuthor } from '../models/blog-author.model';
import { BlogAuthorsTypes } from './blog-author.actions';

export interface State {
  authors: BlogAuthor[];
}

const initialBlogAuthors: State = {
  authors: [],
};

export function BlogAuthorsReducer(state = initialBlogAuthors, action: any) {
  switch (action.type) {
    case BlogAuthorsTypes.SET_BLOG_AUTHORS:
      return { ...state, authors: [...action.payload] };

    default:
      return state;
  }
}
