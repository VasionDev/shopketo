import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalShippingOptionsComponent } from './modal-shipping-options.component';

describe('ModalShippingOptionsComponent', () => {
  let component: ModalShippingOptionsComponent;
  let fixture: ComponentFixture<ModalShippingOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalShippingOptionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalShippingOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
