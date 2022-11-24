import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalLimitedTimeComponent } from './modal-limited-time.component';

describe('ModalLimitedTimeComponent', () => {
  let component: ModalLimitedTimeComponent;
  let fixture: ComponentFixture<ModalLimitedTimeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalLimitedTimeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalLimitedTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
