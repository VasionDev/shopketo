import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingCenterDetailComponent } from './detail.component';

describe('DetailComponent', () => {
  let component: TrainingCenterDetailComponent;
  let fixture: ComponentFixture<TrainingCenterDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrainingCenterDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TrainingCenterDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
