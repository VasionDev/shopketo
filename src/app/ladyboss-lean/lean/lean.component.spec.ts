import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeanComponent } from './lean.component';

describe('LeanComponent', () => {
  let component: LeanComponent;
  let fixture: ComponentFixture<LeanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LeanComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LeanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
