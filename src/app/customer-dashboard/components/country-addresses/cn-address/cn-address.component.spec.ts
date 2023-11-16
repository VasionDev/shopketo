import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CnAddressComponent } from './cn-address.component';

describe('CnAddressComponent', () => {
  let component: CnAddressComponent;
  let fixture: ComponentFixture<CnAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CnAddressComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CnAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
