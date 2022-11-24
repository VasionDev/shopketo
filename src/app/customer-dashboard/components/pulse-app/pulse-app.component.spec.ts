import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PulseAppComponent } from './pulse-app.component';

describe('PulseAppComponent', () => {
  let component: PulseAppComponent;
  let fixture: ComponentFixture<PulseAppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PulseAppComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PulseAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
