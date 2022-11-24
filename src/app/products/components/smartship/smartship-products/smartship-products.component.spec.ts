import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SmartshipProductsComponent } from './smartship-products.component';

describe('SmartshipProductsComponent', () => {
  let component: SmartshipProductsComponent;
  let fixture: ComponentFixture<SmartshipProductsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SmartshipProductsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SmartshipProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
