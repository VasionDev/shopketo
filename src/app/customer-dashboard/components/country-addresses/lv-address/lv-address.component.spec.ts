import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LvAddressComponent } from './lv-address.component';

describe('LvAddressComponent', () => {
  let component: LvAddressComponent;
  let fixture: ComponentFixture<LvAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LvAddressComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LvAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
