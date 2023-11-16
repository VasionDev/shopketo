import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkAddressComponent } from './sk-address.component';

describe('SkAddressComponent', () => {
  let component: SkAddressComponent;
  let fixture: ComponentFixture<SkAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SkAddressComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SkAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
