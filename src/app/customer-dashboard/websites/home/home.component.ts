import { Clipboard } from '@angular/cdk/clipboard';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ReplaySubject } from 'rxjs';
import { AppCheckoutService } from 'src/app/shared/services/app-checkout.service';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { UserEmitterService } from 'src/app/shared/services/user-emitter.service';
import { environment } from 'src/environments/environment';
import { WebsiteService } from '../service/websites-service';
declare var $: any;

interface Site {
  name:
    | 'Shopketo'
    | 'Pruvitnow'
    | 'Core4'
    | 'Challenge'
    | 'Drinkyoursample'
    | 'Rebootnow';
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class WebsiteHomeComponent implements OnInit {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  user: any;
  discountHeight$ = this.dataService.currentDiscountHeight$;
  facebookId: string = environment.facebookAppId;
  isPro: boolean = false;
  clientDomain: string = environment.clientDomain;

  sites = new Map<string, Site>([]).set('shopketo.com', {
    name: 'Shopketo',
  });

  constructor(
    private userEmitterService: UserEmitterService,
    private dataService: AppDataService,
    private checkoutSvc: AppCheckoutService,
    private clipboard: Clipboard,
    private websiteSvc: WebsiteService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userEmitterService.getProfileObs().subscribe((x) => {
      this.user = x;
    });

    this.websiteSvc.userProStatus$.subscribe((status: boolean) => {
      this.isPro = status;
    });
  }

  copy() {
    this.clipboard.copy(this.user.code + '.shopketo.com');
    return false;
  }

  onClickSettings() {
    if (this.isPro) {
      this.router.navigate(['/dashboard/websites/shopketo']);
    } else {
      $('#proSubscribeModal').modal();
    }
  }

  onClickProSubscription(type: string) {
    const proSku = type === 'annual' ? 'MEM-PUL-PRO-T2:1' : 'MEM-PUL-PRO-T1:1';
    const redirectURL = this.clientDomain + '/dashboard/websites/shopketo';
    this.checkoutSvc.setSupplementsCheckoutUrl(
      this.user.code,
      'true',
      '',
      '',
      '',
      '',
      '',
      proSku,
      redirectURL
    );
  }

  redirectFacebook(link: string) {
    window.open(
      'https://www.facebook.com/dialog/share?' +
        'app_id=' +
        this.facebookId +
        '&display=popup' +
        '&href=' +
        encodeURIComponent(link) +
        '&redirect_uri=' +
        encodeURIComponent('https://' + window.location.host + '/close.html'),
      'mywin',
      'left=20,top=20,width=500,height=500,toolbar=1,resizable=0'
    );
  }

  redirectTwitter(link: string) {
    window.open(
      'https://twitter.com/intent/tweet' +
        '?url=' +
        encodeURIComponent(link) +
        '&text=' +
        encodeURIComponent(
          'I just wanted to share with you PruvIt! Please take a look ;) '
        ),
      'mywin',
      'left=20,top=20,width=500,height=500,toolbar=1,resizable=0'
    );
  }

  returnZero() {
    return 0;
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
