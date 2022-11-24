import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogsHomeComponent } from './blogs-home.component';

describe('BlogsHomeComponent', () => {
  let component: BlogsHomeComponent;
  let fixture: ComponentFixture<BlogsHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BlogsHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlogsHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
