import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentStatusBannerComponent } from './payment-status-banner.component';

describe('PaymentStatusBannerComponent', () => {
  let component: PaymentStatusBannerComponent;
  let fixture: ComponentFixture<PaymentStatusBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaymentStatusBannerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentStatusBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
