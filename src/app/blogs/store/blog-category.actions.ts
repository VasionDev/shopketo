import { Action } from "@ngrx/store";
import { BlogCategory } from "../models/blog-category.model";

export enum BlogCategoriesTypes {
  SET_BLOG_CATEGORIES = 'SET_BLOG_CATEGORIES',
  UPDATE_BLOG_CATEGORIES = 'UPDATE_BLOG_CATEGORIES'
}

export class SetBlogCategories implements Action {
  readonly type = BlogCategoriesTypes.SET_BLOG_CATEGORIES;

  constructor(public payload: BlogCategory[]) {
  }
}

export class UpdateBlogCategories implements Action {
  readonly type = BlogCategoriesTypes.UPDATE_BLOG_CATEGORIES;

  constructor(public payload: BlogCategory[]) {
  }
}

export type BlogCategoriesActions = SetBlogCategories | UpdateBlogCategories;
