import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LtAddressComponent } from './lt-address.component';

describe('LtAddressComponent', () => {
  let component: LtAddressComponent;
  let fixture: ComponentFixture<LtAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LtAddressComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LtAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
