import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecialLoginComponent } from './special-login.component';

describe('SpecialLoginComponent', () => {
  let component: SpecialLoginComponent;
  let fixture: ComponentFixture<SpecialLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpecialLoginComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecialLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
