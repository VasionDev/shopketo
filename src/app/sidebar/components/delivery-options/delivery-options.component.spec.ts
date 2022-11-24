import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { AppDataService } from 'src/app/shared/services/app-data.service';

import { DeliveryOptionsComponent } from './delivery-options.component';

describe('DeliveryOptionsComponent', () => {
  let component: DeliveryOptionsComponent;
  let fixture: ComponentFixture<DeliveryOptionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DeliveryOptionsComponent],
      providers: [AppDataService, TranslateService],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeliveryOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
