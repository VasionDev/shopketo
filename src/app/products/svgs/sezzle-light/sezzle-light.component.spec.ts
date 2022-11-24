import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SezzleLightComponent } from './sezzle-light.component';

describe('SezzleLightComponent', () => {
  let component: SezzleLightComponent;
  let fixture: ComponentFixture<SezzleLightComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SezzleLightComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SezzleLightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
