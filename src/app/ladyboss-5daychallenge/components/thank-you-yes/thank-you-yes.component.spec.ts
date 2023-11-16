import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThankYouYesComponent } from './thank-you-yes.component';

describe('ThankYouYesComponent', () => {
  let component: ThankYouYesComponent;
  let fixture: ComponentFixture<ThankYouYesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ThankYouYesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ThankYouYesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
