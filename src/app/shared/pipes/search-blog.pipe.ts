import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'searchBlog',
})
export class SearchBlogPipe implements PipeTransform {
  transform(blogs: any[], term: string): any[] {
    if (term === '') {
      return [];
    }

    return blogs.filter((x: any) =>
      x.title.toLowerCase().includes(term.toLowerCase())
    );
  }
}
