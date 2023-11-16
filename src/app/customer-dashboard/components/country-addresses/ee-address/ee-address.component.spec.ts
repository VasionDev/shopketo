import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EeAddressComponent } from './ee-address.component';

describe('EeAddressComponent', () => {
  let component: EeAddressComponent;
  let fixture: ComponentFixture<EeAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EeAddressComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EeAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
