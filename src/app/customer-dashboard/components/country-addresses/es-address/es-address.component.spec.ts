import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EsAddressComponent } from './es-address.component';

describe('EsAddressComponent', () => {
  let component: EsAddressComponent;
  let fixture: ComponentFixture<EsAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EsAddressComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EsAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
