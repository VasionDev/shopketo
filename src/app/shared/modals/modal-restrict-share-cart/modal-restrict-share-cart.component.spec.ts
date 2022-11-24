import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalRestrictShareCartComponent } from './modal-restrict-share-cart.component';

describe('ModalRestrictShareCartComponent', () => {
  let component: ModalRestrictShareCartComponent;
  let fixture: ComponentFixture<ModalRestrictShareCartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalRestrictShareCartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalRestrictShareCartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
