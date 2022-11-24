import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { forkJoin, SubscriptionLike } from 'rxjs';
import { AppDataService } from '../shared/services/app-data.service';
import { BlogApiService } from './services/blog-api.service';
import * as BlogActions from './store/blogs-list.actions';
import * as BlogAuthorsActions from './store/blog-author.actions';
import * as BlogCategoriesActions from './store/blog-category.actions';
import { BlogState } from './store/blogs.reducer';
import { Router } from '@angular/router';
import { AppUtilityService } from '../shared/services/app-utility.service';

@Component({
  selector: 'app-blogs',
  templateUrl: './blogs.component.html',
  styleUrls: ['./blogs.component.css'],
})
export class BlogsComponent implements OnInit, OnDestroy {
  selectedCountry = '';
  isLoaded = false;
  subscriptions: SubscriptionLike[] = [];

  constructor(
    private blogApiService: BlogApiService,
    private dataService: AppDataService,
    private store: Store<BlogState>,
    private utilityService: AppUtilityService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getSelectedCountry();
  }

  getSelectedCountry() {
    this.subscriptions.push(
      this.dataService.currentSelectedCountry$.subscribe(
        (countryCode: string) => {
          this.selectedCountry = countryCode;
          this.getBlogs(countryCode);
        }
      )
    );
  }

  getBlogs(country: string) {
    this.subscriptions.push(
      forkJoin([
        this.blogApiService.getBlogs(country),
        this.blogApiService.getCategories(country),
        this.blogApiService.getAuthors(country),
      ]).subscribe((responseData: any[]) => {
        this.isLoaded = true;
        this.setRedirectURL();

        this.store.dispatch(
          new BlogActions.SetBlogs({
            blogs: responseData[0],
            noOfBlogs: responseData[0].length,
          })
        );
        this.store.dispatch(new BlogActions.SetAllBlogsLoadedStatus());

        this.store.dispatch(
          new BlogCategoriesActions.SetBlogCategories(responseData[1])
        );

        this.store.dispatch(
          new BlogAuthorsActions.SetBlogAuthors(responseData[2])
        );
      })
    );
  }

  setRedirectURL() {
    this.utilityService.setRedirectURL(this.router.url, this.selectedCountry);
  }

  ngOnDestroy() {
    this.subscriptions.forEach((element) => {
      element.unsubscribe();
    });
  }
}
