import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { BlogAuthor } from '../models/blog-author.model';
import { BlogCategory } from '../models/blog-category.model';
import { BlogComment } from '../models/blog-comment.model';
import { Blog } from '../models/blog.model';

@Injectable()
export class BlogApiService {
  domainPath: string;
  blogsPath = 'wp-json/wp/pruvitnow/posts/';
  categoriesPath = 'wp-json/wp/v2/categories/?per_page=100';
  authorsPath = 'wp-json/wp/pruvitnow/users';
  commentsPath = 'wp-json/wp/v2/comments/';

  constructor(private http: HttpClient) {
    this.domainPath = environment.apiDomain;
  }

  getBlogs(country: string): Observable<Blog[]> {
    if (country.toLowerCase() === 'us') {
      return this.http.get<any[]>(this.domainPath + '/' + this.blogsPath).pipe(
        map((responseData) => {
          const blogArray: Blog[] = [];

          responseData.forEach((element: any) => {
            blogArray.push({
              id: element.id,
              title: element.title.rendered,
              content: element.content.rendered,
              imageUrl: element.thumb_url,
              slug: element.slug,
              description: element.metadata.blog_meta_description
                ? element.metadata.blog_meta_description
                : [''],
              authorId: element.author,
              categoryIds: element.categories,
              tags: element.tags,
            });
          });
          return blogArray;
        })
      );
    } else {
      return this.http
        .get<any[]>(
          this.domainPath + '/' + country.toLowerCase() + '/' + this.blogsPath
        )
        .pipe(
          map((responseData) => {
            const blogArray: Blog[] = [];

            responseData.forEach((element: any) => {
              blogArray.push({
                id: element.id,
                title: element.title.rendered,
                content: element.content.rendered,
                imageUrl: element.thumb_url,
                slug: element.slug,
                description: element.metadata.blog_meta_description
                  ? element.metadata.blog_meta_description
                  : [''],
                authorId: element.author,
                categoryIds: element.categories,
                tags: element.tags,
              });
            });
            return blogArray;
          })
        );
    }
  }

  getCategories(country: string): Observable<BlogCategory[]> {
    if (country.toLowerCase() === 'us') {
      return this.http
        .get<any[]>(this.domainPath + '/' + this.categoriesPath)
        .pipe(
          map((responseData) => {
            const blogCategoriesArray: BlogCategory[] = [];

            responseData.forEach((element: any) => {
              blogCategoriesArray.push({
                id: element.id,
                slug: element.slug,
                name: element.name,
                parentID: element.parent,
                description: element.description,
                imageUrl: element.meta.blog_cat_thumb
                  ? element.meta.blog_cat_thumb
                  : [''],
                blogs: [],
              });
            });
            return blogCategoriesArray;
          })
        );
    } else {
      return this.http
        .get<any[]>(
          this.domainPath +
            '/' +
            country.toLowerCase() +
            '/' +
            this.categoriesPath
        )
        .pipe(
          map((responseData) => {
            const blogCategoriesArray: BlogCategory[] = [];

            responseData.forEach((element: any) => {
              blogCategoriesArray.push({
                id: element.id,
                slug: element.slug,
                name: element.name,
                parentID: element.parent,
                description: element.description,
                imageUrl: element.meta.blog_cat_thumb
                  ? element.meta.blog_cat_thumb
                  : [''],
                blogs: [],
              });
            });
            return blogCategoriesArray;
          })
        );
    }
  }

  getAuthors(country: string): Observable<BlogAuthor[]> {
    if (country.toLowerCase() === 'us') {
      return this.http
        .get<any[]>(this.domainPath + '/' + this.authorsPath)
        .pipe(
          map((responseData) => {
            const blogAuthorsArray: BlogAuthor[] = [];

            responseData.forEach((element: any) => {
              blogAuthorsArray.push({
                id: element.id,
                avatar: element.avatar,
                slug: element.slug,
                name: element.name,
              });
            });
            return blogAuthorsArray;
          })
        );
    } else {
      return this.http
        .get<any[]>(
          this.domainPath + '/' + country.toLowerCase() + '/' + this.authorsPath
        )
        .pipe(
          map((responseData) => {
            const blogAuthorsArray: BlogAuthor[] = [];

            responseData.forEach((element: any) => {
              blogAuthorsArray.push({
                id: element.id,
                avatar: element.avatar,
                slug: element.slug,
                name: element.name,
              });
            });
            return blogAuthorsArray;
          })
        );
    }
  }

  getComments(country: string, post: number): Observable<BlogComment[]> {
    if (country.toLowerCase() === 'us') {
      return this.http
        .get<any[]>(this.domainPath + '/' + this.commentsPath + '?post=' + post)
        .pipe(
          map((responseData) => {
            const commentArray: BlogComment[] = [];

            responseData.forEach((element: any) => {
              const monthNames = [
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'May',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Oct',
                'Nov',
                'Dec',
              ];

              const publishedDate: Date = new Date(element.date);
              const publishedMonth: string =
                monthNames[publishedDate.getMonth()];
              const publishedDay = publishedDate.getDate();

              commentArray.push({
                blogId: element.post,
                parentId: element.parent,
                commenter: element.author_name,
                comment: element.content.rendered,
                publisheDdate: publishedMonth + ' ' + publishedDay,
              });
            });
            return commentArray;
          })
        );
    } else {
      return this.http
        .get<any[]>(
          this.domainPath +
            '/' +
            country.toLowerCase() +
            '/' +
            this.commentsPath +
            '?post=' +
            post
        )
        .pipe(
          map((responseData) => {
            const commentArray: BlogComment[] = [];

            responseData.forEach((element: any) => {
              const monthNames = [
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'May',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Oct',
                'Nov',
                'Dec',
              ];

              const publishedDate: Date = new Date(element.date);
              const publishedMonth: string =
                monthNames[publishedDate.getMonth()];
              const publishedDay = publishedDate.getDay();

              commentArray.push({
                blogId: element.post,
                parentId: element.parent,
                commenter: element.author_name,
                comment: element.content.rendered,
                publisheDdate: publishedMonth + ' ' + publishedDay,
              });
            });
            return commentArray;
          })
        );
    }
  }

  postComment(commentBody: any) {
    return this.http.post<any>(
      this.domainPath + '/' + this.commentsPath,
      commentBody
    );
  }
}
