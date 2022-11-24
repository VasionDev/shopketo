import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CountryBarComponent } from './country-bar.component';

describe('CountryBarComponent', () => {
  let component: CountryBarComponent;
  let fixture: ComponentFixture<CountryBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CountryBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CountryBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
