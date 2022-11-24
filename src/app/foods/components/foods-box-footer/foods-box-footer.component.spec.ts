import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FoodsBoxFooterComponent } from './foods-box-footer.component';

describe('FoodsBoxComponent', () => {
  let component: FoodsBoxFooterComponent;
  let fixture: ComponentFixture<FoodsBoxFooterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FoodsBoxFooterComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FoodsBoxFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
