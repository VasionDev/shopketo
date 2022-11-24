import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebsiteSettingsComponent } from './settings.component';

describe('WebsiteSettingsComponent', () => {
  let component: WebsiteSettingsComponent;
  let fixture: ComponentFixture<WebsiteSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WebsiteSettingsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WebsiteSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
