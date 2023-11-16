import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeAddressComponent } from './de-address.component';

describe('DeAddressComponent', () => {
  let component: DeAddressComponent;
  let fixture: ComponentFixture<DeAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeAddressComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
