import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FoodBoxSidebarComponent } from './food-box-sidebar.component';

describe('FoodBoxCardComponent', () => {
  let component: FoodBoxSidebarComponent;
  let fixture: ComponentFixture<FoodBoxSidebarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FoodBoxSidebarComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FoodBoxSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
