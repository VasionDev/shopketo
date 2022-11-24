import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalFoodsComponent } from './modal-foods.component';

describe('ModalFoodsComponent', () => {
  let component: ModalFoodsComponent;
  let fixture: ComponentFixture<ModalFoodsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalFoodsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalFoodsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
