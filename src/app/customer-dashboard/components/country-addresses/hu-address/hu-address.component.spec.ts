import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HuAddressComponent } from './hu-address.component';

describe('HuAddressComponent', () => {
  let component: HuAddressComponent;
  let fixture: ComponentFixture<HuAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HuAddressComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HuAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
