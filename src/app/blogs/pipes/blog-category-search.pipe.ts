import { Pipe, PipeTransform } from '@angular/core';
import { BlogCategory } from '../models/blog-category.model';
import { Blog } from '../models/blog.model';

@Pipe({
  name: 'blogCategorySearch',
})
export class BlogCategorySearchPipe implements PipeTransform {
  transform(categories: BlogCategory[], blogs: Blog[]): BlogCategory[] {
    if (blogs.length === 0) {
      return [];
    }
    if (categories.length !== 0) {
      categories.forEach((category: BlogCategory) => {
        if (blogs.length !== 0) {
          const tempBlogs: Blog[] = [];
          blogs.forEach((blog: Blog) => {
            const result = blog.categoryIds.some(
              (x: number) => x === category.id
            );
            if (result) {
              tempBlogs.push(blog);
            }
          });
          category.blogs = tempBlogs;
        }
      });
    }
    const filteredCategory = categories.filter(
      (x: any) => x.blogs.length !== 0
    );
    return filteredCategory;
  }
}
