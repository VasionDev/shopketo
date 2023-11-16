import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ReplaySubject, timer } from 'rxjs';
import { map, takeWhile, finalize, takeUntil } from 'rxjs/operators';
import { AppDataService } from 'src/app/shared/services/app-data.service';
declare var $: any;
declare var tooltipJS: any;
@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.css']
})

export class TimerComponent implements OnInit, OnDestroy {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  public timeRemaining$!: any;
  @Input() cancelUntil: any;
  @Input() cancelStatus: any = 0;
  public seconds!: number;
  public selectedLanguage = '';
  public hideCounter: boolean = false;
  constructor(
    private dataService: AppDataService,
  ) { 
    this.getSelectedLanguage();
  }
  
  ngOnInit(): void {
    let endTime = Date.parse(this.cancelUntil)
    let offSet = Date.now() - endTime;
    let newDate = new Date(offSet);
    this.seconds = (newDate.getTime() / 1000) * -1;
    this.timeRemaining$ = timer(0, 1000).pipe(
      map((n: any) => (this.seconds - n) * 1000),
      takeWhile((n: any) => n >= 0),
      finalize(() => this.hideCounter = true),
    );

    this.loadTooltip();
  }

  getSelectedLanguage() {
    this.dataService.currentSelectedLanguage$
    .pipe(takeUntil(this.destroyed$))
    .subscribe((language: string) => {
      this.selectedLanguage = language;
    });
  }

  loadTooltip() {
    $(document).ready(() => {
      tooltipJS();
    });
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}
