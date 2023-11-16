import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoAddressComponent } from './mo-address.component';

describe('MoAddressComponent', () => {
  let component: MoAddressComponent;
  let fixture: ComponentFixture<MoAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MoAddressComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MoAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
