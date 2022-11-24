import { Action } from "@ngrx/store";
import { BlogAuthor } from "../models/blog-author.model";

export enum BlogAuthorsTypes {
  SET_BLOG_AUTHORS = 'SET_BLOG_AUTHORS',
  UPDATE_BLOG_AUTHORS = 'UPDATE_BLOG_AUTHORS'
}

export class SetBlogAuthors implements Action {
  readonly type = BlogAuthorsTypes.SET_BLOG_AUTHORS;

  constructor(public payload: BlogAuthor[]) {
  }
}

export class UpdateBlogAuthors implements Action {
  readonly type = BlogAuthorsTypes.UPDATE_BLOG_AUTHORS;

  constructor(public payload: BlogAuthor[]) {
  }
}

export type BlogAuthorsActions = SetBlogAuthors | UpdateBlogAuthors;
