import { Component, OnDestroy, OnInit } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { SubscriptionLike, combineLatest } from 'rxjs';
import { AppDataService } from '../shared/services/app-data.service';
import { AppSeoService } from '../shared/services/app-seo.service';
import { AppUtilityService } from '../shared/services/app-utility.service';
import { Research } from './models/research.model';
import { ResearchApiService } from './services/research-api.service';
import * as researchActions from './store/research-videos.actions';
import { ResearchState } from './store/research.reducer';

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
    private router: Router,
    private seoService: AppSeoService,
    private meta: Meta
  ) {}

  ngOnInit(): void {
    this.getResearchVideos();
    this.setSeo();
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

  
  setSeo() {
    this.seoService.updateTitle('Research');
    this.meta.updateTag( { property: 'og:title', content: 'Research' });
  }

  ngOnDestroy() {
    this.subscriptions.forEach((element) => {
      element.unsubscribe();
    });
  }
}
