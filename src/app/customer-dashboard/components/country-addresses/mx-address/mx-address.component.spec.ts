import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MxAddressComponent } from './mx-address.component';

describe('MxAddressComponent', () => {
  let component: MxAddressComponent;
  let fixture: ComponentFixture<MxAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MxAddressComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MxAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
