import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BetterTripsComponent } from './better-trips.component';

describe('BetterTripsComponent', () => {
  let component: BetterTripsComponent;
  let fixture: ComponentFixture<BetterTripsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BetterTripsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BetterTripsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
