import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HrAddressComponent } from './hr-address.component';

describe('HrAddressComponent', () => {
  let component: HrAddressComponent;
  let fixture: ComponentFixture<HrAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HrAddressComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HrAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
