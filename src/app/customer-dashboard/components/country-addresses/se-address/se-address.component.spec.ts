import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeAddressComponent } from './se-address.component';

describe('SeAddressComponent', () => {
  let component: SeAddressComponent;
  let fixture: ComponentFixture<SeAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SeAddressComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SeAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
