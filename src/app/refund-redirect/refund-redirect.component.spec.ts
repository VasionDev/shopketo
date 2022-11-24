import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AppDataService } from '../shared/services/app-data.service';
import { AppSeoService } from '../shared/services/app-seo.service';

import { RefundRedirectComponent } from './refund-redirect.component';

describe('RefundRedirectComponent', () => {
  let component: RefundRedirectComponent;
  let fixture: ComponentFixture<RefundRedirectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RefundRedirectComponent],
      providers: [AppDataService, AppSeoService],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RefundRedirectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
