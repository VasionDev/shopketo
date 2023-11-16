import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { SubscriptionLike } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { BlogAuthor } from '../../models/blog-author.model';
import { Blog } from '../../models/blog.model';
import { BlogState } from '../../store/blogs.reducer';

@Component({
  selector: 'app-blog-authors',
  templateUrl: './blog-authors.component.html',
  styleUrls: ['./blog-authors.component.css'],
})
export class BlogAuthorsComponent implements OnInit, OnDestroy {
  selectedCountry = '';
  discountHeight = 0;
  authorBlogs: Blog[] = [];
  author = {} as BlogAuthor;
  subscriptions: SubscriptionLike[] = [];

  constructor(
    private dataService: AppDataService,
    private store: Store<BlogState>,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private utilityService: AppUtilityService
  ) {}

  ngOnInit(): void {
    this.getDiscountHeight();
    this.getSelectedCountry();
    this.getAuthor();
  }

  getDiscountHeight() {
    this.dataService.currentDiscountHeight$.subscribe((height: number) => {
      this.discountHeight = height;
    });
  }

  getSelectedCountry() {
    this.subscriptions.push(
      this.dataService.currentSelectedCountry$.subscribe(
        (countryCode: string) => {
          this.selectedCountry = countryCode;
        }
      )
    );
  }

  getAuthor() {
    this.subscriptions.push(
      this.store
        .select('blogs')
        .pipe(map((blogsStates: any) => blogsStates.blogAuthors.authors))
        .subscribe((authors: BlogAuthor[]) => {
          this.activatedRoute.params.subscribe((params) => {
            if (authors.length !== 0) {
              authors.forEach((author: BlogAuthor) => {
                if (author.slug === params['id']) {
                  this.author = author;

                  this.getBlogs(author.id);
                  window.scroll(0, 0);
                }
              });
            }
          });
        })
    );
  }

  getBlogs(authorId: number) {
    this.subscriptions.push(
      this.store
        .select('blogs')
        .pipe(map((blogsStates: any) => blogsStates.blogsList))
        .subscribe((res: { blogs: Blog[] }) => {
          res.blogs.forEach((blog: Blog) => {
            if (blog.authorId === authorId) {
              this.authorBlogs.push(blog);
            }
          });
        })
    );
  }

  onClickReadPost(blogSlug: string) {
    if (this.selectedCountry.toLowerCase() === 'us') {
      this.router.navigate(['blog' + '/' + blogSlug]);
    } else {
      this.router.navigate([
        this.selectedCountry.toLowerCase() + '/' + 'blog' + '/' + blogSlug,
      ]);
    }
  }

  onClickHome() {
    this.utilityService.navigateToRoute('/');
  }

  onClickBlog() {
    this.utilityService.navigateToRoute('/blog');
  }

  ngOnDestroy() {
    this.subscriptions.forEach((element) => {
      element.unsubscribe();
    });
  }
}
