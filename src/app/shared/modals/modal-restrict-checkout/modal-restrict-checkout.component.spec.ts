import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalRestrictCheckoutComponent } from './modal-restrict-checkout.component';

describe('RestrictCheckoutComponent', () => {
  let component: ModalRestrictCheckoutComponent;
  let fixture: ComponentFixture<ModalRestrictCheckoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalRestrictCheckoutComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalRestrictCheckoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
