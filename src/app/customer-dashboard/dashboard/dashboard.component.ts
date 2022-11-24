import { Component, OnInit } from '@angular/core';
import { UserEmitterService } from 'src/app/shared/services/user-emitter.service';
import { NewgenApiService } from 'src/app/shared/services/newgen-api.service';
declare var tagSliderJS: any;
declare var $: any;
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  public user: any;
  public invoiceInformation: any;
  public imageCollection: Array<any> = []
  slideConfig = {
    "slidesToShow": 1, "slidesToScroll": 1
  };
  constructor(private userEmitterService: UserEmitterService, private newgenSvc: NewgenApiService) { }

  ngOnInit(): void {
    this.userEmitterService.getProfileObs().subscribe((x) => {
      this.user = x;
    });
    this.getPaymentReview();
  }

  getPaymentReview() {
    this.newgenSvc.getPaymentReview().subscribe(x => {
      this.invoiceInformation = x;
    })
  }
}
