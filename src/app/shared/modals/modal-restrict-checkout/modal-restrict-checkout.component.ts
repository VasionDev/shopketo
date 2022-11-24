import { Component, OnDestroy, OnInit } from '@angular/core';
import { SubscriptionLike } from 'rxjs';
import { AppDataService } from '../../services/app-data.service';
import { AppUtilityService } from '../../services/app-utility.service';

@Component({
  selector: 'app-restrict-checkout',
  templateUrl: './modal-restrict-checkout.component.html',
  styleUrls: ['./modal-restrict-checkout.component.css'],
})
export class ModalRestrictCheckoutComponent implements OnInit, OnDestroy {
  countries: any[] = [];
  selectedCountry = {
    name: '',
    code: '',
  };
  userCountry = {
    name: '',
    code: '',
  };
  subscriptions: SubscriptionLike[] = [];

  constructor(
    private utilityService: AppUtilityService,
    private dataService: AppDataService
  ) {}

  ngOnInit(): void {
    this.getUser();
    this.getAllCountries();
  }

  getUser() {
    this.subscriptions.push(
      this.dataService.currentUserWithScopes$.subscribe((user) => {
        if (user !== null) {
          this.getUserCountry(user);
        }
      })
    );
  }

  getAllCountries() {
    this.subscriptions.push(
      this.dataService.currentCountries$.subscribe((countries: any) => {
        this.countries = countries;

        this.getSelectedCountry();
      })
    );
  }

  getSelectedCountry() {
    this.subscriptions.push(
      this.dataService.currentSelectedCountry$.subscribe((country: string) => {
        this.selectedCountry.code = country;
        this.selectedCountry.name = this.getCountryName(country);
      })
    );
  }

  private getUserCountry(user: any) {
    this.userCountry.code = user?.mvuser_country;
    this.userCountry.name = this.getCountryName(user?.mvuser_country);
  }

  private getCountryName(country: string) {
    const userCountryObj = this.countries.find(
      (c: any) => c.active === '1' && country === c.country_code
    );

    if (userCountryObj) {
      return this.utilityService.getNativeCountryName(userCountryObj, country);
    } else {
      return '';
    }
  }

  onSwitchCountry() {
    window.window.location.href =
      this.userCountry.code?.toLowerCase() !== 'us'
        ? `/${this.userCountry.code?.toLowerCase()}`
        : `/`;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscriber) => subscriber.unsubscribe());
  }
}
