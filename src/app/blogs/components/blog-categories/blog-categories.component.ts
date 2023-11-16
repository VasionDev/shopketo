import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { SubscriptionLike } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { BlogCategory } from '../../models/blog-category.model';
import { Blog } from '../../models/blog.model';
import { BlogState } from '../../store/blogs.reducer';

@Component({
  selector: 'app-blog-categories',
  templateUrl: './blog-categories.component.html',
  styleUrls: ['./blog-categories.component.css'],
})
export class BlogCategoriesComponent implements OnInit, OnDestroy {
  selectedCountry = '';
  discountHeight = 0;
  categoryBlogs: Blog[] = [];
  subCategories: BlogCategory[] = [];
  category = {} as BlogCategory;
  parentCategory = {} as BlogCategory;
  selectedCategory = '';
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
    this.getCategory();
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

  getCategory() {
    this.subscriptions.push(
      this.store
        .select('blogs')
        .pipe(map((blogsStates: any) => blogsStates.blogCategories.categories))
        .subscribe((categories: BlogCategory[]) => {
          this.activatedRoute.params.subscribe((params) => {
            if (categories.length !== 0) {
              categories.forEach((category: BlogCategory) => {
                if (category.slug === params['id']) {
                  this.category = category;
                  this.parentCategory = this.getParentCategory(
                    this.category.parentID
                  );

                  this.categoryBlogs = this.getBlogs(category.id);
                  this.subCategories = this.getSubCategories(category.id);
                  window.scroll(0, 0);
                }
              });
            }
          });
        })
    );
  }

  getParentCategory(parentId: number) {
    let parentCategory = {} as BlogCategory;

    this.subscriptions.push(
      this.store
        .select('blogs')
        .pipe(map((blogsStates: any) => blogsStates.blogCategories.categories))
        .subscribe((categories: BlogCategory[]) => {
          categories.forEach((category: BlogCategory) => {
            if (category.id === parentId) {
              parentCategory = category;
            }
          });
        })
    );

    return parentCategory;
  }

  getSubCategories(categoryId: number) {
    const tempSubCategories: BlogCategory[] = [];

    this.subscriptions.push(
      this.store
        .select('blogs')
        .pipe(map((blogsStates: any) => blogsStates.blogCategories.categories))
        .subscribe((categories: BlogCategory[]) => {
          if (categories.length !== 0) {
            categories.forEach((category: BlogCategory) => {
              if (category.parentID === categoryId) {
                const blogs = this.getBlogs(category.id);
                const tempCategory = Object.assign({}, category);
                tempCategory.blogs = blogs;

                tempSubCategories.push(tempCategory);
              }
            });
          }
        })
    );

    return tempSubCategories;
  }

  getBlogs(categoryId: number) {
    const tempCategoryBlogs: Blog[] = [];

    this.subscriptions.push(
      this.store
        .select('blogs')
        .pipe(map((blogsStates: any) => blogsStates.blogsList))
        .subscribe((res: { blogs: Blog[] }) => {
          res.blogs.forEach((blog: Blog) => {
            blog.categoryIds.every((catId: number) => {
              if (catId === categoryId) {
                tempCategoryBlogs.push(blog);
                return false;
              }
              return true;
            });
          });
        })
    );

    return tempCategoryBlogs;
  }

  onClickCategory(categorySlug: string) {
    if (categorySlug === this.selectedCategory) {
      this.selectedCategory = '';
    } else {
      this.selectedCategory = categorySlug;
    }
  }

  getSpecificCategoryBlogs(categories: BlogCategory[]) {
    const category = categories.find(
      (x: BlogCategory) => x.slug === this.selectedCategory
    );
    return category ? category.blogs : [];
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

  onClickParentCategory(category: BlogCategory) {
    if (this.selectedCountry.toLowerCase() === 'us') {
      this.router.navigate(['blog/category/' + category.slug]);
    } else {
      this.router.navigate([
        this.selectedCountry.toLowerCase() + '/blog/category/' + category.slug,
      ]);
    }
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
