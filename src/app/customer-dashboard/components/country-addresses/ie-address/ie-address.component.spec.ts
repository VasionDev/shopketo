import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IeAddressComponent } from './ie-address.component';

describe('IeAddressComponent', () => {
  let component: IeAddressComponent;
  let fixture: ComponentFixture<IeAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IeAddressComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IeAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
