import { AfterViewInit, Component, OnInit } from '@angular/core';
import { AppDataService } from 'src/app/shared/services/app-data.service';
declare var $: any;

@Component({
  selector: 'app-sidebar-container',
  templateUrl: './sidebar-container.component.html',
  styleUrls: ['./sidebar-container.component.css'],
})
export class SidebarContainerComponent implements AfterViewInit {
  constructor(private dataService: AppDataService) {}

  ngAfterViewInit() {
    setTimeout(() => {
      $('.drawer').drawer('softRefresh');
    }, 0);
  }

  onClickClose() {
    $('.drawer').drawer('close');
    this.dataService.changeSidebarName('');
  }
}
