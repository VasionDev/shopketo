import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SmartshipComponent } from './smartship.component';

describe('SmartshipComponent', () => {
  let component: SmartshipComponent;
  let fixture: ComponentFixture<SmartshipComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SmartshipComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SmartshipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
