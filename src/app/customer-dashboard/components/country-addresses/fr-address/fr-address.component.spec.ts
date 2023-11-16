import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FrAddressComponent } from './fr-address.component';

describe('FrAddressComponent', () => {
  let component: FrAddressComponent;
  let fixture: ComponentFixture<FrAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FrAddressComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FrAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
