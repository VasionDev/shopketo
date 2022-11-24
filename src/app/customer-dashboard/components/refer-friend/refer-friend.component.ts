import { Component, OnInit, OnDestroy, ChangeDetectorRef, AfterContentChecked } from '@angular/core';
import { BonusService } from 'src/app/shared/services/bonus.service';
import { UserEmitterService } from 'src/app/shared/services/user-emitter.service';
import { takeUntil } from 'rxjs/operators';
import { ReplaySubject } from 'rxjs';
import { stringify } from 'qs';
import { environment } from 'src/environments/environment';
import { Clipboard } from '@angular/cdk/clipboard';
@Component({
  selector: 'app-refer-friend',
  templateUrl: './refer-friend.component.html',
  styleUrls: ['./refer-friend.component.css']
})
export class ReferFriendComponent implements OnInit, OnDestroy {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  public user: any;
  public bonuses: Array<any> = [];
  public facebookId: string = environment.facebookAppId;
  public friendInfo: any;
  public hideWidget: boolean = false;
  public error!: string;
  public activeBonus: any = {
    title: '',
    info: {
      link: '',
      availableCredits: 0,
      totalMoneyAwarded: ''
    }
  };
  public isLoaded: boolean = false;
  public isLoadedFriend: boolean = false;
  public cardClasses: Array<string> = [
    'pink-card',
    'family-card',
    'orange-card',
    'blue-gradient-light',
    'green-gradient',
    'purple-gradient'
  ]
  constructor(private changeDetector: ChangeDetectorRef, private bonusSvc: BonusService, private userEmitterService: UserEmitterService, private clipboard: Clipboard) { }
  ngOnInit(): void {
    this.userEmitterService.getProfileObs().pipe(takeUntil(this.destroyed$)).subscribe(x => {
      this.user = x;
      if (this.user) {
        this.getBonusMeta(this.user.id);
      }
    });
  }
  getBonusMeta(userId: string) {
    this.bonusSvc.getBonusMeta(userId, "en").pipe(takeUntil(this.destroyed$)).subscribe(x => {
      this.bonuses = x.result.records;
      for (let index = 0; index < this.bonuses.length; index++) {
        const element = this.bonuses[index];
        this.getBonusInfo(this.user.id, element.id, index);
      }
    },
      err => {
        if (err.error.error.detail) {
          this.hideWidget = true;
          this.error = err.error.error.detail;
        }
      })
  }

  getBonusInfo(userId: string, productId: string, index?: number) {
    this.bonusSvc.getBonusInfo(userId, productId, "en").pipe(takeUntil(this.destroyed$)).subscribe(x => {
      this.bonuses[index!].info = x.result;
      this.isLoaded = true;
    },
      err => {
        if (err.error.error.detail) {
          this.hideWidget = true;
          this.isLoaded = true;
          this.error = err.error.error.detail;
        }
      })
  }

  copy(link: string) {
    let copy = link
    this.clipboard.copy(copy)
  }

  redirectFacebook(link: string) {
    window.open(link
      + 'app_id=' + (this.facebookId)
      + '&display=popup'
      + '&href=' + encodeURIComponent('https://' + this.user.code + '.shopketo.com')
      + '&redirect_uri=' + encodeURIComponent('https://' + window.location.host + '/close.html'),
      'mywin',
      'left=20,top=20,width=500,height=500,toolbar=1,resizable=0');
  }

  redirectTwitter(link: string) {
    window.open(
      'https://twitter.com/intent/tweet'
      + '?url=' + encodeURIComponent(link)
      + '&text=' + encodeURIComponent('I just wanted to share with you PruvIt! Please take a look ;) '),
      'mywin',
      'left=20,top=20,width=500,height=500,toolbar=1,resizable=0');
  }

  manage(bonus: any) {
    this.activeBonus = bonus;
    this.getFriends(this.user.id, bonus.id);
  }

  getFriends(userId: string, productId: string) {
    this.isLoadedFriend = false;
    this.bonusSvc.getFriends(userId, productId, "en").pipe(takeUntil(this.destroyed$)).subscribe(x => {
      this.friendInfo = x.result;
      for (let index = 0; index < this.friendInfo.friends.length; index++) {
        const element = this.friendInfo.friends[index];
        element.profile.abrv = element.profile.name.match(/\b(\w)/g);
        if (element.currentStep.status == 'kickbackAvailable') {
          let date = new Date(element.currentStep.availableTo).getTime()
          let newDate = new Date().getTime()
          let offSet = date - newDate
          let days = Math.floor(offSet / (1000 * 60 * 60 * 24))
          if (days > 7) {
            element.currentStep.class = "green"
          }
          if (days >= 1 && days <= 7) {
            element.currentStep.class = "orange"
          }
          if (days < 1) {
            element.currentStep.class = "red"
          }
        }

      }
      this.friendInfo.friends = [...this.friendInfo.friends]
      this.isLoadedFriend = true;
    },
      err => {
        if (err.error.error.detail) {
          this.hideWidget = true;
          this.error = err.error.error.detail;
        }
      })
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
