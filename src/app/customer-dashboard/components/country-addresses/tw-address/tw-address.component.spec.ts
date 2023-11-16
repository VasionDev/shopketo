import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TwAddressComponent } from './tw-address.component';

describe('TwAddressComponent', () => {
  let component: TwAddressComponent;
  let fixture: ComponentFixture<TwAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TwAddressComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TwAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
