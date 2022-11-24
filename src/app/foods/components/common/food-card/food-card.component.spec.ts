import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideMockStore } from '@ngrx/store/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { FoodUtilityService } from 'src/app/foods/services/food-utility.service';

import { FoodCardComponent } from './food-card.component';

class FakeLoader implements TranslateLoader {
  getTranslation(): Observable<any> {
    return of({});
  }
}

describe('FoodCardComponent', () => {
  let component: FoodCardComponent;
  let fixture: ComponentFixture<FoodCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
      ],
      declarations: [FoodCardComponent],
      providers: [FoodUtilityService, provideMockStore()],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FoodCardComponent);
    component = fixture.componentInstance;
    component.isStartPlanning = false;
    component.food = {
      id: '20',
      description: 'first description',
      imageUrl: 'test imageUrl',
      slug: 'our-favorite-keto-podcasts-what-you-need-to-listen-to-no',
      type: 'calorie',
      name: '',
      sku: '',
      price: 100,
      quantity: 0,
      maxQuantity: 10,
      instructions: [],
      nutritionDisclaimer: '',
      limitedTimeAvailability: {
        isSet: false,
        isModalShown: false,
        availableUntil: '',
      },
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should increment the food quantity to 1', () => {
    const plusBtn = fixture.debugElement.query(
      By.css('.button.button-primary.button-large.add-btn')
    );
    plusBtn.triggerEventHandler('click', {});
    fixture.detectChanges();

    expect(component.food.quantity).toBe(1);
  });
});
