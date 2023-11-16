import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HkAddressComponent } from './hk-address.component';

describe('HkAddressComponent', () => {
  let component: HkAddressComponent;
  let fixture: ComponentFixture<HkAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HkAddressComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HkAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
