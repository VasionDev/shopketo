import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalLoginConfirmationComponent } from './modal-login-confirmation.component';

describe('ModalLoginConfirmationComponent', () => {
  let component: ModalLoginConfirmationComponent;
  let fixture: ComponentFixture<ModalLoginConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalLoginConfirmationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalLoginConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
