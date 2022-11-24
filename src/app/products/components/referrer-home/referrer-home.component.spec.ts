import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferrerHomeComponent } from './referrer-home.component';

describe('ReferrerHomeComponent', () => {
  let component: ReferrerHomeComponent;
  let fixture: ComponentFixture<ReferrerHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReferrerHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReferrerHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
