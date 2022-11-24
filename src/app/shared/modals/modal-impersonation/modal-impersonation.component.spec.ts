import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalImpersonationComponent } from './modal-impersonation.component';

describe('ModalImpersonationComponent', () => {
  let component: ModalImpersonationComponent;
  let fixture: ComponentFixture<ModalImpersonationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalImpersonationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalImpersonationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
