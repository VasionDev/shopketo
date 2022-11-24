import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAccessLevelComponent } from './modal-access-level.component';

describe('ModalAccessLevelComponent', () => {
  let component: ModalAccessLevelComponent;
  let fixture: ComponentFixture<ModalAccessLevelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalAccessLevelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalAccessLevelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
