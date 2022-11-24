import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PruvitLogoFooterComponent } from './pruvit-logo-footer.component';

describe('PruvitLogoFooterComponent', () => {
  let component: PruvitLogoFooterComponent;
  let fixture: ComponentFixture<PruvitLogoFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PruvitLogoFooterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PruvitLogoFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
