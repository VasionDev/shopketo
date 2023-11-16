import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GbAddressComponent } from './gb-address.component';

describe('GbAddressComponent', () => {
  let component: GbAddressComponent;
  let fixture: ComponentFixture<GbAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GbAddressComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GbAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
