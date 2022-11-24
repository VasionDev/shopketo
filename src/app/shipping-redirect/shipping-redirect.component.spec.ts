import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AppDataService } from '../shared/services/app-data.service';
import { AppSeoService } from '../shared/services/app-seo.service';

import { ShippingRedirectComponent } from './shipping-redirect.component';

describe('ShippingRedirectComponent', () => {
  let component: ShippingRedirectComponent;
  let fixture: ComponentFixture<ShippingRedirectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ShippingRedirectComponent],
      providers: [AppDataService, AppSeoService],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShippingRedirectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
