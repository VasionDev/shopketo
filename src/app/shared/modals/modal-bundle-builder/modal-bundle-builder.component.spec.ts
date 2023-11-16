import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalBundleBuilderComponent } from './modal-bundle-builder.component';

describe('ModalBundleBuilderComponent', () => {
  let component: ModalBundleBuilderComponent;
  let fixture: ComponentFixture<ModalBundleBuilderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalBundleBuilderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalBundleBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
