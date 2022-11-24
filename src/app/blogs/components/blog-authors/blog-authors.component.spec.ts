import { Location } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, Renderer2 } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Routes } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { Router } from '@angular/router';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';

import { BlogAuthorsComponent } from './blog-authors.component';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';

@Component({})
class BlogDetailsComponent {}

const routes: Routes = [{ path: 'blog/:id', component: BlogDetailsComponent }];

fdescribe('BlogAuthorsComponent', () => {
  let component: BlogAuthorsComponent;
  let fixture: ComponentFixture<BlogAuthorsComponent>;
  let location: Location;
  let router: Router;

  const fakeActivatedRoute = {
    snapshot: { data: {} },
    queryParamMap: of({
      get() {
        return 'challenge-pack';
      },
    }),
    params: of({ id: 'challenge-pack' }),
  };

  const initialState = {
    'admin-console': {
      custodians: {
        ids: [],
        entities: {},
        loading: false,
      },
    },
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes(routes),
      ],
      declarations: [BlogAuthorsComponent],
      providers: [
        Renderer2,
        provideMockStore({ initialState }),
        AppDataService,
        { provide: ActivatedRoute, useValue: fakeActivatedRoute },
        AppUtilityService,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlogAuthorsComponent);
    component = fixture.componentInstance;
    component.selectedCountry = 'US';
    component.authorBlogs = [
      {
        id: 20,
        title: 'test title',
        description: ['first description'],
        content: 'test content',
        imageUrl: 'test imageUrl',
        slug: 'our-favorite-keto-podcasts-what-you-need-to-listen-to-no',
        authorId: 21,
        categoryIds: [22, 23],
        tags: ['test tag'],
      },
    ];
    location = TestBed.inject(Location);
    router = TestBed.inject(Router);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should click read post method and navigate to blog details page', () => {
    spyOn(router, 'navigate');

    const readPostButton = fixture.debugElement.query(By.css('#read-post'));

    readPostButton.triggerEventHandler('click', null);

    fixture.detectChanges();

    expect(router.navigate).toHaveBeenCalledWith([
      '/blog/our-favorite-keto-podcasts-what-you-need-to-listen-to-no',
    ]);
  });
});
