import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromoterLadybossComponent } from './promoter-ladyboss.component';

describe('PromoterLadybossComponent', () => {
  let component: PromoterLadybossComponent;
  let fixture: ComponentFixture<PromoterLadybossComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PromoterLadybossComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PromoterLadybossComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
