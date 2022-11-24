import { Blog } from '../models/blog.model';
import { BlogTypes } from './blogs-list.actions';

export interface State {
  blogs: Blog[];
  noOfBlogs: number;
  isAllBlogsLoaded: boolean;
}

const initialBlogs: State = {
  blogs: [],
  noOfBlogs: 0,
  isAllBlogsLoaded: false,
};

export function BlogsListReducer(state = initialBlogs, action: any) {
  switch (action.type) {
    case BlogTypes.SET_BLOGS:
      return {
        ...state,
        blogs: [...action.payload.blogs],
        noOfBlogs: action.payload.noOfBlogs,
      };

    case BlogTypes.UPDATE_BLOGS:
      return {
        ...state,
        blogs: [...state.blogs, ...action.payload.blogs],
        noOfBlogs: action.payload.noOfBlogs,
      };

    case BlogTypes.IS_ALL_BLOGS_LOADED:
      return {
        ...state,
        isAllBlogsLoaded: true,
      };

    default:
      return state;
  }
}
