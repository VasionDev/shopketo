import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiAddressComponent } from './fi-address.component';

describe('FiAddressComponent', () => {
  let component: FiAddressComponent;
  let fixture: ComponentFixture<FiAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FiAddressComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FiAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
