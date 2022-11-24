import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, SubscriptionLike } from 'rxjs';
import { AppDataService } from '../shared/services/app-data.service';
import { Research } from './models/research.model';
import { ResearchApiService } from './services/research-api.service';
import * as researchActions from './store/research-videos.actions';
import { ResearchState } from './store/research.reducer';
import { AppUtilityService } from '../shared/services/app-utility.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-research',
  templateUrl: './research.component.html',
  styleUrls: ['./research.component.css'],
})
export class ResearchComponent implements OnInit, OnDestroy {
  selectedCountry = '';
  isLoaded = false;
  subscriptions: SubscriptionLike[] = [];

  constructor(
    private dataService: AppDataService,
    private researchApiService: ResearchApiService,
    private store: Store<ResearchState>,
    private utilityService: AppUtilityService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getResearchVideos();
  }

  getResearchVideos() {
    const country$ = this.dataService.currentSelectedCountry$;
    const language$ = this.dataService.currentSelectedLanguage$;
    const products$ = this.dataService.currentProductsData$;

    this.subscriptions.push(
      combineLatest([country$, language$, products$]).subscribe((res) => {
        const [country, language, data] = res;
        const defaultLanguage = data.productsData
          ? data.productsData.default_lang
          : 'en';

        this.selectedCountry = country;

        this.subscriptions.push(
          this.researchApiService
            .getResearchVideos(country, language, defaultLanguage)
            .subscribe((responseData: Research[]) => {
              this.store.dispatch(
                new researchActions.SetResearchVideos({
                  videos: responseData,
                })
              );

              this.setRedirectURL();
              this.isLoaded = true;
            })
        );
      })
    );
  }

  setRedirectURL() {
    this.utilityService.setRedirectURL(this.router.url, this.selectedCountry);
  }

  ngOnDestroy() {
    this.subscriptions.forEach((element) => {
      element.unsubscribe();
    });
  }
}
