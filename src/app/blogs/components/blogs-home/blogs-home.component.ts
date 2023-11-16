import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { SubscriptionLike } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppSeoService } from 'src/app/shared/services/app-seo.service';
import { BlogAuthor } from '../../models/blog-author.model';
import { BlogCategory } from '../../models/blog-category.model';
import { Blog } from '../../models/blog.model';
import { BlogState } from '../../store/blogs.reducer';
declare var blogSliderJS: any;
declare var bannerSliderJS: any;
declare var $: any;

@Component({
  selector: 'app-blogs-home',
  templateUrl: './blogs-home.component.html',
  styleUrls: ['./blogs-home.component.css'],
})
export class BlogsHomeComponent implements OnInit, OnDestroy {
  selectedCountry = '';
  discountHeight = 0;
  blogs: Blog[] = [];
  featureBlogs: any[] = [];
  authors: BlogAuthor[] = [];
  categories: BlogCategory[] = [];
  toBlogIndex = 6;
  noOfBlogsLoaded = 0;
  isAllBlogsLoaded = false;
  isLoading = false;
  subscriptions: SubscriptionLike[] = [];

  constructor(
    private dataService: AppDataService,
    private router: Router,
    private store: Store<BlogState>,
    private seoService: AppSeoService
  ) {}

  ngOnInit(): void {
    this.getSelectedCountry();
    this.getDiscountHeight();
    this.getBlogs();
    this.getAuthors();
  }

  getDiscountHeight() {
    this.dataService.currentDiscountHeight$.subscribe((height: number) => {
      this.discountHeight = height;
    });
  }

  loadBannerSlider(productsLength: number) {
    if (productsLength === 1) {
      bannerSliderJS(false);
    }
    if (productsLength > 1) {
      const bannerSlick = $(
        '.sk-main__banner-slider.slick-initialized.slick-slider.slick-dotted'
      );

      if (bannerSlick.length > 0) {
        $('.sk-main__banner-slider').slick('unslick');
      }
      setTimeout(() => {
        bannerSliderJS(true);
      });
    }
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

  getBlogs() {
    this.subscriptions.push(
      this.store
        .select('blogs')
        .pipe(map((blogsStates: any) => blogsStates.blogsList))
        .subscribe(
          (res: {
            blogs: Blog[];
            noOfBlogs: number;
            isAllBlogsLoaded: boolean;
          }) => {
            this.blogs = res.blogs;
            this.noOfBlogsLoaded = res.noOfBlogs;
            this.isAllBlogsLoaded = res.isAllBlogsLoaded;

            this.loadBannerSlider(this.blogs.length);
            this.getCategories();

            this.setSeo();
          }
        )
    );
  }

  getAuthors() {
    this.subscriptions.push(
      this.store
        .select('blogs')
        .pipe(map((blogsStates: any) => blogsStates.blogAuthors.authors))
        .subscribe((res: BlogAuthor[]) => {
          this.authors = res;
        })
    );
  }

  getCategories() {
    this.subscriptions.push(
      this.store
        .select('blogs')
        .pipe(map((blogsStates: any) => blogsStates.blogCategories.categories))
        .subscribe((res: BlogCategory[]) => {
          this.getfeatureBlogs(res);

          this.categories = this.getHomeCategories(res);

          $(document).ready(() => {
            if (this.categories.length > 3) {
              const blogSlick = $(
                '.blog-topic-container.slick-initialized.slick-slider'
              );

              if (blogSlick.length > 0) {
                $('.blog-topic-container').slick('unslick');
              }

              blogSliderJS();
            }
          });
        })
    );
  }

  getHomeCategories(categories: BlogCategory[]) {
    const remaniningCategories = categories.filter(
      (category: BlogCategory) => category.slug !== 'uncategorized'
    );

    const homeCategories: BlogCategory[] = [];
    remaniningCategories.forEach((category: BlogCategory) => {
      const categoryBlogs = [];
      this.blogs.forEach((blog: Blog) => {
        blog.categoryIds.every((catId: number) => {
          if (catId === category.id && category.parentID === 0) {
            categoryBlogs.push(blog);
            return false;
          }
          return true;
        });
      });
      if (categoryBlogs.length !== 0) {
        homeCategories.push(category);
      }
    });

    return homeCategories;
  }

  getCategoryImage(imageUrl: string[]) {
    return imageUrl[0] !== '' ? 'url(' + imageUrl[0] + ')' : '';
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

  getBlogAuthor(authorId: number) {
    let authorName: string | undefined = '';

    authorName = this.authors.find(
      (author: BlogAuthor) => author.id === authorId
    )?.name;

    return typeof authorName !== 'undefined' ? authorName : '';
  }

  getfeatureBlogs(blogCategories: BlogCategory[]) {
    this.featureBlogs = [];

    this.blogs.forEach((blog: Blog) => {
      const featureCategories: { name: string; slug: string }[] = [];

      if (blog.categoryIds.length > 0) {
        blog.categoryIds.forEach((id: number) => {
          blogCategories.forEach((category: BlogCategory) => {
            if (category.id === id) {
              featureCategories.push({
                name: category.name,
                slug: category.slug,
              });
            }
          });
        });
      }

      const featureBlog = JSON.parse(JSON.stringify(blog));
      featureBlog.categories = featureCategories;

      this.featureBlogs.push(featureBlog);
    });
  }

  onClickCategory(category: BlogCategory) {
    if (this.selectedCountry.toLowerCase() === 'us') {
      this.router.navigate(['blog/category/' + category.slug]);
    } else {
      this.router.navigate([
        this.selectedCountry.toLowerCase() + '/blog/category/' + category.slug,
      ]);
    }
  }

  onClickAuthor(authorId: number) {
    const author = this.authors.find(
      (author: BlogAuthor) => author.id === authorId
    );

    if (author) {
      if (this.selectedCountry.toLowerCase() === 'us') {
        this.router.navigate(['blog/author/' + author.slug]);
      } else {
        this.router.navigate([
          this.selectedCountry.toLowerCase() + '/blog/author/' + author.slug,
        ]);
      }
    }
  }

  onClickSeeMore() {
    this.toBlogIndex = this.toBlogIndex + 6;
  }

  setSeo() {
    this.seoService.setCanonicalLink();

    this.seoService.updateTitle('Blog');
    this.seoService.updateDescription(
      'Catch up on current trends from leading throught-leaders in the ketone space.'
    );

    this.dataService.currentIsSubdomain$.subscribe((status: boolean) => {
      if (!status) {
        this.seoService.updateRobots('index,follow');
      }
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach((element) => {
      element.unsubscribe();
    });
  }
}
