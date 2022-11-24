import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchBarResultsComponent } from './search-bar-results.component';

describe('SearchBarResultsComponent', () => {
  let component: SearchBarResultsComponent;
  let fixture: ComponentFixture<SearchBarResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchBarResultsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchBarResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
