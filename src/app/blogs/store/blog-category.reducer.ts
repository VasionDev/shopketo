import { BlogCategory } from '../models/blog-category.model';
import { BlogCategoriesTypes } from './blog-category.actions';

export interface State {
  categories: BlogCategory[];
}

const initialBlogCategories: State = {
  categories: [],
};

export function BlogCategoriesReducer(
  state = initialBlogCategories,
  action: any
) {
  switch (action.type) {
    case BlogCategoriesTypes.SET_BLOG_CATEGORIES:
      return { ...state, categories: [...action.payload] };

    default:
      return state;
  }
}
