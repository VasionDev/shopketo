import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TagsAndCategoriesComponent } from './tags-and-categories.component';

describe('TagsAndCategoriesComponent', () => {
  let component: TagsAndCategoriesComponent;
  let fixture: ComponentFixture<TagsAndCategoriesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TagsAndCategoriesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TagsAndCategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
