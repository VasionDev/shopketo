import { Component, OnDestroy, OnInit } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'mobile-navigation',
  templateUrl: './mobile-navigation.component.html',
  styleUrls: ['./mobile-navigation.component.css'],
})
export class MobileNavigationComponent implements OnInit, OnDestroy {
  tenant!: string;
  isStaging!: boolean;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  isChampion: boolean = false;

  constructor(private dataService: AppDataService) {
    this.tenant = environment.tenant;
    this.isStaging = environment.isStaging;
  }

  ngOnInit(): void {
    this.dataService.championStatus$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((x: boolean) => {
        this.isChampion = x;
      });
  }

  onClickChampionItem() {
    const url = this.isStaging
      ? 'https://demo.ladyboss.io/#/'
      : 'https://cloud.ladyboss.io/#/';
    window.open(url, '_blank');
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
