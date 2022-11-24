import { Component, OnInit } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UserEmitterService } from 'src/app/shared/services/user-emitter.service';
import { WebsiteService } from './service/websites-service';

@Component({
  selector: 'app-websites',
  templateUrl: './websites.component.html',
  styleUrls: ['./websites.component.css'],
})
export class WebsitesComponent implements OnInit {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private userEmitterService: UserEmitterService,
    private websiteSvc: WebsiteService
  ) {}

  ngOnInit(): void {
    this.userEmitterService.getProfileObs().subscribe((x: any) => {
      if (x) {
        this.getPulseProStatus(x.id);
      }
    });
  }

  getPulseProStatus(userId: number) {
    this.websiteSvc
      .getPulseProStatus(userId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res: any) => {
        if (res.isSuccess) {
          this.websiteSvc.setUserProStatus(res.result.isPro);
        }
      });
  }
}
