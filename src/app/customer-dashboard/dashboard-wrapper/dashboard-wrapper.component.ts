import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AppDataService } from 'src/app/shared/services/app-data.service';
@Component({
  selector: 'app-dashboard-wrapper',
  templateUrl: './dashboard-wrapper.component.html',
  styleUrls: ['./dashboard-wrapper.component.css']
})
export class DashboardWrapperComponent implements OnInit {
  public hideNav: boolean = false;
  discountHeight$ = this.dataService.currentDiscountHeight$;
  constructor(private router: Router, private dataService: AppDataService) {
    router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        if (this.router.url.indexOf("/websites/") != -1 || this.router.url.indexOf("/training-center/") != -1) {
          this.hideNav = true;
        }
        else {
          this.hideNav = false;
        }
      }
    });
  }

  ngOnInit(): void {
    if (this.router.url.indexOf("/websites/") != -1 || this.router.url.indexOf("/training-center/") != -1) {
      this.hideNav = true;
    }
  }
}
