import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChAddressComponent } from './ch-address.component';

describe('ChAddressComponent', () => {
  let component: ChAddressComponent;
  let fixture: ComponentFixture<ChAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChAddressComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
