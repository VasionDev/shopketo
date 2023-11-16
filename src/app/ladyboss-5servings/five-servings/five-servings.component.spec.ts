import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiveServingsComponent } from './five-servings.component';

describe('FiveServingsComponent', () => {
  let component: FiveServingsComponent;
  let fixture: ComponentFixture<FiveServingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FiveServingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FiveServingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
