import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpcomingSmartshipsComponent } from './upcoming-smartships.component';

describe('UpcomingSmartshipsComponent', () => {
  let component: UpcomingSmartshipsComponent;
  let fixture: ComponentFixture<UpcomingSmartshipsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpcomingSmartshipsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpcomingSmartshipsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
