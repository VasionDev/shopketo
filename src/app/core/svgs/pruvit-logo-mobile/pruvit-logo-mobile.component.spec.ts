import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PruvitLogoMobileComponent } from './pruvit-logo-mobile.component';

describe('PruvitLogoMobileComponent', () => {
  let component: PruvitLogoMobileComponent;
  let fixture: ComponentFixture<PruvitLogoMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PruvitLogoMobileComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PruvitLogoMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
