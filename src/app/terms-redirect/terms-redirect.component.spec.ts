import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AppDataService } from '../shared/services/app-data.service';
import { AppSeoService } from '../shared/services/app-seo.service';

import { TermsRedirectComponent } from './terms-redirect.component';

describe('TermsRedirectComponent', () => {
  let component: TermsRedirectComponent;
  let fixture: ComponentFixture<TermsRedirectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TermsRedirectComponent],
      providers: [AppDataService, AppSeoService],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TermsRedirectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
