import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { cold, getTestScheduler } from 'jasmine-marbles';
import { from, interval, of, throwError } from 'rxjs';
import { map, mergeMap, take } from 'rxjs/operators';
import { mockBanners } from 'src/test/data/banner-mock';

import { DiscountBannerSliderComponent } from './discount-banner-slider.component';

describe('DiscountBannerSliderComponent', () => {
  let component: DiscountBannerSliderComponent;
  let fixture: ComponentFixture<DiscountBannerSliderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DiscountBannerSliderComponent],
      providers: [],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DiscountBannerSliderComponent);
    component = fixture.componentInstance;
    component.banners = mockBanners();

    (window as any).headerSliderJS = () => {};
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should test banner array should populate value', () => {
    fixture.detectChanges();

    const element: HTMLElement = fixture.debugElement.query(
      By.css('.container-fluid.sk-header__offer')
    ).nativeElement;

    expect(element.style.backgroundColor).toEqual('rgb(130, 36, 227)');
  });

  it('should test async', fakeAsync(() => {
    let isLoaded = false;

    setTimeout(() => {
      isLoaded = true;
    }, 1000);

    tick(1000);

    expect(isLoaded).toBe(true);
  }));

  it('should test mock of operator with cold method', () => {
    const ofObs = of(1, 2, 3);
    const coldSource = cold('(a-b-c|)', { a: 1, b: 2, c: 3 });

    expect(ofObs).toBeObservable(coldSource);
  });

  it('should test mock throw error with cold method', () => {
    const obs = from([1, 2, 3, 4]).pipe(
      mergeMap((item) => {
        if (item >= 3) {
          return throwError(new Error('error occured'));
        } else {
          return of(item);
        }
      })
    );

    const coldObs = cold('(x-y-#)', { x: 1, y: 2 }, new Error('error occured'));

    expect(obs).toBeObservable(coldObs);
  });

  it('should test mock interval with cold method', () => {
    const timerObs = interval(0, getTestScheduler()).pipe(
      take(5),
      map((x) => x * 2)
    );

    const expected = cold('(-a-b-c-d-e|)', { a: 0, b: 2, c: 4, d: 6, e: 8 });

    expect(timerObs).toBeObservable(expected);
  });

  xit('should test banner countdown', () => {
    const now = new Date();
    const startDate = now.getTime() / 1000;
    const endDate = now.setTime(now.getTime() + 1000 * 60) / 1000;

    const timerObs = component.banners[0].countDown$.pipe(take(4));

    const scheduler = getTestScheduler();
    scheduler.run(() => {
      const expected = cold('a 999ms b 999ms c 999ms (d|)', {
        a: '<span style="color:"> 0d 0h 1m 0s</span>',
        b: '<span style="color:"> 0d 0h 0m 59s</span>',
        c: '<span style="color:"> 0d 0h 0m 58s</span>',
        d: '<span style="color:"> 0d 0h 0m 57s</span>',
      });

      expect(timerObs).toBeObservable(expected);
      scheduler.flush();
    });
  });
});
