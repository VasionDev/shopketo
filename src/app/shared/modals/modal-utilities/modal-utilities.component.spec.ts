import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalUtilitiesComponent } from './modal-utilities.component';

describe('ModalPromoterComponent', () => {
  let component: ModalUtilitiesComponent;
  let fixture: ComponentFixture<ModalUtilitiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ModalUtilitiesComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalUtilitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
