import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JpAddressComponent } from './jp-address.component';

describe('JpAddressComponent', () => {
  let component: JpAddressComponent;
  let fixture: ComponentFixture<JpAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JpAddressComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JpAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
