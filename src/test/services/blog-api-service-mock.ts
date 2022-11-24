import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { Blog } from 'src/app/blogs/models/blog.model';

@Injectable()
export class BlogApiServiceStub {
  getBlogs(blogs: Blog[]) {
    return of(blogs);
  }

  postComment(commentBody: any) {
    return of({});
  }
}
