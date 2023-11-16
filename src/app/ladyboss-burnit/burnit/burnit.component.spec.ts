import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BurnitComponent } from './burnit.component';

describe('BurnitComponent', () => {
  let component: BurnitComponent;
  let fixture: ComponentFixture<BurnitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BurnitComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BurnitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
