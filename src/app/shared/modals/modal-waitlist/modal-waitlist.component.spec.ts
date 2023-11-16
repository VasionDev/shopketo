import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalWaitlistComponent } from './modal-waitlist.component';

describe('ModalWaitlistComponent', () => {
  let component: ModalWaitlistComponent;
  let fixture: ComponentFixture<ModalWaitlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalWaitlistComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalWaitlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
