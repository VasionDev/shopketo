import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CyAddressComponent } from './cy-address.component';

describe('CyAddressComponent', () => {
  let component: CyAddressComponent;
  let fixture: ComponentFixture<CyAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CyAddressComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CyAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
