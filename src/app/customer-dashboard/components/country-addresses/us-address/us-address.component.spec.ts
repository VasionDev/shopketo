import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsAddressComponent } from './us-address.component';

describe('UsAddressComponent', () => {
  let component: UsAddressComponent;
  let fixture: ComponentFixture<UsAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UsAddressComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UsAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
