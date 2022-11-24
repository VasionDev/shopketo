import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalViComponent } from './modal-vi.component';

describe('ModalViComponent', () => {
  let component: ModalViComponent;
  let fixture: ComponentFixture<ModalViComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalViComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalViComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
