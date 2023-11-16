import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaAddressComponent } from './ca-address.component';

describe('CaAddressComponent', () => {
  let component: CaAddressComponent;
  let fixture: ComponentFixture<CaAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaAddressComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
