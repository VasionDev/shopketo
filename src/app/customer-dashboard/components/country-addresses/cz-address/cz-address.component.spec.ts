import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CzAddressComponent } from './cz-address.component';

describe('CzAddressComponent', () => {
  let component: CzAddressComponent;
  let fixture: ComponentFixture<CzAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CzAddressComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CzAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
