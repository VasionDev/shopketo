import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NzAddressComponent } from './nz-address.component';

describe('NzAddressComponent', () => {
  let component: NzAddressComponent;
  let fixture: ComponentFixture<NzAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NzAddressComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NzAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
