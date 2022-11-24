import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SmartshipAboutComponent } from './smartship-about.component';

describe('SmartshipAboutComponent', () => {
  let component: SmartshipAboutComponent;
  let fixture: ComponentFixture<SmartshipAboutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SmartshipAboutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SmartshipAboutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
