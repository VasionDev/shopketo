import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GrAddressComponent } from './gr-address.component';

describe('GrAddressComponent', () => {
  let component: GrAddressComponent;
  let fixture: ComponentFixture<GrAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GrAddressComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GrAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
