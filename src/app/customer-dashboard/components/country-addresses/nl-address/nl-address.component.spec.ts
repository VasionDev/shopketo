import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NlAddressComponent } from './nl-address.component';

describe('NlAddressComponent', () => {
  let component: NlAddressComponent;
  let fixture: ComponentFixture<NlAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NlAddressComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NlAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
