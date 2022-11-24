import { Action } from '@ngrx/store';
import { Blog } from '../models/blog.model';

export enum BlogTypes {
  SET_BLOGS = 'SET_BLOGS',
  UPDATE_BLOGS = 'UPDATE_BLOGS',
  IS_ALL_BLOGS_LOADED = 'IS_ALL_BLOGS_LOADED',
}

export class SetBlogs implements Action {
  readonly type = BlogTypes.SET_BLOGS;

  constructor(public payload: { blogs: Blog[]; noOfBlogs: number }) {}
}

export class UpdateBlogs implements Action {
  readonly type = BlogTypes.UPDATE_BLOGS;

  constructor(public payload: { blogs: Blog[]; noOfBlogs: number }) {}
}

export class SetAllBlogsLoadedStatus implements Action {
  readonly type = BlogTypes.IS_ALL_BLOGS_LOADED;
}

export type BlogActions = SetBlogs | UpdateBlogs | SetAllBlogsLoadedStatus;
