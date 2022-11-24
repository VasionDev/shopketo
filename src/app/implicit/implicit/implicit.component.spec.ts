import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImplicitComponent } from './implicit.component';

describe('ImplicitComponent', () => {
  let component: ImplicitComponent;
  let fixture: ComponentFixture<ImplicitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImplicitComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImplicitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
