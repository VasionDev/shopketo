import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItAddressComponent } from './it-address.component';

describe('ItAddressComponent', () => {
  let component: ItAddressComponent;
  let fixture: ComponentFixture<ItAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ItAddressComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
