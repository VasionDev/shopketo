import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickieComponent } from './quickie.component';

describe('QuickieComponent', () => {
  let component: QuickieComponent;
  let fixture: ComponentFixture<QuickieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuickieComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuickieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
