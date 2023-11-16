import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThankYouNoComponent } from './thank-you-no.component';

describe('ThankYouNoComponent', () => {
  let component: ThankYouNoComponent;
  let fixture: ComponentFixture<ThankYouNoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ThankYouNoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ThankYouNoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
