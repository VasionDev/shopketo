import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiAddressComponent } from './si-address.component';

describe('SiAddressComponent', () => {
  let component: SiAddressComponent;
  let fixture: ComponentFixture<SiAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiAddressComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SiAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
