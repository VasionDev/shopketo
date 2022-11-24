import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmAddressComponent } from './confirm-address.component';

describe('ConfirmAddressComponent', () => {
  let component: ConfirmAddressComponent;
  let fixture: ComponentFixture<ConfirmAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfirmAddressComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
