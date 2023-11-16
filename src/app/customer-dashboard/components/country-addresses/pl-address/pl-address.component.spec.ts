import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlAddressComponent } from './pl-address.component';

describe('PlAddressComponent', () => {
  let component: PlAddressComponent;
  let fixture: ComponentFixture<PlAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlAddressComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
