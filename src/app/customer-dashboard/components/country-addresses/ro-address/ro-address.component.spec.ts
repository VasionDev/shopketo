import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoAddressComponent } from './ro-address.component';

describe('RoAddressComponent', () => {
  let component: RoAddressComponent;
  let fixture: ComponentFixture<RoAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RoAddressComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RoAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
