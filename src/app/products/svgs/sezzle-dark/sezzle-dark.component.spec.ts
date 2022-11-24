import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SezzleDarkComponent } from './sezzle-dark.component';

describe('SezzleDarkComponent', () => {
  let component: SezzleDarkComponent;
  let fixture: ComponentFixture<SezzleDarkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SezzleDarkComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SezzleDarkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
