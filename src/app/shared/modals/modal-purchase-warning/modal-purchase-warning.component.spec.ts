import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalPurchaseWarningComponent } from './modal-purchase-warning.component';

describe('ModalPurchaseWarningComponent', () => {
  let component: ModalPurchaseWarningComponent;
  let fixture: ComponentFixture<ModalPurchaseWarningComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ModalPurchaseWarningComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalPurchaseWarningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
