import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppDataServiceStub } from 'src/test/services/app-data-service-mock';

import { ConfirmCountryComponent } from './confirm-country.component';

describe('ConfirmCountryComponent', () => {
  let component: ConfirmCountryComponent;
  let fixture: ComponentFixture<ConfirmCountryComponent>;
  let dataService: AppDataService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConfirmCountryComponent],
      providers: [{ provide: AppDataService, useClass: AppDataServiceStub }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmCountryComponent);
    component = fixture.componentInstance;

    dataService = TestBed.inject(AppDataService);
  });

  it('should create', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should check all countries data in ngOnInit', () => {
    const countryData = [
      {
        id: '1',
        country: 'United States',
        country_ml:
          '{"":"","en":"United States","zh-hant":"\\u7f8e\\u570b","zh-hans":"\\u7f8e\\u56fd"}',
        country_code: 'US',
        misc: 'a:2:{s:4:"code";s:2:"US";s:11:"country_url";s:0:"";}',
        blog_id: '1',
        created_by: '1',
        created: '1471529749',
        modified: '1540537885',
        active: '1',
      },
    ];
    // const obs = cold('(a|)', { a: countryData });
    dataService.setCountries(countryData);
    fixture.detectChanges();

    // const sidebarSpy = spyOn(
    //   sidebarDataService,
    //   'currentCountries' as any
    // ).and.returnValue(obs);
    // getTestScheduler().flush();
    // fixture.detectChanges();

    expect(component.countries.length).toEqual(1);
  });
});
