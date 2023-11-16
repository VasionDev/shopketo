import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BeAddressComponent } from './be-address.component';

describe('BeAddressComponent', () => {
  let component: BeAddressComponent;
  let fixture: ComponentFixture<BeAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BeAddressComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BeAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
