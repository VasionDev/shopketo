import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViOfferComponent } from './vi-offer.component';

describe('ViOfferComponent', () => {
  let component: ViOfferComponent;
  let fixture: ComponentFixture<ViOfferComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViOfferComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViOfferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
