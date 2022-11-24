import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingCenterHomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: TrainingCenterHomeComponent;
  let fixture: ComponentFixture<TrainingCenterHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrainingCenterHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TrainingCenterHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
