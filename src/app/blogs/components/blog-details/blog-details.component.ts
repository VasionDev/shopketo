import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { Blog } from '../../models/blog.model';
import { ActivatedRoute, Router } from '@angular/router';
import { BlogAuthor } from '../../models/blog-author.model';
import { SubscriptionLike } from 'rxjs';
import { BlogApiService } from '../../services/blog-api.service';
import { BlogComment } from '../../models/blog-comment.model';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AppSeoService } from 'src/app/shared/services/app-seo.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { BlogCategory } from '../../models/blog-category.model';
import { Meta } from '@angular/platform-browser';
import { BlogState } from '../../store/blogs.reducer';
declare var instgrm: any;
declare var $: any;

@Component({
  selector: 'app-blog-details',
  templateUrl: './blog-details.component.html',
  styleUrls: ['./blog-details.component.css'],
})
export class BlogDetailsComponent implements OnInit, OnDestroy {
  @ViewChild('inputAuthorName') authorName!: ElementRef;
  selectedCountry = '';
  discountHeight = 0;
  blog = {} as Blog;
  blogs: Blog[] = [];
  authors: BlogAuthor[] = [];
  comments: BlogComment[] = [];
  category = {} as BlogCategory;
  childCategory = {} as BlogCategory;
  toCommentIndex = 5;
  isInputFocused = false;
  commentForm: FormGroup;
  tempCommentForm: FormGroup;
  commentSuccessMessage = '';
  pageUrl = '';
  subscriptions: SubscriptionLike[] = [];

  constructor(
    private dataService: AppDataService,
    private store: Store<BlogState>,
    private activatedRoute: ActivatedRoute,
    private blogApiService: BlogApiService,
    private formBuilder: FormBuilder,
    private seoService: AppSeoService,
    private utilityService: AppUtilityService,
    private router: Router,
    private meta: Meta
  ) {
    this.pageUrl = window.location.href;

    $(document).ready(() => {
      const instagramWindow = (window as { [key: string]: any })[
        'instgrm'
      ] as string;

      if (instagramWindow) {
        instgrm.Embeds.process();
      }
    });

    this.tempCommentForm = this.formBuilder.group({
      response: new FormControl(''),
    });

    this.commentForm = this.formBuilder.group({
      authorName: new FormControl('', Validators.required),
      authorEmail: new FormControl('', [
        Validators.required,
        Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
      ]),
      authorResponse: new FormControl('', Validators.required),
    });
  }

  ngOnInit(): void {
    this.getSelectedCountry();
    this.getDiscountHeight();
    this.getBlogs();
    this.getAuthors();
  }

  get authorNameControl() {
    return this.commentForm.controls['authorName'];
  }

  get authorEmailControl() {
    return this.commentForm.controls['authorEmail'];
  }

  get authorResponseControl() {
    return this.commentForm.controls['authorResponse'];
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

  getBlogs() {
    this.subscriptions.push(
      this.store
        .select('blogs')
        .pipe(map((blogsStates: any) => blogsStates.blogsList))
        .subscribe((res: { blogs: Blog[]; noOfBlogs: number }) => {
          this.blogs = res.blogs;

          this.getBlog(this.blogs);
        })
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

  getBlog(blogs: Blog[]) {
    this.activatedRoute.params.subscribe((params) => {
      this.blog = {} as Blog;

      if (blogs.length !== 0) {
        blogs.forEach((blog: Blog) => {
          if (blog.slug === params['id']) {
            this.blog = blog;

            this.getComments(blog);
            this.getCategory(blog);
            window.scroll(0, 0);

            this.setSeo();
          }
        });
      }
    });
  }

  getBlogAuthor(authorId: number) {
    let authorName: string | undefined = '';

    authorName = this.authors.find(
      (author: BlogAuthor) => author.id === authorId
    )?.name;

    return typeof authorName !== 'undefined' ? authorName : '';
  }

  getBlogAuthorAvatar(authorId: number) {
    let avatar: string | undefined = '';

    avatar = this.authors.find(
      (author: BlogAuthor) => author.id === authorId
    )?.avatar;

    return typeof avatar !== 'undefined' ? avatar : '';
  }

  getComments(blog: Blog) {
    this.blogApiService
      .getComments(this.selectedCountry, blog.id)
      .subscribe((blogComments: BlogComment[]) => {
        this.comments = blogComments;
      });
  }

  getCategory(blog: Blog) {
    this.subscriptions.push(
      this.store
        .select('blogs')
        .pipe(map((blogsStates: any) => blogsStates.blogCategories.categories))
        .subscribe((categories: BlogCategory[]) => {
          if (categories.length !== 0) {
            categories.forEach((category: BlogCategory) => {
              blog.categoryIds.forEach((id: number) => {
                if (category.id === id && category.parentID === 0) {
                  this.category = category;
                }

                if (category.id === id && category.parentID !== 0) {
                  this.childCategory = category;
                }
              });
            });
          }
        })
    );
  }

  onClickSeeMore() {
    this.toCommentIndex = this.toCommentIndex + 2;
  }

  onInputFocus() {
    this.isInputFocused = true;

    setTimeout(() => {
      if (this.authorName) {
        this.authorName.nativeElement.focus();
      }
    }, 0);
  }

  onSubmitComment() {
    const commentBody = {
      author_name: this.commentForm.value.authorName,
      author_email: this.commentForm.value.authorEmail,
      content: this.commentForm.value.authorResponse,
      post: this.blog.id,
    };

    this.blogApiService.postComment(commentBody).subscribe(() => {
      this.commentSuccessMessage =
        'Thank you, your comment has been submitted for approval.';
    });
  }

  setSeo() {
    this.seoService.setCanonicalLink();

    this.meta.updateTag({ property: 'og:title', content: this.blog.title });
    this.meta.updateTag({
      property: 'og:description',
      content: this.blog.content.substring(0, 140).replace(/<[^>]*>/g, ''),
    });
    this.meta.updateTag({ property: 'og:image', content: this.blog.imageUrl });
    this.meta.updateTag({ property: 'og:url', content: this.pageUrl });

    this.meta.updateTag({
      property: 'twitter:title',
      content: this.blog.title,
    });
    this.meta.updateTag({
      property: 'twitter:description',
      content: this.blog.content.substring(0, 140).replace(/<[^>]*>/g, ''),
    });
    this.meta.updateTag({
      property: 'twitter:image',
      content: this.blog.imageUrl,
    });
    this.meta.updateTag({ property: 'twitter:card', content: this.pageUrl });

    if (
      !(
        this.blog &&
        Object.keys(this.blog).length === 0 &&
        this.blog.constructor === Object
      )
    ) {
      this.seoService.updateTitle(this.blog.title);

      if (this.blog.description[0] === '') {
        this.seoService.updateDescription(
          'Catch up on current trends from leading throught-leaders in the ketone space.'
        );
      } else {
        this.seoService.updateDescription(this.blog.description[0]);
      }

      this.dataService.currentIsSubdomain$.subscribe((status: boolean) => {
        if (!status) {
          this.seoService.updateRobots('index,follow');
        }
      });
    } else {
      this.seoService.updateTitle('Blog not found');

      this.dataService.currentIsSubdomain$.subscribe((status: boolean) => {
        if (!status) {
          this.seoService.updateRobots('noindex,follow');
        }
      });
    }
  }

  onClickHome() {
    this.utilityService.navigateToRoute('/');
  }

  onClickBlog() {
    this.utilityService.navigateToRoute('/blog');
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

  ngOnDestroy() {
    this.subscriptions.forEach((element) => {
      element.unsubscribe();
    });
  }
}
