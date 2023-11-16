import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuAddressComponent } from './au-address.component';

describe('AuAddressComponent', () => {
  let component: AuAddressComponent;
  let fixture: ComponentFixture<AuAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AuAddressComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AuAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
