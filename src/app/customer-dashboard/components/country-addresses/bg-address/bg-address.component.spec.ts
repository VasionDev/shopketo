import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BgAddressComponent } from './bg-address.component';

describe('BgAddressComponent', () => {
  let component: BgAddressComponent;
  let fixture: ComponentFixture<BgAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BgAddressComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BgAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
