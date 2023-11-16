import { Component, OnDestroy, OnInit } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppDataService } from 'src/app/shared/services/app-data.service';

@Component({
  selector: 'app-replay',
  templateUrl: './replay.component.html',
  styleUrls: ['./replay.component.css'],
})
export class ReplayComponent implements OnInit, OnDestroy {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  discountHeight = 0;

  constructor(private dataService: AppDataService) {}

  ngOnInit(): void {
    this.dataService.currentDiscountHeight$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((height: number) => {
        this.discountHeight = height;
      });
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
