import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LuAddressComponent } from './lu-address.component';

describe('LuAddressComponent', () => {
  let component: LuAddressComponent;
  let fixture: ComponentFixture<LuAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LuAddressComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LuAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
