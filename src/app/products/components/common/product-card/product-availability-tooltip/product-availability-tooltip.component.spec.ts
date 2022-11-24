import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductAvailabilityTooltipComponent } from './product-availability-tooltip.component';

describe('ProductAvailabilityTooltipComponent', () => {
  let component: ProductAvailabilityTooltipComponent;
  let fixture: ComponentFixture<ProductAvailabilityTooltipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductAvailabilityTooltipComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductAvailabilityTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
