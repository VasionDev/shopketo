import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalZipComponent } from './modal-zip.component';

describe('ModalZipComponent', () => {
  let component: ModalZipComponent;
  let fixture: ComponentFixture<ModalZipComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalZipComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalZipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
