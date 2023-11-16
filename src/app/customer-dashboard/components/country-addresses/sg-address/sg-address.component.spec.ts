import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SgAddressComponent } from './sg-address.component';

describe('SgAddressComponent', () => {
  let component: SgAddressComponent;
  let fixture: ComponentFixture<SgAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SgAddressComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SgAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
