import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PruvitLogoDesktopComponent } from './pruvit-logo-desktop.component';

describe('PruvitLogoDesktopComponent', () => {
  let component: PruvitLogoDesktopComponent;
  let fixture: ComponentFixture<PruvitLogoDesktopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PruvitLogoDesktopComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PruvitLogoDesktopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
