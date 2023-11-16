import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShakedownComponent } from './shakedown.component';

describe('ShakedownComponent', () => {
  let component: ShakedownComponent;
  let fixture: ComponentFixture<ShakedownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShakedownComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShakedownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
