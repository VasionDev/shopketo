import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FoodResetSidebarComponent } from './food-reset-sidebar.component';

describe('FoodResetSidebarComponent', () => {
  let component: FoodResetSidebarComponent;
  let fixture: ComponentFixture<FoodResetSidebarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FoodResetSidebarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FoodResetSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
