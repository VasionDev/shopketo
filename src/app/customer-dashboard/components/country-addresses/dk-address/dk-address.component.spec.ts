import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DkAddressComponent } from './dk-address.component';

describe('DkAddressComponent', () => {
  let component: DkAddressComponent;
  let fixture: ComponentFixture<DkAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DkAddressComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DkAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
