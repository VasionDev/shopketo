import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MtAddressComponent } from './mt-address.component';

describe('MtAddressComponent', () => {
  let component: MtAddressComponent;
  let fixture: ComponentFixture<MtAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MtAddressComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MtAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
