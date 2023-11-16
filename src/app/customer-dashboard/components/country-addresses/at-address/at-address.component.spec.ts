import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AtAddressComponent } from './at-address.component';

describe('AtAddressComponent', () => {
  let component: AtAddressComponent;
  let fixture: ComponentFixture<AtAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AtAddressComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AtAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
