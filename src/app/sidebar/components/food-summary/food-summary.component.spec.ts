import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { FoodUtilityService } from 'src/app/foods/services/food-utility.service';
import { AppDataService } from 'src/app/shared/services/app-data.service';

import { FoodSummaryComponent } from './food-summary.component';

describe('FoodSummaryComponent', () => {
  let component: FoodSummaryComponent;
  let fixture: ComponentFixture<FoodSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FoodSummaryComponent],
      providers: [FoodUtilityService, AppDataService, Store],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FoodSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
