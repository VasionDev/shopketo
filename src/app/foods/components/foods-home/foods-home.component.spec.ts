import { Renderer2 } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import { CookieService } from 'ngx-cookie-service';
import { AppDataService } from 'src/app/shared/services/app-data.service';

import { FoodsHomeComponent } from './foods-home.component';

describe('FoodsHomeComponent', () => {
  let component: FoodsHomeComponent;
  let fixture: ComponentFixture<FoodsHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [provideMockStore()],
      declarations: [FoodsHomeComponent],
      providers: [],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FoodsHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
