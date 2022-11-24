import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrandBuilderComponent } from './brand-builder.component';

describe('BrandBuilderComponent', () => {
  let component: BrandBuilderComponent;
  let fixture: ComponentFixture<BrandBuilderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrandBuilderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrandBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
