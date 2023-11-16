import { Component, OnDestroy, OnInit } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppDataService } from 'src/app/shared/services/app-data.service';

@Component({
  selector: 'app-social',
  templateUrl: './social.component.html',
  styleUrls: ['./social.component.css']
})
export class SocialComponent implements OnInit, OnDestroy {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  settings = {
    facebook: '',
    instagram: '',
    twitter: '',
    youtube: '',
    tiktok: '', 
  };

  constructor(private dataService: AppDataService) { }

  ngOnInit(): void {
    this.dataService.currentProductsData$
    .pipe(takeUntil(this.destroyed$))
    .subscribe((data) => {
      if (data.generalSettings) {
        this.settings = {
          facebook: this.extractSocialSitesUsername(data.generalSettings?.facebook),
          instagram: this.extractSocialSitesUsername(data.generalSettings?.instagram),
          twitter: this.extractSocialSitesUsername(data.generalSettings?.twitter),
          youtube: this.extractSocialSitesUsername(data.generalSettings?.youtube),
          tiktok: this.extractSocialSitesUsername(data.generalSettings?.tiktok),
        }
      }
    });
  }

  extractSocialSitesUsername(url: string): string {
    if(!url) return '';
    const socialSitesUsername = url.split('/');
    return socialSitesUsername[socialSitesUsername.length - 1];
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
  
}
