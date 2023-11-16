import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlAddressComponent } from './al-address.component';

describe('AlAddressComponent', () => {
  let component: AlAddressComponent;
  let fixture: ComponentFixture<AlAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AlAddressComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AlAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
