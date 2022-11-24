import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResearchHomeComponent } from './research-home.component';

describe('ResearchHomeComponent', () => {
  let component: ResearchHomeComponent;
  let fixture: ComponentFixture<ResearchHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResearchHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResearchHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
