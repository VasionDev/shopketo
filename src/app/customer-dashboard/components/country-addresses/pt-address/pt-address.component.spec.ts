import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PtAddressComponent } from './pt-address.component';

describe('PtAddressComponent', () => {
  let component: PtAddressComponent;
  let fixture: ComponentFixture<PtAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PtAddressComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PtAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
